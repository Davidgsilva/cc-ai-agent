"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProviderSelector({ onProviderChange, selectedProvider }) {
  // Static provider configuration - no API calls needed
  const providers = {
    availableProviders: ['openai', 'anthropic'],
    currentProvider: selectedProvider || 'openai', // Default to OpenAI
    hasOpenAI: true, // Assume both are available
    hasAnthropic: true
  };

  const handleProviderChange = (provider) => {
    onProviderChange?.(provider);
  };

  const availableProviders = providers.availableProviders;
  const currentProvider = selectedProvider || providers.currentProvider;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium">AI Provider:</span>
      
      <Select value={currentProvider} onValueChange={handleProviderChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select provider" />
        </SelectTrigger>
        <SelectContent>
          {availableProviders.map((provider) => {
            const isAvailable = provider === 'openai' ? providers.hasOpenAI : providers.hasAnthropic;
            
            return (
              <SelectItem 
                key={provider} 
                value={provider}
                disabled={!isAvailable}
              >
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
                {provider === 'openai' ? ' 🔍' : ''}
                {!isAvailable ? ' ❌' : ''}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
        {currentProvider === 'openai' ? 'Web Search' : 'Fast Response'}
      </span>
    </div>
  );
}