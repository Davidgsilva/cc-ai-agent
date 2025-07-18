import OpenAI from 'openai';
import { parseCreditsCardsFromText, enhanceCardWithWebData } from '../../../utils/cardParser.js';

// OpenAI configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize OpenAI client
let openai;

if (OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
} else {
  console.warn('OPENAI_API_KEY not found. OpenAI provider will not be available.');
}


// Create OpenAI response with web search using Responses API
export const createOpenAIResponse = async (userMessage, userPreferences = {}) => {
  if (!openai) {
    throw new Error('OpenAI client not initialized. Check OPENAI_API_KEY.');
  }

  try {
    console.log('📤 Sending request to OpenAI API:', {
      model: 'gpt-4.1',
      messageLength: userMessage.length,
      preferences: Object.keys(userPreferences).length > 0 ? 'provided' : 'none'
    });
    
    const systemPrompt = `You are an expert credit card advisor AI agent. Your role is to help users find the best credit cards based on their needs, spending patterns, and financial goals.

Key responsibilities:
1. Analyze user needs and recommend suitable credit cards
2. Use web search to find current offers, terms, and promotional bonuses
3. Compare cards across multiple criteria (rewards, APR, fees, benefits)
4. Provide personalized recommendations based on spending categories
5. Explain approval odds and requirements clearly
6. Always cite your sources when providing specific card details

User preferences: ${JSON.stringify(userPreferences)}

Guidelines:
- Always search for the most current information about credit cards
- Focus on cards that match the user's spending patterns and credit profile
- Explain both benefits and drawbacks of recommended cards
- Include specific details like APR ranges, annual fees, and reward rates
- Mention any current sign-up bonuses or promotional offers
- Be transparent about your search sources

Remember to be helpful, accurate, and unbiased in your recommendations.`;

    const response = await openai.responses.create({
      model: "gpt-4.1",
      tools: [{ 
        type: "web_search_preview",
        search_context_size: "medium"
      }],
      input: `${systemPrompt}\n\nUser request: ${userMessage}`,
    });

    console.log('✅ OpenAI API response received:', {
      outputItems: response.output?.length || 0,
      hasMessage: response.output?.some(item => item.type === 'message') || false
    });
    
    return response;
  } catch (error) {
    console.error('❌ OpenAI API error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      status: error.status
    });
    throw error;
  }
};



// Create OpenAI streaming response using Responses API
export const createOpenAIStreamingResponse = async (userMessage, userPreferences = {}) => {
  try {
    console.log('🌊 Creating OpenAI streaming response');
    const response = await createOpenAIResponse(userMessage, userPreferences);
    
    // Convert OpenAI response to streaming format compatible with current implementation
    const encoder = new TextEncoder();
    
    return new ReadableStream({
      async start(controller) {
        try {
          // Extract the text content from OpenAI response
          let responseText = '';
          
          if (response.output && response.output.length > 0) {
            const messageOutput = response.output.find(item => item.type === 'message');
            if (messageOutput && messageOutput.content && messageOutput.content.length > 0) {
              const textContent = messageOutput.content.find(content => content.type === 'output_text');
              if (textContent) {
                responseText = textContent.text;
              }
            }
          }
          
          if (!responseText) {
            console.error('❌ No text content found in OpenAI response structure:', {
              outputLength: response.output?.length,
              outputTypes: response.output?.map(item => item.type)
            });
            throw new Error('No text content found in OpenAI response');
          }
          
          console.log('📝 OpenAI response text extracted:', {
            textLength: responseText.length,
            preview: responseText.substring(0, 100) + '...'
          });

          // Stream the response in chunks to match Anthropic streaming format
          const chunkSize = 50; // Characters per chunk
          console.log(`🔄 Starting to stream ${Math.ceil(responseText.length / chunkSize)} chunks`);
          
          for (let i = 0; i < responseText.length; i += chunkSize) {
            const chunk = responseText.slice(i, i + chunkSize);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
            );
            
            // Add small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          // Parse credit cards from OpenAI response
          console.log('🔍 Parsing credit cards from OpenAI response...');
          const parsedCards = parseCreditsCardsFromText(responseText);
          
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
          
          console.log('✅ OpenAI streaming completed successfully');
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('❌ OpenAI streaming error:', {
            message: error.message,
            type: error.type,
            stack: error.stack
          });
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'OpenAI fallback error occurred. Please try again.' })}\n\n`)
          );
          controller.close();
        }
      }
    });
  } catch (error) {
    console.error('❌ OpenAI response creation error:', {
      message: error.message,
      type: error.type,
      code: error.code
    });
    throw error;
  }
};



// Export OpenAI provider information
export const getOpenAIProviderInfo = () => ({
  hasOpenAI: !!openai,
  isAvailable: !!openai
});

// Check if OpenAI is available
export const isOpenAIAvailable = () => !!openai;

export default openai;