import { NextResponse } from 'next/server';
import anthropic, { webSearchTool } from '../utils/anthropic.js';
import { validateSearchRequest, searchRateLimiter } from '../utils/validation.js';

const searchCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function POST(request) {
  try {
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    if (!searchRateLimiter.isAllowed(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { query, domains } = validateSearchRequest(body);

    const cacheKey = `${query}-${domains.join(',')}`;
    const cached = searchCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        results: cached.data,
        cached: true
      });
    }

    const searchTool = domains.length > 0 
      ? { ...webSearchTool, allowed_domains: domains }
      : webSearchTool;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      tools: [searchTool],
      messages: [
        {
          role: "user",
          content: `Search for current information about: ${query}. Focus on credit card offers, terms, and benefits. Provide a comprehensive summary with sources.`
        }
      ]
    });

    const content = response.content[0]?.text || '';
    const toolUse = response.content.find(block => block.type === 'tool_use');
    
    const results = {
      summary: content,
      query: query,
      timestamp: new Date().toISOString(),
      toolUsed: !!toolUse
    };

    searchCache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
    });

    cleanupCache();

    return NextResponse.json({
      results,
      cached: false
    });

  } catch (error) {
    console.error('Search API error:', error);
    
    if (error.message.includes('required') || error.message.includes('must be')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    );
  }
}

function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of searchCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      searchCache.delete(key);
    }
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