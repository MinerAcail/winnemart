import {  Home, Inbox, ShoppingBag } from "lucide-react"
import Request from  "../../icons/request-new.tsx"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Shop",
    url: "/shop",
    icon: ShoppingBag,
  },
  {
    title: "Job Posting",
    url: "/job",
    icon: Inbox,
  },
  {
    title: "Item Request",
    url: "/request",
    icon: Request,

  },

]

export function AppSidebar() {
  return (
    <Sidebar className={""}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={"font-bold"}>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className={" "}>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className={"text-4xl font-bold"}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
