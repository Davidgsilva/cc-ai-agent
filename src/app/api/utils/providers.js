import { getOpenAIProviderInfo, isOpenAIAvailable } from './openai.js';
import { getAnthropicProviderInfo, isAnthropicAvailable } from './anthropic.js';

// Get comprehensive provider information
export const getProviderInfo = () => {
  const openAIInfo = getOpenAIProviderInfo();
  const anthropicInfo = getAnthropicProviderInfo();
  
  return {
    currentProvider: process.env.AI_PROVIDER || 'anthropic', // Default provider from env
    availableProviders: ['openai', 'anthropic'],
    hasOpenAI: openAIInfo.hasOpenAI,
    hasAnthropic: anthropicInfo.hasAnthropic,
    openAI: openAIInfo,
    anthropic: anthropicInfo
  };
};

// Check if a specific provider is available
export const isProviderAvailable = (provider) => {
  switch (provider) {
    case 'openai':
      return isOpenAIAvailable();
    case 'anthropic':
      return isAnthropicAvailable();
    default:
      return false;
  }
};

// Get the best available provider
export const getBestAvailableProvider = (requestedProvider) => {
  // If a specific provider is requested and available, use it
  if (requestedProvider && isProviderAvailable(requestedProvider)) {
    return requestedProvider;
  }
  
  // Otherwise, fall back to the first available provider
  const providers = ['openai', 'anthropic'];
  for (const provider of providers) {
    if (isProviderAvailable(provider)) {
      return provider;
    }
  }
  
  throw new Error('No AI providers are available. Please check your API keys.');
};