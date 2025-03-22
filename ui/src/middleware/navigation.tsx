import { ApolloProvider } from "@apollo/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import Client from ".";
import HostelStoreApp from "@/app/HostelStoreApp";
import { Toaster } from "@/components/ui/sonner";
import JobPosting from "@/app/works/jobPosting";
import ErrorPage from "./routError";
import { AuthProvider } from "./context/authContext";
import ErrorLogin from "./routErrorLogin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./bar";
import { SubmitItemForm } from "@/app/userReview/submit-item-form";
import ShopItemsManager from "@/components/custom/sortCategroy/cat/cat.tsx";
import { CartProvider } from "@/hooks/CartContext";
import { VendorDashboard, VendorItems, VendorProfile } from "@/app/vendors";
import ProtectedIsAuthRoute from "./protectedIsAuth";
import { DriverOrderItems, WorkersProfile } from "@/app/driver";
import { OrderTrackingProvider } from "@/hooks/orderTrackingContext";
import { ProtectType } from "./useProtect";
import HeartbeatUpdater from "@/components/custom/nav/cheackActive";
import SocialMediaHelmet from "@/components/custom/vendors/share";
import { HelmetProvider } from "react-helmet-async";

const router = createBrowserRouter([
  { path: "/", element: <HostelStoreApp /> },
  { path: "/delivery", element: <DriverOrderItems /> },
  { path: "/request", element: <SubmitItemForm /> },
  { path: "/shop", element: <ShopItemsManager /> },
  { path: "/vendor/:Vendorid", element: <SocialMediaHelmet /> },
  { path: "/job", element: <JobPosting /> },
  {
    path: "/vendor",
    element: (
      <ProtectedIsAuthRoute
        expectedTypes={[ProtectType.vendor]}
        element={<VendorDashboard />}
      />
    ),
  },

  {
    path: "/vendoritems",
    element: (
      <ProtectedIsAuthRoute
        expectedTypes={[ProtectType.vendor]}
        element={<VendorItems />}
      />
    ),
  },

  {
    path: "/profile",
    element: (
      <ProtectedIsAuthRoute
        expectedTypes={[ProtectType.vendor]}
        element={<VendorProfile />}
      />
    ),
  },
  {
    path: "/workerprofile",
    element: (
      <ProtectedIsAuthRoute
        expectedTypes={[ProtectType.Driver]}
        element={<WorkersProfile />}
      />
    ),
  },

  { path: "/login", element: <ErrorLogin /> },

  { path: "*", element: <ErrorPage /> },
]);

export function Navigation() {
  return (
    <ApolloProvider client={Client}>
      <SidebarProvider>
        <OrderTrackingProvider>
          <AppSidebar />
          <HeartbeatUpdater />
          <CartProvider>
            <AuthProvider>
              <HelmetProvider>
                <RouterProvider router={router} />
                <Toaster />
              </HelmetProvider>
            </AuthProvider>
          </CartProvider>
        </OrderTrackingProvider>
      </SidebarProvider>
    </ApolloProvider>
  );
}
