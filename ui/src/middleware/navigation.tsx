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
import { VendorCheckOut, VendorDashboard, VendorItems, VendorProfile } from "@/app/vendors";
import ProtectedIsAuthRoute from "./protectedIsAuth";
import { DriverOrderItems, WorkersProfile } from "@/app/driver";
import { OrderTrackingProvider } from "@/hooks/orderTrackingContext";
import { ProtectType } from "./useProtect";
import HeartbeatUpdater from "@/components/custom/nav/cheackActive";
import DashboardPage from "@/app/Advertiser";
import UploadProduct from "@/app/vendors/upload";
// import VendorAvailabilityPage from "@/app/vendors/available";
// import SocialMediaHelmet from "@/components/custom/vendors/share";
// import { HelmetProvider } from "react-helmet-async";

const router = createBrowserRouter([
  { path: "/", element: <HostelStoreApp /> },
  { path: "/:vendorId", element: <HostelStoreApp /> }, // Handle route with optional vendorId
  { path: "/delivery", element: <DriverOrderItems /> },
  { path: "/request", element: <SubmitItemForm /> },
  { path: "/shop", element: <ShopItemsManager /> },
  // { path: "/vendor/:Vendorid", element: <SocialMediaHelmet /> },
  { path: "/job", element: <JobPosting /> },
  { path: "/advert", element: <DashboardPage /> },

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
    path: "/vendor/new",
    element: (
      <ProtectedIsAuthRoute
        expectedTypes={[ProtectType.vendor]}
        element={<UploadProduct />}
      />
    ),
  },
  { path: "/time", element: <VendorCheckOut /> },

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
              <RouterProvider router={router} />
              <Toaster />
            </AuthProvider>
          </CartProvider>
        </OrderTrackingProvider>
      </SidebarProvider>
    </ApolloProvider>
  );
}
