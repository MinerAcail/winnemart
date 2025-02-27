 import { ApolloProvider } from "@apollo/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import Client from "./index.";
import HostelStoreApp from "@/app/HostelStoreApp";
import { Toaster } from "@/components/ui/sonner";
import DeliveryList from "@/app/works/delivery";
import JobPosting from "@/app/works/jobPosting";
import ErrorPage from "./routError";
import { AuthProvider } from "./context/authContext";
import ProtectedIsAuthRoute from "./protectedIsAuth";
import ErrorLogin from "./routErrorLogin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./bar";
import { SubmitItemForm } from "@/app/userReview/submit-item-form";

const router = createBrowserRouter([
  { path: "/", element: <HostelStoreApp /> },
  { path: "/delivery", element: <DeliveryList /> },
  { path: "/login", element: <ErrorLogin /> },
  // { path: "/delivery", element: <ProtectedIsAuthRoute element={<DeliveryList />} /> },
  { path: "/job", element: <JobPosting /> },
  { path: "/request", element: <SubmitItemForm /> },
  { path: "*", element: <ErrorPage /> },
]);

export function Navigation() {
  return (
    <ApolloProvider client={Client}>
          <SidebarProvider>
      <AppSidebar />

      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
  </SidebarProvider>
    </ApolloProvider>
  );
}
