"use client";

import { useEffect, useRef } from "react";
import { Card, Button, Spinner } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "../../hooks/useChat";
import { usePreferences } from "../../hooks/usePreferences";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

export default function ChatInterface() {
  const { messages, isLoading, error, sendMessage, clearMessages, deleteMessage } = useChat();
  const { getPreferencesForAPI } = usePreferences();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message) => {
    const preferences = getPreferencesForAPI();
    await sendMessage(message, preferences);
  };

  const suggestionPrompts = [
    "What's the best cashback credit card for groceries?",
    "I want a travel rewards card with no annual fee",
    "Compare Chase Sapphire Preferred vs. Capital One Venture",
    "What credit cards are good for building credit?",
    "Show me business credit cards with sign-up bonuses"
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Credit Card AI Assistant
              </h2>
              <p className="text-default-500 mb-8 max-w-md mx-auto">
                Ask me anything about credit cards, rewards, or get personalized recommendations 
                based on your spending patterns and financial goals.
              </p>
              
              <div className="space-y-2 max-w-lg mx-auto">
                <p className="text-sm font-medium text-foreground mb-3">Try asking:</p>
                {suggestionPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="bordered"
                    size="sm"
                    className="w-full text-left justify-start"
                    onPress={() => handleSendMessage(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              <AnimatePresence>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onDelete={deleteMessage}
                  />
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Spinner size="sm" color="white" />
                  </div>
                  <Card className="bg-content2">
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Spinner size="sm" />
                        <span className="text-sm">Searching for the latest credit card information...</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2 bg-danger-50 border-l-4 border-danger text-danger-600"
        >
          <p className="text-sm">{error}</p>
        </motion.div>
      )}

      <div className="flex gap-2 px-4 py-2 bg-content1 border-t border-divider">
        <Button
          size="sm"
          variant="light"
          onPress={clearMessages}
          disabled={messages.length === 0}
        >
          Clear Chat
        </Button>
        <div className="flex-1" />
        <span className="text-xs text-default-400 self-center">
          {messages.length} messages
        </span>
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={!!error}
      />
    </div>
  );
}