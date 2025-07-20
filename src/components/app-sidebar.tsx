import { Calendar, Home, Inbox, Search, Settings, User2, ChevronUp, Send } from "lucide-react"
import { useState } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "./theme-toggle"
import ProviderSelector from "./ui/ProviderSelector"

interface AppSidebarProps {
  onPromptSubmit?: (prompt: string, provider: string) => void;
  selectedProvider?: string;
  isLoading?: boolean;
  onProviderChange?: (provider: string) => void;
}

export function AppSidebar({ onPromptSubmit, selectedProvider = "openai", isLoading = false, onProviderChange }: AppSidebarProps) {
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
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold">Credit Card AI</div>
          <ThemeToggle />
        </div>
        <div>
          <ProviderSelector 
            onProviderChange={onProviderChange}
            selectedProvider={selectedProvider}
          />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Ask a Question</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-3">
            <Textarea
              placeholder="What kind of credit card are you looking for?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button 
              onClick={handleSubmit} 
              disabled={!prompt.trim() || isLoading}
              className="w-full cursor-pointer"
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? "Searching..." : "Get Recommendations"}
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Suggestions</SidebarGroupLabel>
          <SidebarGroupContent>
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
      </SidebarContent>
    </Sidebar>
  )
}