"use client"
import * as React from "react"
import { Command } from "lucide-react"
import { NavChat } from "@/components/nav-chat"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "./theme-toggle"
import ProviderSelector from "./ui/ProviderSelector"

interface AppSidebarProps {
  onPromptSubmit?: (prompt: string, provider: string) => void;
  selectedProvider?: string;
  isLoading?: boolean;
  onProviderChange?: (provider: string) => void;
}

export function AppSidebar({ onPromptSubmit, selectedProvider = "openai", isLoading = false, onProviderChange, ...props }: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu className="">
          <SidebarMenuItem className="">
            <SidebarMenuButton size="lg" asChild tooltip="" className="">
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Credit Card AI</span>
                  <span className="truncate text-xs">Smart Recommendations</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center justify-between mt-4">
          <div className="flex-1">
            <ProviderSelector 
              onProviderChange={onProviderChange}
              selectedProvider={selectedProvider}
            />
          </div>
          <ThemeToggle />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="">
        <NavChat 
          onPromptSubmit={onPromptSubmit}
          selectedProvider={selectedProvider}
          isLoading={isLoading}
        />
      </SidebarContent>
      
      <SidebarFooter className="">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
