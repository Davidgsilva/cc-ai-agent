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
  max_uses: 15, // Increased for verification
  allowed_domains: [
    // Official bank websites (highest priority)
    "chase.com",
    "amex.com", 
    "discover.com",
    "capitalone.com",
    "citi.com",
    "wellsfargo.com",
    "usbank.com",
    "bankofamerica.com",
    // Major comparison sites (second priority)
    "nerdwallet.com",
    "creditkarma.com",
    "bankrate.com",
    "creditcards.com",
    "wallethub.com",
    "thepointsguy.com",
    "doctorofcredit.com",
    "creditwise.com",
    "experian.com",
    "equifax.com",
    "transunion.com"
  ]
};

// Enhanced system prompt for maximum accuracy with JSON output
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

## REQUIRED JSON OUTPUT FORMAT:
You MUST respond with a JSON object in this exact structure:

{
  "summary": "Brief summary of analysis and methodology",
  "searchMetadata": {
    "totalSearches": number,
    "sourcesConsulted": ["url1", "url2"],
    "dataFreshness": "within X days",
    "lastUpdated": "${currentDate}"
  },
  "recommendedCards": [
    {
      "rank": 1,
      "cardName": "Exact official card name",
      "issuer": "Bank name", 
      "overallScore": 9.5,
      "matchScore": 95,
      "annualFee": {
        "amount": 0,
        "waived": true,
        "details": "Waived for first year"
      },
      "aprRange": {
        "purchase": "18.99% - 26.99% Variable",
        "balanceTransfer": "18.99% - 26.99% Variable", 
        "cashAdvance": "29.99% Variable"
      },
      "rewards": {
        "structure": "cashback",
        "categories": [
          {
            "category": "Gas stations",
            "rate": 3.0,
            "cap": "$1,500 per quarter",
            "temporal": "rotating quarterly"
          }
        ],
        "baseRate": 1.0,
        "estimatedAnnualValue": 450
      },
      "signupBonus": {
        "offer": "$200 cash back",
        "requirement": "Spend $500 in first 3 months",
        "estimatedValue": 200,
        "expirationDate": null
      },
      "creditRequirement": {
        "tier": "Good to Excellent",
        "scoreRange": "670-850",
        "approvalOdds": "High"
      },
      "keyBenefits": [
        "No annual fee",
        "Rotating 5% categories", 
        "No foreign transaction fees"
      ],
      "keyDrawbacks": [
        "Must activate quarterly categories",
        "Low credit limit for new cardholders"
      ],
      "whyRecommended": "Perfect match for gas spending with no annual fee",
      "verificationDetails": {
        "confidenceScore": 9,
        "sources": ["chase.com", "nerdwallet.com"],
        "lastVerified": "${currentDate}",
        "conflictingInfo": null,
        "dataQuality": "high"
      }
    }
  ],
  "alternativeCards": [
    // Same structure as recommendedCards but for 2-3 alternative options
  ],
  "userAnalysis": {
    "creditProfile": "Analysis of user's likely credit tier",
    "spendingPattern": "Analysis of spending categories mentioned",
    "goalAlignment": "How recommendations align with stated goals",
    "recommendations": [
      "Apply for cards in order of ranking",
      "Wait 3 months between applications"
    ]
  },
  "disclaimers": [
    "All information verified as of ${currentDate}",
    "Terms subject to change - verify with issuer",
    "Approval not guaranteed and depends on creditworthiness"
  ]
}

## CONFIDENCE SCORING (1-10):
- 9-10: Verified from official bank website within 7 days
- 7-8: Verified from major comparison site within 14 days  
- 5-6: Multiple sources but some inconsistencies
- 3-4: Limited sources or data older than 30 days
- 1-2: Uncertain or conflicting information

## RANKING METHODOLOGY:
Rank cards based on:
1. Match to user preferences (40%)
2. Value proposition (30%) 
3. Approval likelihood (20%)
4. Data confidence (10%)

## USER PREFERENCES ANALYSIS:
User preferences: ${JSON.stringify(userPreferences)}

Based on these preferences, tailor your search strategy and recommendations.

Current date: ${currentDate}

IMPORTANT: Return ONLY the JSON object, no other text before or after. Ensure all JSON is valid and properly escaped.`;
};

// Parse and structure credit card data from text
const parseCardDataFromText = (text) => {
  // Extract structured data from AI response text
  // This is a placeholder - you'll need to implement based on your text parsing logic
  const cards = [];
  
  // Look for card mentions in the text
  const cardPatterns = [
    /\*\*Card Name\*\*:\s*([^\n]+)/gi,
    /\*\*([^*]+(?:Card|Credit))\*\*/gi
  ];
  
  cardPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const cardName = match[1].trim();
      if (cardName && !cards.some(c => c.cardName === cardName)) {
        cards.push({
          cardName,
          confidence: 5, // Default confidence
          rawText: text.substring(Math.max(0, match.index - 200), match.index + 200)
        });
      }
    }
  });
  
  return cards;
};

// Calculate card ranking based on user preferences
const calculateCardRanking = (cards, userPreferences) => {
  return cards.map((card, index) => {
    let matchScore = 50; // Base score
    let overallScore = 5.0; // Base overall score
    
    // Boost score based on user preferences
    if (userPreferences.creditScore) {
      const userTier = getCreditTier(userPreferences.creditScore);
      if (card.creditRequirement?.tier?.includes(userTier)) {
        matchScore += 20;
        overallScore += 1.5;
      }
    }
    
    if (userPreferences.annualFeeTolerance !== undefined) {
      const cardFee = card.annualFee?.amount || 0;
      if (cardFee <= userPreferences.annualFeeTolerance) {
        matchScore += 15;
        overallScore += 1.0;
      }
    }
    
    if (userPreferences.spendingCategories?.length > 0) {
      const categoryMatch = card.rewards?.categories?.some(cat =>
        userPreferences.spendingCategories.some(userCat =>
          cat.category.toLowerCase().includes(userCat.toLowerCase())
        )
      );
      if (categoryMatch) {
        matchScore += 25;
        overallScore += 2.0;
      }
    }
    
    return {
      ...card,
      rank: index + 1,
      matchScore: Math.min(100, matchScore),
      overallScore: Math.min(10, overallScore)
    };
  }).sort((a, b) => b.overallScore - a.overallScore)
    .map((card, index) => ({ ...card, rank: index + 1 }));
};

// Helper function to determine credit tier
const getCreditTier = (score) => {
  if (score >= 800) return 'Excellent';
  if (score >= 740) return 'Very Good';
  if (score >= 670) return 'Good';
  if (score >= 580) return 'Fair';
  return 'Poor';
};

// Create Anthropic response with JSON output
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
    
    const systemPrompt = createEnhancedSystemPrompt(userPreferences);

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

// Create structured JSON response from Anthropic
export const createAnthropicJSONResponse = async (userMessage, userPreferences = {}) => {
  try {
    console.log('🔄 Creating Anthropic JSON response');
    const response = await createAnthropicResponse(userMessage, userPreferences);
    
    // Extract text content from Anthropic response
    let responseText = '';
    if (response.content && response.content.length > 0) {
      const textContent = response.content.find(content => content.type === 'text');
      if (textContent) {
        responseText = textContent.text;
      }
    }
    
    if (!responseText) {
      throw new Error('No text content found in Anthropic response');
    }
    
    console.log('📝 Anthropic response text extracted:', {
      textLength: responseText.length,
      preview: responseText.substring(0, 200) + '...'
    });

    // Try to parse JSON response first
    let structuredResponse;
    try {
      // Look for JSON in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        structuredResponse = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully parsed JSON from Anthropic response');
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.log('⚠️ JSON parsing failed, creating structured response from text');
      
      // Fallback: create structured response from text
      const parsedCards = parseCardDataFromText(responseText);
      const rankedCards = calculateCardRanking(parsedCards, userPreferences);
      
      structuredResponse = {
        summary: "Analysis completed using text parsing fallback",
        searchMetadata: {
          totalSearches: 1,
          sourcesConsulted: ["anthropic-analysis"],
          dataFreshness: "current",
          lastUpdated: new Date().toISOString().split('T')[0]
        },
        recommendedCards: rankedCards.slice(0, 3).map(card => ({
          rank: card.rank,
          cardName: card.cardName || "Unknown Card",
          issuer: "Unknown",
          overallScore: card.overallScore,
          matchScore: card.matchScore,
          annualFee: { amount: 0, waived: false, details: "Unknown" },
          aprRange: { purchase: "Unknown", balanceTransfer: "Unknown", cashAdvance: "Unknown" },
          rewards: { structure: "unknown", categories: [], baseRate: 0, estimatedAnnualValue: 0 },
          signupBonus: { offer: "Unknown", requirement: "Unknown", estimatedValue: 0, expirationDate: null },
          creditRequirement: { tier: "Unknown", scoreRange: "Unknown", approvalOdds: "Unknown" },
          keyBenefits: ["Analysis available in full response"],
          keyDrawbacks: ["Limited structured data available"],
          whyRecommended: "Based on text analysis",
          verificationDetails: {
            confidenceScore: card.confidence || 3,
            sources: ["anthropic-text-analysis"],
            lastVerified: new Date().toISOString().split('T')[0],
            conflictingInfo: null,
            dataQuality: "medium"
          }
        })),
        alternativeCards: [],
        userAnalysis: {
          creditProfile: userPreferences.creditScore ? getCreditTier(userPreferences.creditScore) : "Unknown",
          spendingPattern: userPreferences.spendingCategories?.join(", ") || "Not specified",
          goalAlignment: "Based on available preferences",
          recommendations: ["Review full AI response for detailed analysis"]
        },
        disclaimers: [
          "Information parsed from AI response",
          "Verify all details with card issuers",
          "Terms subject to change"
        ],
        fullResponse: responseText // Include full response for reference
      };
    }

    // Validate and enhance the structured response
    if (!structuredResponse.recommendedCards) {
      structuredResponse.recommendedCards = [];
    }
    if (!structuredResponse.alternativeCards) {
      structuredResponse.alternativeCards = [];
    }

    // Add metadata
    structuredResponse.responseMetadata = {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - Date.now(), // This would be calculated properly
      userPreferences: userPreferences
    };

    console.log('✅ Structured JSON response created:', {
      recommendedCardsCount: structuredResponse.recommendedCards?.length || 0,
      alternativeCardsCount: structuredResponse.alternativeCards?.length || 0,
      hasValidStructure: !!(structuredResponse.summary && structuredResponse.searchMetadata)
    });

    return structuredResponse;

  } catch (error) {
    console.error('❌ Anthropic JSON response creation error:', {
      message: error.message,
      type: error.type
    });
    
    // Return error structure
    return {
      error: true,
      message: error.message,
      summary: "Failed to process credit card recommendations",
      searchMetadata: {
        totalSearches: 0,
        sourcesConsulted: [],
        dataFreshness: "unavailable",
        lastUpdated: new Date().toISOString().split('T')[0]
      },
      recommendedCards: [],
      alternativeCards: [],
      userAnalysis: {
        creditProfile: "Unable to analyze",
        spendingPattern: "Unable to analyze", 
        goalAlignment: "Unable to analyze",
        recommendations: ["Please try again"]
      },
      disclaimers: ["An error occurred during processing"],
      responseMetadata: {
        provider: 'anthropic',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    };
  }
};

// Export provider information
export const getAnthropicProviderInfo = () => ({
  hasAnthropic: !!anthropic,
  isAvailable: !!anthropic
});

// Check if Anthropic is available
export const isAnthropicAvailable = () => !!anthropic;

export default anthropic;