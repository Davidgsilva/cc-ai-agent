import { NextRequest, NextResponse } from 'next/server';
import anthropic, { webSearchTool, createCreditCardMessage } from '../utils/anthropic.js';
import { createOpenAIStreamingResponse } from '../utils/openai.js';
import { validateChatRequest, chatRateLimiter } from '../utils/validation.js';
import { parseCreditsCardsFromText, enhanceCardWithWebData } from '../../../utils/cardParser.js';

async function createAnthropicResponse(messages, retryCount = 0) {
  try {
    console.log('📤 Sending request to Anthropic API:', {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      messagesCount: messages.length,
      retryCount
    });
    
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      tools: [webSearchTool],
      messages: messages,
      stream: true
    });
    
    console.log('✅ Anthropic API response received successfully');
    return response;
  } catch (error) {
    if (error.error?.type === 'overloaded_error' && retryCount < 3) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
      console.log(`Anthropic overloaded, retrying in ${delay}ms (attempt ${retryCount + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return createAnthropicResponse(messages, retryCount + 1);
    }
    throw error;
  }
}

export async function POST(request) {
  try {
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    if (!chatRateLimiter.isAllowed(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, preferences } = validateChatRequest(body);

    let response;
    let isUsingOpenAI = false;

    try {
      // Try Anthropic first
      const messages = createCreditCardMessage(message, preferences);
      console.log('🎯 Using Anthropic as primary AI provider');
      response = await createAnthropicResponse(messages);
    } catch (error) {
      // If Anthropic fails with overload error after retries, use OpenAI as fallback
      if (error.error?.type === 'overloaded_error') {
        console.log('⚠️ Anthropic overloaded after retries, falling back to OpenAI');
        console.log('🔄 Switching to OpenAI API');
        try {
          response = await createOpenAIStreamingResponse(message, preferences);
          isUsingOpenAI = true;
          console.log('✅ OpenAI fallback response received successfully');
        } catch (openaiError) {
          console.error('❌ OpenAI fallback failed:', openaiError);
          console.error('OpenAI Error Details:', {
            message: openaiError.message,
            type: openaiError.type,
            code: openaiError.code
          });
          return NextResponse.json(
            { error: 'Both AI services are currently unavailable. Please try again later.' },
            { status: 503 }
          );
        }
      } else {
        // Re-throw non-overload errors
        console.error('❌ Anthropic API error (non-overload):', {
          type: error.error?.type,
          message: error.message
        });
        throw error;
      }
    }

    // If using OpenAI, return the pre-built stream
    if (isUsingOpenAI) {
      console.log('📡 Returning OpenAI streaming response');
      return new Response(response, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-AI-Provider': 'openai', // Add header to indicate fallback was used
        },
      });
    }

    // Handle Anthropic streaming response
    console.log('🌊 Starting Anthropic streaming response');
    const encoder = new TextEncoder();
    let chunkCount = 0;
    let totalTextLength = 0;
    let fullResponseText = '';
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            chunkCount++;
            
            if (chunk.type === 'content_block_delta') {
              const text = chunk.delta?.text || '';
              if (text) {
                totalTextLength += text.length;
                fullResponseText += text;
                console.log(`📝 Anthropic chunk ${chunkCount}: ${text.length} chars`);
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`)
                );
              }
            } else if (chunk.type === 'message_stop') {
              console.log(`✅ Anthropic streaming completed: ${chunkCount} chunks, ${totalTextLength} total chars`);
              
              // Parse credit cards from the full response
              console.log('🔍 Parsing credit cards from response...');
              const parsedCards = parseCreditsCardsFromText(fullResponseText);
              
              if (parsedCards.length > 0) {
                console.log(`💳 Found ${parsedCards.length} credit cards, enhancing with web data...`);
                const enhancedCards = parsedCards.map(enhanceCardWithWebData);
                
                // Send structured card data
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ 
                    type: 'cards', 
                    cards: enhancedCards 
                  })}\n\n`)
                );
              }
              
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            } else {
              console.log(`🔍 Anthropic chunk ${chunkCount}: type '${chunk.type}'`);
            }
          }
        } catch (error) {
          console.error('❌ Anthropic streaming error after', chunkCount, 'chunks:', {
            message: error.message,
            type: error.error?.type,
            totalChars: totalTextLength
          });
          
          // Handle specific Anthropic errors during streaming
          if (error.error?.type === 'overloaded_error') {
            // Try OpenAI fallback during streaming
            try {
              console.log('🔄 Anthropic streaming error, attempting OpenAI fallback');
              const fallbackStream = await createOpenAIStreamingResponse(message, preferences);
              const reader = fallbackStream.getReader();
              
              let fallbackChunks = 0;
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  console.log(`✅ OpenAI fallback streaming completed: ${fallbackChunks} chunks`);
                  break;
                }
                fallbackChunks++;
                controller.enqueue(value);
              }
            } catch (fallbackError) {
              console.error('❌ OpenAI streaming fallback failed:', {
                message: fallbackError.message,
                type: fallbackError.type
              });
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ error: 'AI services are experiencing high demand. Please try again in a moment.' })}\n\n`)
              );
            }
          } else if (error.error?.type === 'rate_limit_error') {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: 'Rate limit exceeded. Please wait before sending another message.' })}\n\n`)
            );
          } else {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: 'Stream error occurred. Please try again.' })}\n\n`)
            );
          }
          controller.close();
        }
      }
    });

    console.log('📡 Returning Anthropic streaming response');
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-AI-Provider': 'anthropic',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error.message.includes('required') || error.message.includes('must be')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error.error?.type === 'overloaded_error') {
      return NextResponse.json(
        { error: 'The AI service is experiencing high demand. Please try again in a moment.' },
        { status: 503 }
      );
    }

    if (error.error?.type === 'rate_limit_error') {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before sending another message.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}