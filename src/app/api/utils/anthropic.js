import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const webSearchTool = {
  type: "web_search_20250305",
  name: "web_search",
  max_uses: 10,
  allowed_domains: [
    "nerdwallet.com",
    "creditkarma.com",
    "bankrate.com",
    "chase.com",
    "amex.com",
    "discover.com",
    "capitalone.com",
    "citi.com",
    "wellsfargo.com",
    "usbank.com",
    "creditcards.com",
    "wallethub.com",
    "thepointsguy.com",
    "creditwise.com",
    "experian.com",
    "equifax.com",
    "transunion.com"
  ]
};

// Create Anthropic response
export const createAnthropicResponse = async (userMessage, userPreferences = {}) => {
  if (!anthropic) {
    throw new Error('Anthropic client not initialized. Check ANTHROPIC_API_KEY.');
  }

  try {
    console.log('📤 Sending request to Anthropic API:', {
      model: 'claude-3-5-sonnet-20241022',
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

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      system: systemPrompt,
      tools: [webSearchTool],
      messages: [
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    console.log('✅ Anthropic API response received:', {
      content: response.content?.length || 0,
      usage: response.usage
    });
    
    return response;
  } catch (error) {
    console.error('❌ Anthropic API error:', {
      message: error.message,
      type: error.type,
      status: error.status
    });
    throw error;
  }
};

// Create Anthropic streaming response
export const createAnthropicStreamingResponse = async (userMessage, userPreferences = {}) => {
  try {
    console.log('🌊 Creating Anthropic streaming response');
    const response = await createAnthropicResponse(userMessage, userPreferences);
    
    // Convert Anthropic response to streaming format
    const encoder = new TextEncoder();
    
    return new ReadableStream({
      async start(controller) {
        try {
          // Extract the text content from Anthropic response
          let responseText = '';
          
          if (response.content && response.content.length > 0) {
            const textContent = response.content.find(content => content.type === 'text');
            if (textContent) {
              responseText = textContent.text;
            }
          }
          
          if (!responseText) {
            console.error('❌ No text content found in Anthropic response structure:', {
              contentLength: response.content?.length,
              contentTypes: response.content?.map(item => item.type)
            });
            throw new Error('No text content found in Anthropic response');
          }
          
          console.log('📝 Anthropic response text extracted:', {
            textLength: responseText.length,
            preview: responseText.substring(0, 100) + '...'
          });

          // Stream the response in chunks
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
          
          // Parse credit cards from Anthropic response
          console.log('🔍 Parsing credit cards from Anthropic response...');
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
          
          console.log('✅ Anthropic streaming completed successfully');
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('❌ Anthropic streaming error:', {
            message: error.message,
            type: error.type,
            stack: error.stack
          });
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Anthropic fallback error occurred. Please try again.' })}\n\n`)
          );
          controller.close();
        }
      }
    });
  } catch (error) {
    console.error('❌ Anthropic response creation error:', {
      message: error.message,
      type: error.type
    });
    throw error;
  }
};

// Export Anthropic provider information
export const getAnthropicProviderInfo = () => ({
  hasAnthropic: !!anthropic,
  isAvailable: !!anthropic
});

// Check if Anthropic is available
export const isAnthropicAvailable = () => !!anthropic;

export default anthropic;