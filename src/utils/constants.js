export const CREDIT_SCORE_RANGES = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
  UNKNOWN: 'unknown'
};

export const INCOME_RANGES = {
  UNDER_30K: 'under-30k',
  '30K_50K': '30k-50k',
  '50K_75K': '50k-75k',
  '75K_100K': '75k-100k',
  '100K_150K': '100k-150k',
  '150K_PLUS': '150k-plus'
};

export const SPENDING_CATEGORIES = {
  DINING: 'dining',
  GROCERIES: 'groceries',
  GAS: 'gas',
  TRAVEL: 'travel',
  ONLINE: 'online',
  OTHER: 'other'
};

export const FINANCIAL_SITES = [
  'nerdwallet.com',
  'creditkarma.com',
  'bankrate.com',
  'chase.com',
  'amex.com',
  'discover.com',
  'capitalone.com',
  'citi.com',
  'wellsfargo.com',
  'usbank.com',
  'creditcards.com',
  'wallethub.com',
  'thepointsguy.com'
];

export const CARD_BENEFITS = [
  'Cash back',
  'Travel rewards',
  'No annual fee',
  'Airport lounge access',
  'Purchase protection',
  'Extended warranty',
  'Travel insurance',
  'Price protection',
  'Concierge service',
  'Priority boarding',
  'Free checked bags',
  'TSA PreCheck credit',
  'Global Entry credit',
  'Rental car insurance',
  'Cell phone protection'
];

export const API_ENDPOINTS = {
  CHAT: '/api/chat',
  SEARCH: '/api/search'
};

export const RATE_LIMITS = {
  CHAT: {
    MAX_REQUESTS: 10,
    WINDOW_MS: 60000
  },
  SEARCH: {
    MAX_REQUESTS: 20,
    WINDOW_MS: 60000
  }
};