"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import { usePreferences } from "@/hooks/usePreferences";
import { Chat } from "@/components/ui/chat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  selectedProvider?: string;
}

export default function ChatInterface({ selectedProvider }: ChatInterfaceProps) {
  const { messages, isLoading, error, sendMessage, clearMessages, deleteMessage } = useChat();
  const { getPreferencesForAPI } = usePreferences();
  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (
    event?: { preventDefault?: () => void },
    options?: { experimental_attachments?: FileList }
  ) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }
    
    if (!input.trim()) return;

    const preferences = getPreferencesForAPI();
    await sendMessage(input, preferences, selectedProvider);
    setInput("");
  };

  const handleAppend = (message: { role: "user"; content: string }) => {
    const preferences = getPreferencesForAPI();
    sendMessage(message.content, preferences, selectedProvider);
  };

  const suggestionPrompts = [
    "What's the best cashback credit card for groceries?",
    "I want a travel rewards card with no annual fee",
    "Compare Chase Sapphire Preferred vs. Capital One Venture",
    "What credit cards are good for building credit?",
    "Show me business credit cards with sign-up bonuses"
  ];

  // Convert our chat messages to the format expected by shadcn-chatbot-kit
  const chatMessages = messages.map((msg) => ({
    id: msg.id.toString(),
    role: msg.role as "user" | "assistant",
    content: msg.content,
    timestamp: msg.timestamp,
    cards: msg.cards || [],
  }));

  return (
    <div className="flex flex-col h-full">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2 bg-destructive/10 border-l-4 border-destructive text-destructive"
        >
          <p className="text-sm">{error}</p>
        </motion.div>
      )}

      <Chat
        className="flex-1"
        messages={chatMessages}
        handleSubmit={handleSubmit}
        input={input}
        handleInputChange={handleInputChange}
        isGenerating={isLoading}
        stop={() => {}} // TODO: Implement stop functionality
        append={handleAppend}
        setMessages={() => {}} // TODO: Implement setMessages if needed
        suggestions={suggestionPrompts}
      />

      <div className="flex gap-2 px-4 py-2 bg-background border-t">
        <Button
          size="sm"
          variant="outline"
          onClick={clearMessages}
          disabled={messages.length === 0}
        >
          Clear Chat
        </Button>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground self-center">
          {messages.length} messages
        </span>
      </div>
    </div>
  );
}