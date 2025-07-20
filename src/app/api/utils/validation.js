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

  // Enhanced validation for preferences
  const validatedPreferences = validateUserPreferences(preferences || {});

  return {
    message: message.trim(),
    preferences: validatedPreferences,
    provider: provider || null
  };
}

// Validate and structure user preferences for better AI processing
export function validateUserPreferences(preferences) {
  const validated = {};

  // Credit score validation
  if (preferences.creditScore) {
    const score = parseInt(preferences.creditScore);
    if (score >= 300 && score <= 850) {
      validated.creditScore = score;
      validated.creditTier = getCreditTier(score);
    }
  }

  // Spending categories validation
  if (preferences.spendingCategories && Array.isArray(preferences.spendingCategories)) {
    validated.spendingCategories = preferences.spendingCategories.filter(cat => 
      typeof cat === 'string' && cat.length > 0
    );
  }

  // Annual income validation
  if (preferences.annualIncome) {
    const income = parseInt(preferences.annualIncome);
    if (income > 0 && income < 10000000) { // Reasonable range
      validated.annualIncome = income;
    }
  }

  // Card type preferences
  if (preferences.cardTypes && Array.isArray(preferences.cardTypes)) {
    const validTypes = ['cashback', 'travel', 'rewards', 'business', 'secured', 'student'];
    validated.cardTypes = preferences.cardTypes.filter(type => validTypes.includes(type));
  }

  // Annual fee tolerance
  if (preferences.annualFeeTolerance !== undefined) {
    const fee = parseInt(preferences.annualFeeTolerance);
    if (fee >= 0) {
      validated.annualFeeTolerance = fee;
    }
  }

  // Monthly spending amount
  if (preferences.monthlySpending) {
    const spending = parseInt(preferences.monthlySpending);
    if (spending > 0 && spending < 100000) { // Reasonable range
      validated.monthlySpending = spending;
    }
  }

  return validated;
}

// Determine credit tier based on score
function getCreditTier(score) {
  if (score >= 800) return 'Excellent';
  if (score >= 740) return 'Very Good';
  if (score >= 670) return 'Good';
  if (score >= 580) return 'Fair';
  return 'Poor';
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

// Enhanced validation for credit card data
export function validateCreditCardData(cardData) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    confidenceScore: 5,
    dataQuality: 'medium'
  };

  // Required fields validation
  const requiredFields = ['cardName', 'issuer', 'annualFee', 'aprRange'];
  requiredFields.forEach(field => {
    if (!cardData[field]) {
      validation.errors.push(`Missing required field: ${field}`);
      validation.isValid = false;
    }
  });

  // Data range validation
  if (cardData.annualFee) {
    const fee = parseFloat(cardData.annualFee.toString().replace(/[$,]/g, ''));
    if (fee < 0 || fee > 1000) {
      validation.warnings.push(`Unusual annual fee: $${fee}`);
    }
  }

  // APR validation
  if (cardData.aprRange) {
    const aprMatch = cardData.aprRange.match(/(\d+\.?\d*)%?\s*-\s*(\d+\.?\d*)%?/);
    if (aprMatch) {
      const minAPR = parseFloat(aprMatch[1]);
      const maxAPR = parseFloat(aprMatch[2]);
      
      if (minAPR < 0 || maxAPR > 50) {
        validation.warnings.push(`Unusual APR range: ${cardData.aprRange}`);
      }
      if (minAPR > maxAPR) {
        validation.errors.push(`Invalid APR range: min (${minAPR}) > max (${maxAPR})`);
        validation.isValid = false;
      }
    }
  }

  // Rewards validation
  if (cardData.rewards) {
    if (cardData.rewards.baseRate && (cardData.rewards.baseRate < 0 || cardData.rewards.baseRate > 10)) {
      validation.warnings.push(`Unusual base reward rate: ${cardData.rewards.baseRate}`);
    }
  }

  // Source verification
  if (cardData.sources && Array.isArray(cardData.sources)) {
    const officialSources = cardData.sources.filter(source => 
      source.includes('chase.com') || 
      source.includes('amex.com') || 
      source.includes('discover.com') ||
      source.includes('capitalone.com') ||
      source.includes('citi.com')
    );
    
    if (officialSources.length > 0) {
      validation.confidenceScore += 3;
    }
    
    if (cardData.sources.length >= 2) {
      validation.confidenceScore += 1;
    }
  } else {
    validation.warnings.push('No source verification available');
  }

  // Data freshness validation
  if (cardData.lastVerified) {
    const lastVerified = new Date(cardData.lastVerified);
    const daysSinceVerification = (new Date() - lastVerified) / (1000 * 60 * 60 * 24);
    
    if (daysSinceVerification > 30) {
      validation.warnings.push(`Data is ${Math.floor(daysSinceVerification)} days old - verify current terms`);
    }
  }

  return validation;
};