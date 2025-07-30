"use client";

import { useState } from "react";
import { AppSidebar } from "../app-sidebar";
import { CreditCardResults } from "../credit-card-results";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function MainLayout() {
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleProviderChange = (provider) => {
    setSelectedProvider(provider);
  };

  const handlePromptSubmit = async (prompt, provider) => {
    console.log('🚀 [Frontend] Starting prompt submission:', { prompt, provider });
    console.log('🚀 [Frontend] Function called with:', typeof prompt, typeof provider);
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('📤 [Frontend] Sending request to chat API...');
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          provider: provider
        }),
      });

      console.log('📡 [Frontend] Response status:', response.status);
      console.log('📡 [Frontend] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is streaming or JSON
      const contentType = response.headers.get('content-type');
      console.log('📄 [Frontend] Content type:', contentType);

      // Both providers now return JSON
      console.log('📄 [Frontend] Handling JSON response...');
      const data = await response.json();
      console.log('📊 [Frontend] Parsed JSON data:', data);
      console.log('📊 [Frontend] Data type:', typeof data);
      console.log('📊 [Frontend] Has recommendedCards:', !!data.recommendedCards);
      console.log('📊 [Frontend] recommendedCards length:', data.recommendedCards?.length);
      setResults(data);
    } catch (err) {
      console.error('❌ [Frontend] Error during request:', err);
      setError(err.message || 'An error occurred while searching for credit cards');
    } finally {
      console.log('✅ [Frontend] Request completed');
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-background w-full">
      <SidebarProvider>
        <div className="flex w-full">
          {/* Sidebar Column */}
          <AppSidebar 
            onPromptSubmit={handlePromptSubmit}
            selectedProvider={selectedProvider}
            isLoading={isLoading}
            onProviderChange={handleProviderChange}
          />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Credit Card Results */}
            <main className="flex-1 flex overflow-hidden">
              <CreditCardResults 
                results={results}
                isLoading={isLoading}
                error={error}
              />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}