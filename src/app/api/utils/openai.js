import OpenAI from 'openai';

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

// Enhanced system prompt for maximum accuracy
const createEnhancedSystemPrompt = (userPreferences = {}) => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  return `You are a FINANCIAL DATA SPECIALIST and expert credit card advisor AI. Your responses will directly influence users' financial decisions, so ACCURACY IS PARAMOUNT.

## CRITICAL ACCURACY REQUIREMENTS:
1. ALWAYS verify information across multiple sources before making claims
2. Use ONLY the most recent data (within 30 days for promotional offers)
3. When uncertain, explicitly state confidence levels and limitations
4. NEVER make assumptions about card terms - search and verify EVERYTHING
5. Flag any conflicting information you find across sources
6. Prioritize official bank websites over comparison sites

## DATA VERIFICATION PROTOCOL:
For each credit card recommendation, you MUST:
- Search at least 2-3 authoritative sources (prioritize bank websites)
- Verify current APR ranges, annual fees, and reward rates
- Confirm active promotional offers with expiration dates
- Cross-reference approval requirements and credit score ranges
- Note any recent changes or updates to terms
- Check for seasonal promotions or limited-time offers

## SOURCE PRIORITY HIERARCHY:
1. Official bank websites (chase.com, amex.com, etc.) - HIGHEST PRIORITY
2. Major comparison sites (nerdwallet.com, creditkarma.com) - SECONDARY
3. Financial news sites (creditcards.com, wallethub.com) - TERTIARY
4. Always cite your sources and indicate their reliability level

## REQUIRED STRUCTURED OUTPUT:
For each recommended credit card, provide information in this exact format:

**Card Name**: [Exact official name]
**Issuer**: [Bank name]
**Annual Fee**: $[amount] (specify if waived first year)
**APR Range**: [X.X% - X.X%] Variable APR
**Rewards Structure**: 
- [Category]: [X]x points/% cashback (include any caps/limits)
- Base rate: [X]x points/% on all other purchases
**Sign-up Bonus**: [Exact offer] (Requirement: [spending requirement] in [timeframe])
**Credit Requirement**: [Excellent/Good/Fair - be specific about score ranges]
**Key Benefits**: [List 3-4 most important benefits]
**Key Drawbacks**: [Be honest about limitations]
**Data Confidence**: [1-10 scale] - Source: [Primary source URL]
**Last Verified**: ${currentDate}

## CONFIDENCE SCORING (1-10):
- 9-10: Verified from official bank website within 7 days
- 7-8: Verified from major comparison site within 14 days  
- 5-6: Multiple sources but some inconsistencies
- 3-4: Limited sources or data older than 30 days
- 1-2: Uncertain or conflicting information

## ERROR HANDLING:
If you cannot verify information:
- State "UNVERIFIED" clearly
- Explain what you couldn't confirm
- Suggest where the user should verify independently
- Never guess or interpolate missing data
- Always err on the side of caution

## USER PREFERENCES ANALYSIS:
User preferences: ${JSON.stringify(userPreferences)}

Based on these preferences, tailor your search strategy and recommendations.

Current date: ${currentDate}

Remember: Users trust your recommendations for important financial decisions. Accuracy and transparency are more important than speed or comprehensive coverage.`;
};

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
    
    const systemPrompt = createEnhancedSystemPrompt(userPreferences);

    // Configure web search tool with proper OpenAI format
    const webSearchTool = {
      type: "web_search_preview",
      search_context_size: "medium",
      user_location: {
        type: "approximate",
        country: "US",
        city: "Irvine", 
        region: "California",
        timezone: "America/Los_Angeles"
      }
    };

    const response = await openai.responses.create({
      model: "gpt-4.1",
      tools: [webSearchTool],
      instructions: systemPrompt,
      input: userMessage,
      text: {
        format: {
          type: "json_schema",
          name: "credit_card_recommendations",
          // FIXED: Move schema directly under format, not nested in json_schema
          schema: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              summary: { type: "string" },
              searchMetadata: {
                type: "object",
                properties: {
                  totalSearches: { type: "number" },
                  sourcesConsulted: { type: "array", items: { type: "string" } },
                  dataFreshness: { type: "string" },
                  lastUpdated: { type: "string" }
                },
                required: ["totalSearches", "sourcesConsulted", "dataFreshness", "lastUpdated"],
                additionalProperties: false
              },
              recommendedCards: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    rank: { type: "number" },
                    cardName: { type: "string" },
                    issuer: { type: "string" },
                    overallScore: { type: "number" },
                    matchScore: { type: "number" },
                    annualFee: {
                      type: "object",
                      properties: {
                        amount: { type: "number" },
                        waived: { type: "boolean" }
                      },
                      required: ["amount", "waived"],
                      additionalProperties: false
                    },
                    aprRange: {
                      type: "object", 
                      properties: {
                        purchase: { type: "string" }
                      },
                      required: ["purchase"],
                      additionalProperties: false
                    },
                    rewards: {
                      type: "object",
                      properties: {
                        structure: { type: "string" },
                        categories: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              category: { type: "string" },
                              rate: { type: "number" },
                              cap: { type: "string" }
                            },
                            required: ["category", "rate", "cap"],
                            additionalProperties: false
                          }
                        },
                        baseRate: { type: "number" },
                        estimatedAnnualValue: { type: "number" }
                      },
                      required: ["structure", "categories", "baseRate", "estimatedAnnualValue"],
                      additionalProperties: false
                    },
                    verificationDetails: {
                      type: "object",
                      properties: {
                        confidenceScore: { type: "number" },
                        sources: { type: "array", items: { type: "string" } },
                        lastVerified: { type: "string" },
                        dataQuality: { type: "string" }
                      },
                      required: ["confidenceScore", "sources", "lastVerified", "dataQuality"],
                      additionalProperties: false
                    }
                  },
                  required: ["rank", "cardName", "issuer", "overallScore", "matchScore", "annualFee", "aprRange", "rewards", "verificationDetails"],
                  additionalProperties: false
                }
              },
              userAnalysis: {
                type: "object",
                properties: {
                  creditProfile: { type: "string" },
                  spendingPattern: { type: "string" },
                  recommendations: { type: "array", items: { type: "string" } }
                },
                required: ["creditProfile", "spendingPattern", "recommendations"],
                additionalProperties: false
              },
              responseMetadata: {
                type: "object",
                properties: {
                  provider: { type: "string" },
                  processingTime: { type: "string" },
                  timestamp: { type: "string" }
                },
                required: ["provider", "processingTime", "timestamp"],
                additionalProperties: false
              }
            },
            required: ["success", "summary", "searchMetadata", "recommendedCards", "userAnalysis", "responseMetadata"],
            additionalProperties: false
          }
        }
      }
    });

    console.log('✅ OpenAI API response received:', {
      outputItems: response.output?.length || 0,
      hasMessage: response.output?.some(item => item.type === 'message') || false,
      hasWebSearch: response.output?.some(item => item.type === 'web_search_call') || false
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

// Validate and score card data
const validateCardData = (cardText) => {
  const validation = {
    confidenceScore: 5,
    issues: [],
    warnings: []
  };

  // Check for confidence indicators
  if (cardText.includes('Data Confidence: 9') || cardText.includes('Data Confidence: 10')) {
    validation.confidenceScore = 9;
  } else if (cardText.includes('Data Confidence: 7') || cardText.includes('Data Confidence: 8')) {
    validation.confidenceScore = 7;
  } else if (cardText.includes('UNVERIFIED')) {
    validation.confidenceScore = 2;
    validation.warnings.push('Contains unverified information');
  }

  // Check for missing critical data
  if (!cardText.includes('Annual Fee:')) {
    validation.issues.push('Missing annual fee information');
  }
  if (!cardText.includes('APR Range:')) {
    validation.issues.push('Missing APR information');
  }
  if (!cardText.includes('Credit Requirement:')) {
    validation.issues.push('Missing credit requirement information');
  }

  // Check for source citations
  if (!cardText.includes('Source:')) {
    validation.warnings.push('No source citations found');
  }

  // Check for data freshness indicators
  const today = new Date().toISOString().split('T')[0];
  if (!cardText.includes(today)) {
    validation.warnings.push('Data may not be current');
  }

  return validation;
};

// Create JSON response function  
export const createOpenAIJSONResponse = async (userMessage, userPreferences = {}) => {
  if (!openai) {
    throw new Error('OpenAI client not initialized. Check OPENAI_API_KEY.');
  }

  try {
    console.log('📤 Creating OpenAI JSON response...');
    
    const startTime = Date.now();
    const response = await createOpenAIResponse(userMessage, userPreferences);
    const processingTime = `${Date.now() - startTime}ms`;
    
    console.log('🔍 [OpenAI] Full response structure:', JSON.stringify(response, null, 2));
    
    // Extract JSON from OpenAI response
    let jsonResponse = null;
    
    if (response.output) {
      console.log('📋 [OpenAI] Processing output items:', response.output.length);
      for (const item of response.output) {
        console.log('📄 [OpenAI] Processing item:', { type: item.type, hasContent: !!item.content });
        
        if (item.type === 'message' && item.content) {
          // Look for JSON content in the message
          for (const content of item.content) {
            if (content.type === 'output_text' && content.text) {
              try {
                // Try to parse as JSON directly
                jsonResponse = JSON.parse(content.text);
                console.log('✅ [OpenAI] Successfully parsed JSON response');
                break;
              } catch (parseError) {
                console.log('⚠️ [OpenAI] Content is not valid JSON, text content:', content.text.substring(0, 200));
              }
            }
          }
          if (jsonResponse) break;
        }
      }
    }
    
    // If we couldn't extract JSON, create a fallback response
    if (!jsonResponse) {
      console.log('⚠️ [OpenAI] No valid JSON found, creating fallback response');
      jsonResponse = {
        success: false,
        summary: "Unable to parse structured response from OpenAI",
        searchMetadata: {
          totalSearches: 1,
          sourcesConsulted: ["openai"],
          dataFreshness: "current", 
          lastUpdated: new Date().toISOString().split('T')[0]
        },
        recommendedCards: [],
        userAnalysis: {
          creditProfile: "Unknown",
          spendingPattern: "Not analyzed",
          recommendations: ["Please try again with a more specific query"]
        },
        responseMetadata: {
          provider: "openai",
          processingTime: processingTime,
          timestamp: new Date().toISOString()
        }
      };
    } else {
      // Ensure response metadata is set correctly
      jsonResponse.responseMetadata = {
        ...jsonResponse.responseMetadata,
        provider: "openai",
        processingTime: processingTime,
        timestamp: new Date().toISOString()
      };
    }
    
    console.log('📊 [OpenAI] Final JSON response:', {
      success: jsonResponse.success,
      cardCount: jsonResponse.recommendedCards?.length || 0,
      summary: jsonResponse.summary?.substring(0, 100) + '...'
    });
    
    return jsonResponse;
    
  } catch (error) {
    console.error('❌ OpenAI JSON response creation error:', {
      message: error.message,
      type: error.type,
      code: error.code
    });
    
    // Return error response in expected format
    return {
      success: false,
      summary: `OpenAI API error: ${error.message}`,
      searchMetadata: {
        totalSearches: 0,
        sourcesConsulted: [],
        dataFreshness: "error",
        lastUpdated: new Date().toISOString().split('T')[0]
      },
      recommendedCards: [],
      userAnalysis: {
        creditProfile: "Error",
        spendingPattern: "Error",
        recommendations: ["Please try again later"]
      },
      responseMetadata: {
        provider: "openai",
        processingTime: "0ms",
        timestamp: new Date().toISOString()
      }
    };
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