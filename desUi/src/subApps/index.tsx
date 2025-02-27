import { Outlet } from "react-router";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "./dashboard/app-sidebar";
import RandomShapesGrid from "@/components/custom/bg";
import { Toaster } from "@/components/ui/sonner";
// import { AppSidebar } from "./app-sidebar";

export default function MainPage() {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "20rem",
            "--sidebar-width-mobile": "20rem",
          } as React.CSSProperties
        }
      >
   
  
        {/* Sidebar remains static */}
        <AppSidebar />
  
        {/* Dynamic content area */}
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 bg-white/70 backdrop-blur-md">
            <SidebarTrigger className="-ml-2" />
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-lg font-semibold">E-Commerce Dashboard</h1>
          </header>
  
          <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 bg-white/70 backdrop-blur-md rounded-lg">
               {/* Background */}
        <div className="absolute inset-0 -z-10">
          <RandomShapesGrid />
        </div>
            <Outlet />
          <Toaster />
          </div>

        </SidebarInset>
      </SidebarProvider>
    );
  }
  
