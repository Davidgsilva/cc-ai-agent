import { NextRequest, NextResponse } from 'next/server';
import { createAnthropicJSONResponse } from '../utils/anthropic.js';
import { createOpenAIJSONResponse } from '../utils/openai.js';
import { getProviderInfo, getBestAvailableProvider } from '../utils/providers.js';
import { validateChatRequest, validateCreditCardData } from '../utils/validation.js';
import { parseCreditsCardsFromText, enhanceCardWithWebData } from '../../../utils/cardParser.js';

// Enhanced AI JSON response with validation
const createAIJSONResponse = async (userMessage, userPreferences = {}, provider) => {
  console.log(`🌊 Creating JSON response with ${provider} provider`);
  console.log('🔍 User preferences:', userPreferences);
  
  let response;
  
  try {
    if (provider === 'openai') {
      response = await createOpenAIJSONResponse(userMessage, userPreferences);
    } else if (provider === 'anthropic') {
      response = await createAnthropicJSONResponse(userMessage, userPreferences);
    } else {
      throw new Error(`Unknown provider: ${provider}. Use 'openai' or 'anthropic'.`);
    }

    // Validate the response structure
    console.log('✅ AI response created successfully');
    return response;
    
  } catch (error) {
    console.error(`❌ ${provider} response creation failed:`, {
      message: error.message,
      type: error.type || 'unknown',
      code: error.code || 'unknown'
    });
    throw error;
  }
};

// Enhanced error response with more context
const createErrorResponse = (message, status, details = {}) => {
  console.error(`🚫 API Error (${status}):`, { message, details });
  
  return NextResponse.json(
    { 
      error: message,
      status,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { details })
    },
    { status }
  );
};

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    // Enhanced client identification
    const clientIP = request.ip || 
                    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    console.log('📥 Incoming chat request:', {
      clientIP,
      userAgent: userAgent.substring(0, 100),
      timestamp: new Date().toISOString()
    });

    // Rate limiting can be added here if needed
    console.log('📡 Request from client:', { clientIP });

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return createErrorResponse('Invalid JSON in request body', 400);
    }

    const { message, preferences, provider } = validateChatRequest(body);

    console.log('📝 Validated chat request:', {
      messageLength: message.length,
      preferencesProvided: Object.keys(preferences).length > 0,
      requestedProvider: provider,
      preferences: preferences
    });

    // Get provider info and determine which provider to use
    const providerInfo = getProviderInfo();
    
    console.log('🤖 Provider selection analysis:', {
      requested: provider,
      default: providerInfo.currentProvider,
      hasOpenAI: providerInfo.hasOpenAI,
      hasAnthropic: providerInfo.hasAnthropic,
      availableProviders: providerInfo.availableProviders
    });

    let usedProvider;
    let response;

    // Get the best available provider with enhanced error handling
    try {
      usedProvider = getBestAvailableProvider(provider);
      console.log(`🎯 Selected provider: ${usedProvider}`);
    } catch (providerError) {
      console.error('❌ No providers available:', {
        error: providerError.message,
        requestedProvider: provider,
        availableProviders: providerInfo.availableProviders
      });
      
      return createErrorResponse(
        'No AI providers are available. Please check configuration.',
        503,
        { 
          requestedProvider: provider,
          availableProviders: providerInfo.availableProviders
        }
      );
    }

    // Attempt primary provider with detailed error tracking
    try {
      console.log(`🎯 Attempting ${usedProvider} as primary AI provider`);
      response = await createAIJSONResponse(message, preferences, usedProvider);
      
      const responseTime = Date.now() - startTime;
      console.log('📡 Primary provider response successful:', {
        provider: usedProvider,
        responseTime: `${responseTime}ms`
      });
      
      // Both providers now return JSON
      return NextResponse.json(response, {
        headers: {
          'X-AI-Provider': usedProvider,
          'X-Response-Time': `${responseTime}ms`,
          'X-Data-Quality': 'enhanced-validation'
        },
      });
      
    } catch (primaryError) {
      console.error(`❌ Primary provider (${usedProvider}) failed:`, {
        message: primaryError.message,
        type: primaryError.error?.type,
        status: primaryError.status,
        code: primaryError.code
      });

      // Determine if we should attempt fallback
      const shouldFallback = 
        primaryError.error?.type === 'overloaded_error' || 
        primaryError.status === 503 ||
        primaryError.status === 429 ||
        primaryError.message?.includes('overload') ||
        primaryError.message?.includes('rate limit');

      if (shouldFallback) {
        // Attempt fallback provider
        const fallbackProvider = usedProvider === 'openai' ? 'anthropic' : 'openai';
        
        console.log(`⚠️ ${usedProvider} overloaded/rate limited, attempting fallback to ${fallbackProvider}`);
        
        try {
          // Verify fallback provider is available
          const fallbackAvailable = getBestAvailableProvider(fallbackProvider) === fallbackProvider;
          
          if (fallbackAvailable) {
            response = await createAIJSONResponse(message, preferences, fallbackProvider);
            
            const responseTime = Date.now() - startTime;
            console.log(`✅ ${fallbackProvider} fallback successful:`, {
              responseTime: `${responseTime}ms`,
              originalError: primaryError.message
            });
            
            // Both providers now return JSON
            return NextResponse.json(response, {
              headers: {
                'X-AI-Provider': fallbackProvider,
                'X-Fallback-Used': 'true',
                'X-Original-Provider': usedProvider,
                'X-Response-Time': `${responseTime}ms`
              },
            });
          } else {
            throw new Error(`Fallback provider ${fallbackProvider} is not available`);
          }
          
        } catch (fallbackError) {
          console.error('❌ Both AI providers failed:', {
            primary: {
              provider: usedProvider,
              error: primaryError.message,
              type: primaryError.error?.type
            },
            fallback: {
              provider: fallbackProvider,
              error: fallbackError.message,
              type: fallbackError.error?.type
            }
          });
          
          return createErrorResponse(
            'Both AI services are currently unavailable. Please try again later.',
            503,
            {
              primaryProvider: usedProvider,
              fallbackProvider: fallbackProvider,
              primaryError: primaryError.message,
              fallbackError: fallbackError.message
            }
          );
        }
      } else {
        // Re-throw non-fallback errors with enhanced context
        console.error(`❌ ${usedProvider} API error (non-fallback):`, {
          type: primaryError.error?.type,
          message: primaryError.message,
          status: primaryError.status,
          code: primaryError.code
        });
        throw primaryError;
      }
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('💥 Chat API critical error:', {
      message: error.message,
      type: error.error?.type,
      status: error.status,
      stack: error.stack,
      responseTime: `${responseTime}ms`
    });
    
    // Enhanced error categorization
    if (error.message.includes('required') || error.message.includes('must be')) {
      return createErrorResponse(error.message, 400);
    }

    if (error.error?.type === 'overloaded_error') {
      return createErrorResponse(
        'The AI service is experiencing high demand. Please try again in a moment.',
        503
      );
    }

    if (error.error?.type === 'rate_limit_error') {
      return createErrorResponse(
        'Rate limit exceeded. Please wait before sending another message.',
        429
      );
    }

    if (error.error?.type === 'invalid_request_error') {
      return createErrorResponse(
        'Invalid request format. Please check your input.',
        400
      );
    }

    if (error.status === 401 || error.message.includes('API key')) {
      return createErrorResponse(
        'Authentication failed. Please check API configuration.',
        503
      );
    }

    return createErrorResponse(
      'An unexpected error occurred. Please try again.',
      500,
      { 
        errorType: error.error?.type || 'unknown',
        responseTime: `${responseTime}ms`
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400' // 24 hours
    },
  });
}