"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import { 
  LayoutDashboardIcon, 
  UsersIcon, 
  FolderIcon, 
  DatabaseIcon, 
  FileTextIcon, 
  Settings2Icon, 
  SearchIcon, 
  MessageSquareIcon, 
  Building2Icon, 
  UserIcon, 
  CommandIcon, 
  TrendingUpIcon,
  CircleCheckIcon
} from "lucide-react"

type Role = "master_admin" | "brand_owner" | "influencer";

interface SidebarProps extends React.ComponentProps<typeof Sidebar> {
  role: Role;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function AppSidebar({ role, activeView, onViewChange, ...props }: SidebarProps) {
  const [userProfile, setUserProfile] = React.useState({
    name: "",
    email: "",
    avatar: ""
  });

  React.useEffect(() => {
    const name = localStorage.getItem("userName") || "";
    const email = localStorage.getItem("userEmail") || "";
    const avatar = localStorage.getItem("userAvatar") || "";
    setUserProfile({ name, email, avatar });
  }, []);
  
  // Custom navigation structure depending on the active user role
  const getSidebarData = () => {
    switch (role) {
      case "master_admin":
        return {
          headerTitle: "Master Admin Console",
          user: {
            name: "System Admin",
            email: "admin@influenz.com",
            avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=100",
          },
          menu: [
            { title: "Dashboard Overview", view: "overview", icon: <LayoutDashboardIcon className="size-4" /> },
            { title: "User Moderation", view: "users", icon: <UsersIcon className="size-4" /> },
            { title: "Campaign approvals", view: "campaigns", icon: <FolderIcon className="size-4" /> },
            { title: "Escrow & Wallet Payments", view: "payments", icon: <DatabaseIcon className="size-4" /> },
            { title: "Account Verifications", view: "verification", icon: <FileTextIcon className="size-4" /> },
            { title: "Metadata Settings", view: "metadata", icon: <Settings2Icon className="size-4" /> },
          ]
        };
      case "brand_owner":
        return {
          headerTitle: "Brand Dashboard",
          user: {
            name: "FitFuel Corp",
            email: "partner@fitfuel.in",
            avatar: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100",
          },
          menu: [
            { title: "Overview Statistics", view: "overview", icon: <LayoutDashboardIcon className="size-4" /> },
            { title: "Company Profile", view: "company", icon: <Building2Icon className="size-4" /> },
            { title: "Find Influencers", view: "search", icon: <SearchIcon className="size-4" /> },
            { title: "Create Campaign", view: "create_campaign", icon: <FolderIcon className="size-4" /> },
            { title: "Hires & Invites", view: "invitations", icon: <FileTextIcon className="size-4" /> },
            { title: "Active Collaborators", view: "collaborators", icon: <UsersIcon className="size-4" /> },
            { title: "Live Messaging", view: "messages", icon: <MessageSquareIcon className="size-4" /> },
            { title: "Brand Wallet & Payments", view: "payments", icon: <DatabaseIcon className="size-4" /> },
            { title: "Platform Settings", view: "settings", icon: <Settings2Icon className="size-4" /> },
          ]
        };
      case "influencer":
      default:
        return {
          headerTitle: "Influencer Portal",
          user: {
            name: "Ananya Hegde",
            email: "ananya@techcreator.com",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
          },
          menu: [
            { title: "My Analytics Hub", view: "overview", icon: <LayoutDashboardIcon className="size-4" /> },
            { title: "Profile & Portfolio", view: "profile", icon: <UserIcon className="size-4" /> },
            { title: "Explore Campaigns", view: "search_campaigns", icon: <SearchIcon className="size-4" /> },
            { title: "Applications & Invites", view: "applications", icon: <FileTextIcon className="size-4" /> },
            { title: "Active Collaborators", view: "collaborators", icon: <UsersIcon className="size-4" /> },
            { title: "Brand Chats", view: "messages", icon: <MessageSquareIcon className="size-4" /> },
            { title: "Wallet & Invoices", view: "payments", icon: <DatabaseIcon className="size-4" /> },
            { title: "Settings", view: "settings", icon: <Settings2Icon className="size-4" /> },
          ]
        };
    }
  };

  const sidebarData = getSidebarData();

  return (
    <Sidebar collapsible="offcanvas" {...props} className="border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <SidebarHeader className="border-b border-zinc-100 dark:border-zinc-800 py-4 px-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2">
              <CommandIcon className="size-5 text-zinc-900 dark:text-zinc-50" />
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Influenz</span>
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{sidebarData.headerTitle}</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">Navigation</SidebarGroupLabel>
          <SidebarGroupContent className="pt-2">
            <SidebarMenu className="space-y-1">
              {sidebarData.menu.map((item) => {
                const isActive = activeView === item.view;
                return (
                  <SidebarMenuItem key={item.view}>
                    <SidebarMenuButton 
                      tooltip={item.title} 
                      onClick={() => onViewChange(item.view)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors cursor-pointer ${
                        isActive 
                          ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 font-semibold" 
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                      }`}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-zinc-100 dark:border-zinc-800 p-4">
        <NavUser user={{
          name: userProfile.name || sidebarData.user.name,
          email: userProfile.email || sidebarData.user.email,
          avatar: userProfile.avatar || sidebarData.user.avatar
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
