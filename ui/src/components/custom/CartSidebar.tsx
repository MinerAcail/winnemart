import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "../ui/card";
import { ghSim } from "./ItemGrid";
import { Item } from "@/hooks/CartContext.tsx";

import CardReceipt, { GET_ORDER_TRACKING } from "./try";
import { useQuery } from "@apollo/client";

export interface HostelDetails {
  hostelName: string;
  phoneNumber: string;
}

export interface CartSidebarProps {
  cart: Item[];
  hostelDetails: HostelDetails;
  setHostelDetails: React.Dispatch<React.SetStateAction<HostelDetails>>;
  removeFromCart: (index: number) => void;
  placeOrder: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  hostelDetails,
  setHostelDetails,
  removeFromCart,
  placeOrder,
}) => {
  const [showReceipt, setShowReceipt] = React.useState(false);
  const rawOrderId = localStorage.getItem("foodie_last_order_id");
  const orderId = rawOrderId ? rawOrderId.replace(/^"|"$/g, "").trim() : null;
  const sanitizedOrderId = orderId && orderId.length > 0 ? orderId : null;

  const { data, error, loading } = useQuery(GET_ORDER_TRACKING, {
    variables: { orderId: sanitizedOrderId },
    skip: !sanitizedOrderId, // Skip query if orderId is null
  });

  const OrderTimestamp = localStorage.getItem("lastOrderTimestamp");
  // const orderId = localStorage.getItem("foodie_last_order_id");
  // console.log("error", error);
  // console.log("data", data);
  useEffect(() => {
    if (loading) return; // Wait for query to finish loading

    if (error) {
      console.error("GraphQL Error:", error.message);
      if (error.message.includes("no tracking cookie found")) {
        setShowReceipt(false);
      }
    } else if (data) {
      const currentTime = new Date().getTime();
      const orderTime = OrderTimestamp ? new Date(OrderTimestamp).getTime() : 0;
      const timeDifference = currentTime - orderTime;
      const oneHour = 60 * 60 * 1000;

      if (timeDifference > oneHour) {
        setShowReceipt(false);
      } else {
        setShowReceipt(true);
      }
    }

    const timer = setTimeout(() => {
      if (!sanitizedOrderId) {
        setShowReceipt(false);
        return;
      }
      if (!error) {
        setShowReceipt(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [loading, error, data, OrderTimestamp]);

  return (
    <>
      {!showReceipt ? (
        <Card className="sticky  mt-30 lg:mt-32 h-72  overflow-auto border p-1 m-4">
          <CardContent className="p-4">
            <h3 className="font-bold mb-4 flex items-center">
              <ShoppingCart className="mr-2" />
              Your Cart ({cart.length})
            </h3>

            <div className="space-y-2 mb-4">
              <Input
                placeholder="Hostel Name / Location"
                value={hostelDetails.hostelName}
                onChange={(e) =>
                  setHostelDetails((prev) => ({
                    ...prev,
                    hostelName: e.target.value,
                  }))
                }
              />

              <Input
                placeholder="Phone Number"
                value={hostelDetails.phoneNumber}
                onChange={(e) =>
                  setHostelDetails((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
              />
            </div>

            {cart.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b pb-2 mb-2"
              >
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-muted-foreground">
                    {ghSim}
                    {item.price}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeFromCart(index)}
                >
                  Remove
                </Button>
              </div>
            ))}

            {cart.length > 0 && (
              <div className="mt-4">
                <p className="font-bold text-right">
                  Total: {ghSim}
                  {cart
                    .reduce((total, item) => total + Number(item.price), 0)
                    .toFixed(2)}
                </p>

                <Button
                  onClick={placeOrder}
                  className="w-full mt-2"
                  disabled={
                    !hostelDetails.hostelName || !hostelDetails.phoneNumber
                  }
                >
                  Place Order
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <SideTabs />
      )}
    </>
  );
};

export default CartSidebar;

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MinChat from "@/app/message";
// import { CardReceipt } from "@/components/ui/card-receipt"; // Assuming this component exists

export function SideTabs() {
  const [activeTab, setActiveTab] = useState("receipt");
  const [hasNewMessage, setHasNewMessage] = useState(false);

  // This function would be called when a new message arrives
  const handleNewMessage = () => {
    if (activeTab !== "message") {
      setHasNewMessage(true);
    }
  };

  // Example: Simulate a new message every 5 seconds (remove this in production)
  useEffect(() => {
    const interval = setInterval(() => {
      handleNewMessage();
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Reset the notification when user switches to message tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "message") {
      setHasNewMessage(false);
    }
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full sticky lg:mt-32"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="receipt">Receipt</TabsTrigger>
        <TabsTrigger
          value="message"
          className={hasNewMessage ? "animate-bounce" : ""}
        >
          {hasNewMessage ? "Message 1" : "Message"}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="receipt">
        <CardReceipt />
      </TabsContent>
      <TabsContent value="message">
        <MinChat />
      </TabsContent>
    </Tabs>
  );
}
