"use client";

import { useState } from "react";
import ChatInterface from "../chat/ChatInterface";
import ProviderSelector from "../ui/ProviderSelector";

export default function MainLayout() {
  const [selectedProvider, setSelectedProvider] = useState('openai'); // Default to OpenAI

  const handleProviderChange = (provider) => {
    setSelectedProvider(provider);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Credit Card AI</h1>
            <p className="text-sm text-muted-foreground">Powered by AI with Web Search</p>
          </div>
          
          <div className="flex items-center gap-4">
            <ProviderSelector 
              onProviderChange={handleProviderChange}
              selectedProvider={selectedProvider}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <ChatInterface selectedProvider={selectedProvider} />
        </div>
      </main>

      {/* Footer can be added here if needed */}
    </div>
  );
}