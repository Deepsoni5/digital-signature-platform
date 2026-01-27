"use client"

import { Home, Users, LogOut, LayoutDashboard, FileText, MessageSquare, Activity, ShieldCheck } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
  SidebarHeader,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const items = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Documents",
    url: "/admin/documents",
    icon: FileText,
  },
  {
    title: "Messages",
    url: "/admin/messages",
    icon: MessageSquare,
  },
  {
    title: "Activity Logs",
    url: "/admin/activity",
    icon: Activity,
  },
]

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
      try {
        // 1. Clear custom session
        await fetch("/api/admin/auth/logout", { method: "POST" });
        // 2. Clear Clerk session if any
        await signOut();
      } catch (error) {
          console.error("Sign out error", error);
      } finally {
        // 3. Force hard redirect to home
        window.location.href = "/";
      }
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Admin Panel</span>
                <span className="text-xs text-muted-foreground">v1.0.0</span>
            </div>
        </div>
      </SidebarHeader>
      <Separator className="my-2" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                  >
                    <Link href={item.url} onClick={() => setOpenMobile(false)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
          <SidebarMenu>
              <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={handleSignOut}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              <Separator className="my-2" />
              <div className="flex items-center gap-3 px-2 py-2">
                 <Avatar className="h-8 w-8">
                     <AvatarImage src="" />
                     <AvatarFallback>AD</AvatarFallback>
                 </Avatar>
                 <div className="flex flex-col gap-0.5 text-sm">
                     <span className="font-medium">Administrator</span>
                     <span className="text-xs text-muted-foreground truncate max-w-[120px]">admin@esignvia.com</span>
                 </div>
              </div>
          </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
