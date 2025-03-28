import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ApolloProvider } from "@apollo/client";

import Settings from "@/subApps/settings";
import Analytics from "@/subApps/analytics";
import { Customers } from "@/subApps/customers";
import { Products } from "@/subApps/products";
import Dashboard from "@/subApps/dashboard";
import MainPage from "@/subApps";
import Client from "@/middleware";
import UploadProduct from "@/subApps/products/upload";
import { Orders } from "@/subApps/orders";
import { OrdersHistory } from "@/subApps/orders/history";
import ReviewApplicate from "@/subApps/settings/review";
import Workers from "@/subApps/settings/workers";
import { Toaster } from "@/components/ui/toaster";
import RequestItems from "@/subApps/products/requestItem";
import DragDropBoxes from "@/subApps/products/cate/index";
import ViewCate from "@/subApps/products/cate/cat/cat";
import Vendor from "@/subApps/settings/Vendors";
import AnalyticsDashbaord from "@/subApps/analytics";
function Navigation() {
  return (
    <ApolloProvider client={Client}>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />}>
            {/* Define routes for content changes */}
            <Route index path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<UploadProduct />} />
            <Route path="products/request" element={<RequestItems />} />
            <Route path="products/cate" element={<DragDropBoxes />} />
            <Route path="products/view" element={<ViewCate />} />

            <Route path="orders" element={<Orders />} />
            <Route path="history" element={<OrdersHistory />} />

            <Route path="customers" element={<Customers />} />
            <Route path="analytics" element={<AnalyticsDashbaord />} />
            <Route path="settings" element={<Settings />} />
            <Route path="review" element={<ReviewApplicate />} />
            <Route path="workers" element={<Workers />} />
            <Route path="vendors" element={<Vendor />} />

          </Route>
        </Routes>
      </Router>
      <Toaster />
    </ApolloProvider>
  );
}

export default Navigation;
