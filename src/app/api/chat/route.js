import { NextRequest, NextResponse } from 'next/server';
import { createAnthropicStreamingResponse } from '../utils/anthropic.js';
import { createOpenAIStreamingResponse } from '../utils/openai.js';
import { getProviderInfo, getBestAvailableProvider } from '../utils/providers.js';
import { validateChatRequest, chatRateLimiter } from '../utils/validation.js';
import { parseCreditsCardsFromText, enhanceCardWithWebData } from '../../../utils/cardParser.js';

// Create unified AI streaming response
const createAIStreamingResponse = async (userMessage, userPreferences = {}, provider) => {
  console.log(`🌊 Creating streaming response with ${provider} provider`);
  
  if (provider === 'openai') {
    return await createOpenAIStreamingResponse(userMessage, userPreferences);
  } else if (provider === 'anthropic') {
    return await createAnthropicStreamingResponse(userMessage, userPreferences);
  } else {
    throw new Error(`Unknown provider: ${provider}. Use 'openai' or 'anthropic'.`);
  }
};

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
    const { message, preferences, provider } = validateChatRequest(body);

    // Get provider info and determine which provider to use
    const providerInfo = getProviderInfo();
    const requestedProvider = provider;
    
    console.log('🤖 Provider selection:', {
      requested: requestedProvider,
      default: providerInfo.currentProvider,
      hasOpenAI: providerInfo.hasOpenAI,
      hasAnthropic: providerInfo.hasAnthropic
    });

    let response;
    let usedProvider;

    // Get the best available provider
    try {
      usedProvider = getBestAvailableProvider(requestedProvider);
      console.log(`🎯 Selected provider: ${usedProvider}`);
    } catch (error) {
      console.error('❌ No providers available:', error.message);
      return NextResponse.json(
        { error: 'No AI providers are available. Please check your API keys.' },
        { status: 503 }
      );
    }

    try {
      // Use the unified AI streaming response function
      console.log(`🎯 Using ${usedProvider} as AI provider`);
      response = await createAIStreamingResponse(message, preferences, usedProvider);
      
      console.log('📡 Returning AI streaming response');
      return new Response(response, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-AI-Provider': usedProvider,
        },
      });
    } catch (error) {
      // If the primary provider fails, try the fallback
      const fallbackProvider = usedProvider === 'openai' ? 'anthropic' : 'openai';
      
      if (error.error?.type === 'overloaded_error' || error.status === 503) {
        console.log(`⚠️ ${usedProvider} overloaded, falling back to ${fallbackProvider}`);
        try {
          // Check if fallback provider is available
          if (getBestAvailableProvider(fallbackProvider) === fallbackProvider) {
            response = await createAIStreamingResponse(message, preferences, fallbackProvider);
            console.log(`✅ ${fallbackProvider} fallback response received successfully`);
            
            return new Response(response, {
              headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-AI-Provider': fallbackProvider,
              },
            });
          } else {
            throw new Error(`Fallback provider ${fallbackProvider} is not available`);
          }
        } catch (fallbackError) {
          console.error('❌ Both AI providers failed:', {
            primary: error.message,
            fallback: fallbackError.message
          });
          return NextResponse.json(
            { error: 'Both AI services are currently unavailable. Please try again later.' },
            { status: 503 }
          );
        }
      } else {
        // Re-throw non-overload errors
        console.error(`❌ ${usedProvider} API error (non-overload):`, {
          type: error.error?.type,
          message: error.message
        });
        throw error;
      }
    }


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