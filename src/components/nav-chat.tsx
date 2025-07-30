"use client"

import { Send } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { ChangeEvent, KeyboardEvent } from "react"

interface NavChatProps {
  onPromptSubmit?: (prompt: string, provider: string) => void;
  selectedProvider?: string;
  isLoading?: boolean;
}

export function NavChat({ onPromptSubmit, selectedProvider = "openai", isLoading = false }: NavChatProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return;
    onPromptSubmit?.(prompt, selectedProvider);
    setPrompt("");
  };

  const suggestionPrompts = [
    "Best cashback card for groceries",
    "Travel rewards with no annual fee",
    "Compare Chase Sapphire vs Capital One",
    "Cards for building credit",
    "Business cards with sign-up bonuses"
  ];

  return (
    <>
      <SidebarGroup className="">
        <SidebarGroupLabel className="">Ask a Question</SidebarGroupLabel>
        <SidebarGroupContent className="space-y-3">
          <Textarea
            placeholder="What kind of credit card are you looking for?"
            value={prompt}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
            rows={3}
            onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className=""
          />
          <Button 
            onClick={handleSubmit} 
            disabled={!prompt.trim() || isLoading}
            className="w-full cursor-pointer"
            variant="default"
            size="default"
          >
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? "Searching..." : "Get Recommendations"}
          </Button>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="">
        <SidebarGroupLabel className="">Quick Suggestions</SidebarGroupLabel>
        <SidebarGroupContent className="">
          <div className="space-y-2">
            {suggestionPrompts.map((suggestion) => (
              <Button
                key={suggestion}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left h-auto p-2 text-xs whitespace-break-spaces cursor-pointer"
                onClick={() => setPrompt(suggestion)}
                disabled={isLoading}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}
