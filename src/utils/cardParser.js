// Utility to parse credit card information from AI responses
export function parseCreditsCardsFromText(text) {
  const cards = [];
  
  // Common patterns for credit card information
  const cardPattern = /(\d+\.?\s*)?(.+?(?:Card|Credit Card)(?:\s+from\s+.+?)?)\n/gi;
  const namePattern = /^(?:\d+\.?\s*)?(.+?(?:Card|Credit Card)(?:\s+from\s+.+?)?)$/i;
  
  // Split text into sections that might contain card information
  const sections = text.split(/\n\s*\n/);
  
  for (const section of sections) {
    const lines = section.split('\n').map(line => line.trim()).filter(line => line);
    
    // Look for card names in the first few lines
    const potentialCardLine = lines.find(line => 
      /card|credit/i.test(line) && 
      !/key|benefits|features|important|consider|recommendation/i.test(line) &&
      line.length < 100
    );
    
    if (potentialCardLine) {
      const card = parseCardFromSection(section, potentialCardLine);
      if (card.name) {
        cards.push(card);
      }
    }
  }
  
  return cards;
}

function parseCardFromSection(section, cardLine) {
  const card = {
    name: extractCardName(cardLine),
    issuer: extractIssuer(cardLine),
    annualFee: extractAnnualFee(section),
    apr: extractAPR(section),
    cashbackRate: extractCashbackRate(section),
    signupBonus: extractSignupBonus(section),
    creditScore: extractCreditScore(section),
    foreignTransaction: extractForeignTransactionFee(section),
    benefits: extractBenefits(section),
    description: extractDescription(section),
    recommended: /recommended|best|top|#1/i.test(section)
  };
  
  return card;
}

function extractCardName(line) {
  // Remove numbering and extract card name
  const match = line.match(/^(?:\d+\.?\s*)?(.+?)(?:\s+from\s+(.+?))?$/i);
  if (match) {
    return match[1].trim();
  }
  return line.replace(/^\d+\.?\s*/, '').trim();
}

function extractIssuer(line) {
  // Extract issuer from "Card from Issuer" pattern
  const match = line.match(/from\s+(.+?)(?:\s|$)/i);
  if (match) {
    return match[1].trim();
  }
  
  // Common issuer names
  const issuers = ['American Express', 'Chase', 'Capital One', 'Citi', 'Bank of America', 'Wells Fargo', 'Discover'];
  for (const issuer of issuers) {
    if (line.toLowerCase().includes(issuer.toLowerCase())) {
      return issuer;
    }
  }
  
  return 'Unknown';
}

function extractAnnualFee(section) {
  const feeMatch = section.match(/annual\s+fee[:\s]*\$?(\d+(?:,\d{3})*|\$?0|no\s+annual\s+fee|free)/i);
  if (feeMatch) {
    const fee = feeMatch[1].toLowerCase();
    if (fee === '0' || fee.includes('no') || fee.includes('free')) {
      return 0;
    }
    return parseInt(fee.replace(/[,$]/g, '')) || 0;
  }
  return null;
}

function extractAPR(section) {
  const aprMatch = section.match(/apr[:\s]*(\d+(?:\.\d+)?%?)\s*(?:[-–]\s*(\d+(?:\.\d+)?%?))?/i);
  if (aprMatch) {
    const min = parseFloat(aprMatch[1]);
    const max = aprMatch[2] ? parseFloat(aprMatch[2]) : null;
    return max ? { min, max } : min;
  }
  return null;
}

function extractCashbackRate(section) {
  const cashbackMatches = [
    section.match(/(\d+(?:\.\d+)?)%\s+(?:cash\s+)?back/gi),
    section.match(/earn\s+(?:up\s+to\s+)?(\d+(?:\.\d+)?)%/gi)
  ].flat().filter(Boolean);
  
  if (cashbackMatches.length > 0) {
    const rates = cashbackMatches.map(match => {
      const rateMatch = match.match(/(\d+(?:\.\d+)?)/);
      return rateMatch ? parseFloat(rateMatch[1]) : 0;
    }).filter(rate => rate > 0);
    
    if (rates.length === 1) {
      return rates[0];
    } else if (rates.length > 1) {
      return {
        base: Math.min(...rates),
        max: Math.max(...rates)
      };
    }
  }
  return null;
}

function extractSignupBonus(section) {
  const bonusMatch = section.match(/(?:bonus|sign-?up)[:\s]*(?:\$(\d+(?:,\d{3})*)|(\d+(?:,\d{3})*)\s+points?)/i);
  if (bonusMatch) {
    if (bonusMatch[1]) {
      return `$${bonusMatch[1]}`;
    } else if (bonusMatch[2]) {
      return `${bonusMatch[2]} points`;
    }
  }
  
  // Look for statement credit
  const creditMatch = section.match(/\$(\d+(?:,\d{3})*)\s+statement\s+credit/i);
  if (creditMatch) {
    return `$${creditMatch[1]} statement credit`;
  }
  
  return null;
}

function extractCreditScore(section) {
  const scoreMatch = section.match(/credit\s+score[:\s]*(excellent|good|fair|poor|good\s+to\s+excellent)/i);
  if (scoreMatch) {
    return scoreMatch[1];
  }
  return null;
}

function extractForeignTransactionFee(section) {
  const feeMatch = section.match(/foreign\s+transaction\s+fee[:\s]*(\d+(?:\.\d+)?%?|no\s+fee|\$?0)/i);
  if (feeMatch) {
    const fee = feeMatch[1].toLowerCase();
    if (fee.includes('no') || fee === '0') {
      return 0;
    }
    return parseFloat(fee) || null;
  }
  return null;
}

function extractBenefits(section) {
  const benefits = [];
  
  // Look for bullet points or benefits sections
  const benefitPatterns = [
    /[-•]\s*(.+)/g,
    /benefits?[:\s]*(.+?)(?:\n|$)/gi,
    /features?[:\s]*(.+?)(?:\n|$)/gi
  ];
  
  for (const pattern of benefitPatterns) {
    let match;
    while ((match = pattern.exec(section)) !== null) {
      const benefit = match[1].trim();
      if (benefit.length > 5 && benefit.length < 100) {
        benefits.push(benefit);
      }
    }
  }
  
  // Remove duplicates and return top benefits
  const uniqueBenefits = [...new Set(benefits)];
  return uniqueBenefits.slice(0, 5);
}

function extractDescription(section) {
  // Get the first substantial paragraph as description
  const lines = section.split('\n').map(line => line.trim()).filter(line => line);
  for (const line of lines) {
    if (line.length > 50 && line.length < 300 && !line.includes(':')) {
      return line;
    }
  }
  return null;
}

// Enhanced card search patterns
export function enhanceCardWithWebData(card) {
  // Generate search URLs for more information
  const searchQuery = encodeURIComponent(`${card.name} ${card.issuer} credit card`);
  
  return {
    ...card,
    searchUrl: `https://www.google.com/search?q=${searchQuery}`,
    compareUrl: `https://www.creditcards.com/credit-cards/${card.issuer?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}/`,
    image: generateCardImageUrl(card),
    applyUrl: generateApplyUrl(card)
  };
}

function generateCardImageUrl(card) {
  // Common credit card image patterns
  const issuerMap = {
    'American Express': 'amex',
    'Chase': 'chase', 
    'Capital One': 'capitalone',
    'Citi': 'citi',
    'Bank of America': 'bankofamerica',
    'Wells Fargo': 'wellsfargo',
    'Discover': 'discover'
  };
  
  const issuerCode = issuerMap[card.issuer] || 'generic';
  const cardSlug = card.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'card';
  
  // Return a placeholder or common image URL pattern
  return `https://www.creditcards.com/images/cards/${issuerCode}/${cardSlug}.png`;
}

function generateApplyUrl(card) {
  // Generate application URLs based on issuer
  const issuerUrls = {
    'American Express': 'https://www.americanexpress.com/us/credit-cards/',
    'Chase': 'https://creditcards.chase.com/',
    'Capital One': 'https://www.capitalone.com/credit-cards/',
    'Citi': 'https://www.citi.com/credit-cards/',
    'Bank of America': 'https://www.bankofamerica.com/credit-cards/',
    'Wells Fargo': 'https://www.wellsfargo.com/credit-cards/',
    'Discover': 'https://www.discover.com/credit-cards/'
  };
  
  return issuerUrls[card.issuer] || 'https://www.creditcards.com/';
}