
// HostelStoreApp.tsx
import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useDeviceType } from "@/hooks/useDeviceType";
import { gql } from "@apollo/client";
import CartSidebar from "@/components/custom/CartSidebar";
import ItemGrid from "@/components/custom/ItemGrid";
import ItemCarousel from "@/components/custom/view";
import Loading from '../components/ui/loading.tsx';
import {  useCart, Item } from "@/hooks/CartContext.tsx";
import NavBar from "./navBar.tsx";

const GET_PRODUCTS = gql`
  query getAllProducts {
    getAllProducts {
      id
      name
      price
      state
      categories
      imageUrls
    }
  }
`;

const HostelStoreContent: React.FC = () => {
  const { isDesktop } = useDeviceType();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);
  const { cart, hostelDetails, setHostelDetails, removeFromCart, addToCart, placeOrder } = useCart();

  const { data, loading, error } = useQuery(GET_PRODUCTS);

  // Load category from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category") || "All";
    setSelectedCategory(category);
  }, []);

  // Update URL when category changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Add category to URL if not "All"
    if (selectedCategory !== "All") {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }

    // Update URL without reloading the page
    const newUrl = `${window.location.pathname}${
      params.toString() ? "?" + params.toString() : ""
    }`;
    window.history.pushState({}, "", newUrl);
  }, [selectedCategory]);

  if (loading) return <Loading />;
  if (error) return <p>Error: {error.message}</p>;

  // Extract items from the fetched data
  const products: Item[] = data.getAllProducts;



  const filteredItems: Item[] = products.filter(
    (item) =>
      (selectedCategory === "All" ||
        item.categories.includes(selectedCategory)) &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="maincontainer mx-auto px-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="w-full">
          <NavBar />
          <h1 className="text-2xl font-bold mb-4">Order Receipt</h1>

          <ItemGrid
            filteredItems={filteredItems}
            addToCart={addToCart}
            onItemSelect={setSelectedProduct}
            className="grid grid-cols-1 pt-14 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
          />
          <ItemCarousel
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            addToCart={addToCart}
          />
        </div>

        {/* Cart sidebar */}
        {isDesktop && (
          <div className="w-full lg:w-1/4">
            <div className="sticky top-4">
              <CartSidebar
                cart={cart}
                hostelDetails={hostelDetails}
                setHostelDetails={setHostelDetails}
                removeFromCart={removeFromCart}
                placeOrder={placeOrder}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HostelStoreApp: React.FC = () => {
  return (

      <HostelStoreContent />
  );
};

export default HostelStoreApp;