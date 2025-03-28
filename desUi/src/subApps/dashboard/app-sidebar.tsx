
import type * as React from "react"
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart, Settings } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
const data = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Analytics",
          url: "/analytics",
        },
       
       
      ],
    },
    {
      title: "Products",
      url: "/products",
      icon: Package,
      items: [
        {
          title: "All Products",
          url: "/products",
        },
        {
          title: "Add New Product",
          url: "/products/new",
        },
        {
          title: "Categorize",
          url: "/products/cate",
        },
        {
          title: "Request items",
          url: "/products/request",
        }
       
      ],
    },
    {
      title: "Orders",
      url: "/orders",
      icon: ShoppingCart,
      items: [
        {
          title: "All Orders",
          url: "/orders",
        },
        {
          title: "History",
          url: "/history",
        }
      
      ],
    },
    {
      title: "Customers",
      url: "/customers",
      icon: Users,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      items: [
        {
          title: "Vendors",
          url: "/vendors",
        },
        {
          title: "All Works",
          url: "/workers",
        },
        {
          title: "Review Applicate",
          url: "/review",
        },
       
      
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar  {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem >
            <SidebarMenuButton size="lg" className=" w-[90%]">
              <Package className="h-6 w-6" />
              <span className="font-semibold">E-Commerce Admin</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      {/* <SidebarRail /> */}
    </Sidebar>
  )
}

