"use client"

import {
  Settings,
  LogOut,
  User2,
  ChevronUp,
} from "lucide-react"
import { useSession, signOut } from "next-auth/react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser() {
  const { data: session } = useSession()
  const { isMobile } = useSidebar()

  if (!session) {
    return null
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/splash' })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                <AvatarFallback className="rounded-lg">
                  <User2 className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {session.user?.name || session.user?.email || 'User'}
                </span>
                <span className="truncate text-xs">{session.user?.email}</span>
              </div>
              <ChevronUp className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--sidebar-width] min-w-[15rem]"
            side={isMobile ? "bottom" : "top"}
            align="end"
            sideOffset={4}>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              <div className="truncate w-full">Account Settings</div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              <div className="truncate w-full">Sign out</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
