import { ApolloProvider } from "@apollo/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import Client from ".";
import HostelStoreApp from "@/app/HostelStoreApp";
import { Toaster } from "@/components/ui/sonner";
// import DeliveryList from "@/app/works/delivery";
import JobPosting from "@/app/works/jobPosting";
import ErrorPage from "./routError";
import { AuthProvider } from "./context/authContext";
// import ProtectedIsAuthRoute from "./protectedIsAuth";
import ErrorLogin from "./routErrorLogin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./bar";
import { SubmitItemForm } from "@/app/userReview/submit-item-form";
import ShopItemsManager from "@/components/custom/sortCategroy/cat/cat.tsx";
import { CartProvider } from "@/hooks/CartContext";
import { VendorDashboard, VendorItems } from "@/app/vendors";
import ProtectedIsAuthRoute from "./protectedIsAuth";
import { DriverOrderItems } from "@/app/driver";

const router = createBrowserRouter([
  { path: "/", element: <HostelStoreApp /> },
  { path: "/delivery", element: <DriverOrderItems /> },
  // { path: "/delivery", element: <ProtectedIsAuthRoute element={<DeliveryList />} /> },
  { path: "/request", element: <SubmitItemForm /> },
  { path: "/shop", element: <ShopItemsManager /> },

  { path: "/job", element: <JobPosting /> },
  {
    path: "/vendor",
    element: (
      <ProtectedIsAuthRoute
        expectedTypes={["Vendor"]}
        element={<VendorDashboard />}
      />
    ),
  },
  {
    path: "/vendoritems",
    element: (
      <ProtectedIsAuthRoute
        expectedTypes={["Vendor"]}
        element={<VendorItems />}
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
        <AppSidebar />
        <CartProvider>
          <AuthProvider>
            <RouterProvider router={router} />
            <Toaster />
          </AuthProvider>
        </CartProvider>
      </SidebarProvider>
    </ApolloProvider>
  );
}
