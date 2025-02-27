import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useDeviceType } from "@/hooks/useDeviceType";
import MenuBar from "@/components/custom/menuBar";
import CartSidebar, { HostelDetails } from "@/components/custom/CartSidebar";
import ItemGrid from "@/components/custom/ItemGrid";
import { gql } from "@apollo/client";
import ItemCarousel from "@/components/custom/view";
import {
  CREATE_ORDER_ITEMS,
  OrderInput,
  OrderItem,
} from "@/middleware/api/createorder";
import { toast } from "sonner";

export interface Item {
  id: string;
  name: string;
  price: number;
  categories: string[];
  imageUrls: string[];
}

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

const HostelStoreApp: React.FC = () => {
  const { isDesktop } = useDeviceType();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cart, setCart] = useState<Item[]>([]);
  const [searchTerm] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);

  const [createOrder, { loading: orderLoader }] = useMutation(
    CREATE_ORDER_ITEMS,
    { refetchQueries: ["useGetordertracking"] }
  );

  // Replace the existing placeOrder function with the new async version
  const placeOrder = async (): Promise<void> => {
    if (cart.length === 0) return;

    // Group cart items by product ID and sum quantities
    const groupedItems = cart.reduce((acc: { [key: string]: number }, item) => {
      acc[item.id] = (acc[item.id] || 0) + 1;
      return acc;
    }, {});

    const orderItems: OrderItem[] = Object.entries(groupedItems).map(
      ([productId, quantity]) => ({
        ProductID: productId,
        quantity: quantity,
      })
    );

    const orderInput: OrderInput = {
      customerNumber: hostelDetails.phoneNumber,
      deliveryAddress: hostelDetails.hostelName,
      item: orderItems,
    };

    try {
      const { data } = await createOrder({
        variables: {
          input: orderInput,
        },
      });

      if (data?.createOrderItems) {
        setCart([]);
        toast.success(
          `Order placed successfully! Your order ID is: ${data.createOrderItems.id.slice(0,5)}`
        );

        // Save timestamp to localStorage
        const timestamp = new Date().toISOString();
        localStorage.setItem("lastOrderTimestamp", timestamp);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(
        "Failed to place order. Please try again.");
    }
  };
  const [hostelDetails, setHostelDetails] = useState<HostelDetails>({
    hostelName: "",
    phoneNumber: "",
  });

  const { data, loading, error } = useQuery(GET_PRODUCTS);

  // Parse URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Load cart items from URL
    const cartParam = params.get("cart");
    if (cartParam) {
      try {
        const decodedCart = JSON.parse(atob(cartParam));
        setCart(decodedCart);
      } catch (e) {
        console.error("Failed to parse cart from URL:", e);
      }
    }

    // Load hostel details from URL
    const hostelName = params.get("hostel") || "";
    const phoneNumber = params.get("room") || "";
    setHostelDetails({ hostelName, phoneNumber });

    // Load category from URL
    const category = params.get("category") || "All";
    setSelectedCategory(category);
  }, []);

  // Update URL parameters when state changes
  useEffect(() => {
    const params = new URLSearchParams();

    // Add cart to URL if not empty
    if (cart.length > 0) {
      const encodedCart = btoa(JSON.stringify(cart));
      params.set("cart", encodedCart);
    }

    // Add hostel details to URL if present
    if (hostelDetails.hostelName) {
      params.set("hostel", hostelDetails.hostelName);
    }
    if (hostelDetails.phoneNumber) {
      params.set("room", hostelDetails.phoneNumber);
    }

    // Add category to URL if not "All"
    if (selectedCategory !== "All") {
      params.set("category", selectedCategory);
    }

    // Update URL without reloading the page
    const newUrl = `${window.location.pathname}${
      params.toString() ? "?" + params.toString() : ""
    }`;
    window.history.pushState({}, "", newUrl);
  }, [cart, hostelDetails, selectedCategory]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Extract items from the fetched data
  const products: Item[] = data.getAllProducts;

  const categories: string[] = [
    "All",
    ...new Set(products.flatMap((item) => item.categories)),
  ];

  const filteredItems: Item[] = products.filter(
    (item) =>
      (selectedCategory === "All" ||
        item.categories.includes(selectedCategory)) &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (item: Item): void => {
    setCart((prevCart) => [...prevCart, item]);
  };

  const removeFromCart = (index: number): void => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      newCart.splice(index, 1);
      return newCart;
    });
  };

  return (
    <div className="maincontainer mx-auto px-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="w-full">
          <MenuBar
            CartSidebarProps={{
              cart,
              hostelDetails,
              setHostelDetails,
              removeFromCart,
              placeOrder,
            }}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
          <h1 className="text-2xl font-bold mb-4">Order Receipt</h1>

          {/* <AICardGeneration {...orderData} /> */}
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

export default HostelStoreApp;
