export function validateChatRequest(body) {
  const { message, preferences, provider } = body;

  if (!message || typeof message !== 'string') {
    throw new Error('Message is required and must be a string');
  }

  if (message.length > 2000) {
    throw new Error('Message too long (max 2000 characters)');
  }

  if (preferences && typeof preferences !== 'object') {
    throw new Error('Preferences must be an object');
  }

  if (provider && !['openai', 'anthropic'].includes(provider)) {
    throw new Error('Provider must be either "openai" or "anthropic"');
  }

  return {
    message: message.trim(),
    preferences: preferences || {},
    provider: provider || null
  };
}

export function validateSearchRequest(body) {
  const { query, domains } = body;

  if (!query || typeof query !== 'string') {
    throw new Error('Query is required and must be a string');
  }

  if (query.length > 500) {
    throw new Error('Query too long (max 500 characters)');
  }

  if (domains && !Array.isArray(domains)) {
    throw new Error('Domains must be an array');
  }

  return {
    query: query.trim(),
    domains: domains || []
  };
}

export class RateLimiter {
  constructor(maxRequests = 20, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    this.cleanup();
    return true;
  }

  cleanup() {
    const now = Date.now();
    for (const [identifier, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(
        timestamp => now - timestamp < this.windowMs
      );
      
      if (validTimestamps.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validTimestamps);
      }
    }
  }
}

export const chatRateLimiter = new RateLimiter(10, 60000);
export const searchRateLimiter = new RateLimiter(20, 60000);