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

export const createCreditCardMessage = (userMessage, userPreferences = {}) => {
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

  return [
    {
      role: "user",
      content: `${systemPrompt}\n\nUser request: ${userMessage}`
    }
  ];
};

export default anthropic;