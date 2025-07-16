export function formatCurrency(amount) {
  if (!amount || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatPercentage(rate) {
  if (!rate || isNaN(rate)) return '0%';
  return `${parseFloat(rate).toFixed(2)}%`;
}

export function calculateRewardValue(spending, rewardRate) {
  if (!spending || !rewardRate || isNaN(spending) || isNaN(rewardRate)) {
    return 0;
  }
  return (parseFloat(spending) * parseFloat(rewardRate)) / 100;
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

export function getSpendingTotal(spendingCategories) {
  if (!spendingCategories || typeof spendingCategories !== 'object') {
    return 0;
  }
  
  return Object.values(spendingCategories).reduce((total, amount) => {
    return total + (parseFloat(amount) || 0);
  }, 0);
}

export function getCreditScoreDisplay(scoreRange) {
  const scoreMap = {
    'excellent': 'Excellent (740+)',
    'good': 'Good (670-739)',
    'fair': 'Fair (580-669)',
    'poor': 'Poor (Below 580)',
    'unknown': 'Unknown'
  };
  
  return scoreMap[scoreRange] || 'Unknown';
}

export function getIncomeDisplay(incomeRange) {
  const incomeMap = {
    'under-30k': 'Under $30,000',
    '30k-50k': '$30,000 - $50,000',
    '50k-75k': '$50,000 - $75,000',
    '75k-100k': '$75,000 - $100,000',
    '100k-150k': '$100,000 - $150,000',
    '150k-plus': '$150,000+'
  };
  
  return incomeMap[incomeRange] || 'Not specified';
}

export function getRewardEstimate(spendingCategories, cardRewards) {
  if (!spendingCategories || !cardRewards) return 0;
  
  let totalRewards = 0;
  
  Object.entries(spendingCategories).forEach(([category, monthlySpend]) => {
    const spend = parseFloat(monthlySpend) || 0;
    const rate = cardRewards[category] || cardRewards.default || 1;
    totalRewards += calculateRewardValue(spend * 12, rate);
  });
  
  return totalRewards;
}

export function parseCardFromText(text) {
  const cardPatterns = [
    /(\w+\s+)?(\w+\s+)?(Preferred|Reserve|Unlimited|Freedom|Venture|Platinum|Gold|Green|Blue|Prime|Quicksilver)/i,
    /Chase\s+Sapphire/i,
    /Capital\s+One/i,
    /American\s+Express/i,
    /Discover\s+it/i
  ];
  
  for (const pattern of cardPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return null;
}

export function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}