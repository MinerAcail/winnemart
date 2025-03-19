import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useDeviceType } from "@/hooks/useDeviceType";
import { gql } from "@apollo/client";
import CartSidebar from "@/components/custom/CartSidebar";
import ItemGrid from "@/components/custom/ItemGrid";
import ItemCarousel from "@/components/custom/view";
import Loading from "../components/ui/loading.tsx";
import { useCart, Item } from "@/hooks/CartContext.tsx";
import NavBar from "./navBar.tsx";
import { ClearLocalStore } from "@/middleware/bar.tsx";
import { NoItemsFound } from "@/components/custom/Empty.tsx";

const GET_PRODUCTS = gql`
  query getAllProducts($query: String) {
    getAllProducts(query: $query) {
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
  const [searchTerm, setSearchTerm] = useState<string>(""); // Controlled search state
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);
  const {
    cart,
    hostelDetails,
    setHostelDetails,
    removeFromCart,
    addToCart,
    placeOrder,
  } = useCart();

  // Fetch products with search term
  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS, {
    variables: { query: searchTerm },
  });

  // Load category from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category") || "All";
    setSelectedCategory(category);
  }, []);

  // Update URL when category changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (selectedCategory !== "All") {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }

    const newUrl = `${window.location.pathname}${
      params.toString() ? "?" + params.toString() : ""
    }`;
    window.history.pushState({}, "", newUrl);
  }, [selectedCategory]);

  // Handle search input changes
  function handleSearch(value: string): void {
    setSearchTerm(value);
    refetch({ query: value }); // Refetch data with new search term
  }

  if (loading) return <Loading />;
  if (error) return <p>Error: {error.message}</p>;

  // Extract items from the fetched data
  const products: Item[] = data?.getAllProducts ?? [];

  // Filter products by selected category
  const filteredItems: Item[] = products.filter(
    (item) =>
      selectedCategory === "All" || item.categories.includes(selectedCategory)
  );

  return (
    <div className="maincontainer mx-auto px-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="w-full">
          <NavBar onSearch={handleSearch} />
          {/* removetodo */}
          <h1 className="text-2xl font-bold mb-4">Order Receipt</h1>
  {/* <MultipleCountdown/> */}

          {filteredItems.length === 0 ? (
            <NoItemsFound />
          ) : (
            <ItemGrid
              filteredItems={filteredItems}
              addToCart={addToCart}
              onItemSelect={setSelectedProduct}
              className="grid grid-cols-1 pt-14 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4"
              
            />
          )}
          <ItemCarousel
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            addToCart={addToCart}
          />
        </div>

        {/* Cart sidebar */}
        {filteredItems.length !== 0 && isDesktop && (
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
  const rawOrderId = localStorage.getItem("foodie_last_order_id");
  const orderId = rawOrderId ? rawOrderId.replace(/^"|"$/g, "").trim() : null;
  const sanitizedOrderId = orderId && orderId.length > 0 ? orderId : null;

  const [clearLocalStore, { data }] = useMutation(ClearLocalStore);

  useEffect(() => {
    if (!sanitizedOrderId) return;

    clearLocalStore({
      variables: { orderId: sanitizedOrderId },
    });
  }, [sanitizedOrderId, clearLocalStore]);
// console.log("data",data);

  useEffect(() => {
    if (data?.clearLocalStore) {
      localStorage.removeItem("foodie_last_order_id");
    }
  }, [data]);

  return <HostelStoreContent />;
};
export default HostelStoreApp;
