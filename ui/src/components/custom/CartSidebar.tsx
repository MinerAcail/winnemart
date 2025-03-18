import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "../ui/card";
import { ghSim } from "./ItemGrid";
import CardReceipt, { GET_ORDER_TRACKING } from "./try";
import { useQuery } from "@apollo/client";
import locations from "./sortCategroy/cat/data";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [showReceipt, setShowReceipt] = useState(false);
  const rawOrderId = localStorage.getItem("foodie_last_order_id");
  const orderId = rawOrderId ? rawOrderId.replace(/^"|"$/g, "").trim() : null;
  const sanitizedOrderId = orderId && orderId.length > 0 ? orderId : null;
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [newOrder, setNewOrder] = useState<boolean | null>(
    localStorage.getItem("new_order")
      ? JSON.parse(localStorage.getItem("new_order") as string)
      : null
  );

  // Function to update newOrder state when localStorage changes
  const updateNewOrderFromStorage = () => {
    const storedNewOrder = localStorage.getItem("new_order")
      ? JSON.parse(localStorage.getItem("new_order") as string)
      : null;
    setNewOrder(storedNewOrder);
  };

  // Listen for storage events (when localStorage changes in other tabs/windows)
  useEffect(() => {
    window.addEventListener("storage", updateNewOrderFromStorage);
    return () => {
      window.removeEventListener("storage", updateNewOrderFromStorage);
    };
  }, []);

  // Custom function to set new_order that updates both localStorage and state
  const setNewOrderValue = (value: boolean) => {
    localStorage.setItem("new_order", JSON.stringify(value));
    setNewOrder(value);
  };

  const onSuggestHandler = (text: string) => {
    setText(text);
    setSuggestions([]);
    setHostelDetails((prev) => ({ ...prev, hostelName: text }));
  };

  const onChangeHandler = (text: string) => {
    let matches: string[] = [];
    if (text.length > 0) {
      matches = locations.flatMap((location) =>
        location.areas.urban
          .map((item) => item.name)
          .filter((name) => name.toLowerCase().startsWith(text.toLowerCase()))
      );
    }
    setSuggestions(matches);
    setText(text);
    setHostelDetails((prev) => ({ ...prev, hostelName: text }));
  };

  const { data, error, loading } = useQuery(GET_ORDER_TRACKING, {
    variables: { orderId: sanitizedOrderId },
    skip: !sanitizedOrderId,
  });

  const OrderTimestamp = localStorage.getItem("lastOrderTimestamp");

  useEffect(() => {
    if (loading) return;

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

  console.log("newOrder", newOrder);
  console.log("data", data);
  return (
    <>
      {!showReceipt ? (
        <>
          {newOrder === false && (
            <CartComponent
              cart={cart}
              text={text}
              ghSim={ghSim}
              hostelDetails={hostelDetails}
              onChangeHandler={onChangeHandler}
              onSuggestHandler={onSuggestHandler}
              placeOrder={placeOrder}
              removeFromCart={removeFromCart}
              setHostelDetails={setHostelDetails}
              setSuggestions={setSuggestions}
              suggestions={suggestions}
              newOrder={newOrder}
              setNewOrderValue={setNewOrderValue}
              showReceipt={showReceipt}
            />
          )}
          {newOrder === null && (
            <>
              <CartComponent
                cart={cart}
                text={text}
                ghSim={ghSim}
                hostelDetails={hostelDetails}
                onChangeHandler={onChangeHandler}
                onSuggestHandler={onSuggestHandler}
                placeOrder={placeOrder}
                removeFromCart={removeFromCart}
                setHostelDetails={setHostelDetails}
                setSuggestions={setSuggestions}
                suggestions={suggestions}
                newOrder={newOrder}
                setNewOrderValue={setNewOrderValue}
                showReceipt={showReceipt}
              />
            </>
          )}
          {newOrder === true && (
            <CartComponent
              cart={cart}
              text={text}
              ghSim={ghSim}
              hostelDetails={hostelDetails}
              onChangeHandler={onChangeHandler}
              onSuggestHandler={onSuggestHandler}
              placeOrder={placeOrder}
              removeFromCart={removeFromCart}
              setHostelDetails={setHostelDetails}
              setSuggestions={setSuggestions}
              suggestions={suggestions}
              newOrder={newOrder}
              setNewOrderValue={setNewOrderValue}
              showReceipt={showReceipt}
            />
          )}
        </>
      ) : (
        <>
          {newOrder === false && (
            <>
              <SideTabs
                newOrder={newOrder}
                setNewOrderValue={setNewOrderValue}
              />
            </>
          )}

          {newOrder === null && (
            <>
              <SideTabs
                newOrder={newOrder}
                setNewOrderValue={setNewOrderValue}
              />
            </>
          )}
          {newOrder === true && (
            <>
              <CartComponent
                cart={cart}
                text={text}
                ghSim={ghSim}
                hostelDetails={hostelDetails}
                onChangeHandler={onChangeHandler}
                onSuggestHandler={onSuggestHandler}
                placeOrder={placeOrder}
                removeFromCart={removeFromCart}
                setHostelDetails={setHostelDetails}
                setSuggestions={setSuggestions}
                suggestions={suggestions}
                newOrder={newOrder}
                setNewOrderValue={setNewOrderValue}
                showReceipt={showReceipt}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default CartSidebar;

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MinChat from "@/app/message";
import { Item } from "@/hooks/CartContext";
// import { Trigger } from "@radix-ui/react-tabs";

export function SideTabs({
  newOrder,
  setNewOrderValue,
}: {
  newOrder: boolean | null;
  setNewOrderValue: (value: boolean) => void;
}) {

  const [activeTab, setActiveTab] = useState("receipt");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sticky lg:mt-32">

      <TabsList className="grid w-full grid-cols-2">
        {/* <TabsTrigger value="add">Add</TabsTrigger> */}
        <TabsTrigger value="receipt">Receipt</TabsTrigger>
        <TabsTrigger value="message">Message</TabsTrigger>
      </TabsList>

      <TabsContent value="receipt">
        <CardReceipt 
        // showReceipt={showReceipt}
         newOrder={!!newOrder} 
         setNewOrderValue={setNewOrderValue} 
         setActiveTab={setActiveTab}  // Pass activeTab handler
         setSelectedOrderId={setSelectedOrderId}  // Pass selected order handler
         />
      </TabsContent>
      <TabsContent value="message">
        <MinChat id={selectedOrderId} />
      </TabsContent>
    </Tabs>
  );
}

const CartComponent = ({
  cart,
  text,
  suggestions,
  hostelDetails,
  ghSim,
  onChangeHandler,
  onSuggestHandler,
  setHostelDetails,
  removeFromCart,
  placeOrder,
  setSuggestions,
  setNewOrderValue,
  newOrder,
  showReceipt,
}: {
  cart: Item[];
  text: string;
  suggestions: string[];
  ghSim: string;
  onChangeHandler: (text: string) => void;
  onSuggestHandler: (text: string) => void;
  setHostelDetails: React.Dispatch<React.SetStateAction<HostelDetails>>;
  removeFromCart: (index: number) => void;
  placeOrder: () => void;
  setSuggestions: React.Dispatch<React.SetStateAction<string[]>>;
  newOrder: boolean | null;
  setNewOrderValue: (value: boolean) => void;
  hostelDetails: HostelDetails;
  showReceipt: boolean | null;
}) => {
  return (
    <Card className="sticky mt-30 lg:mt-32 h-72 overflow-auto border p-1 m-4">
      <CardContent className="p-4">
        <div className="flex justify-between">
          <h3 className="font-bold mb-4 flex items-center">
            <ShoppingCart className="mr-2" />
            Your Cart ({cart.length})
          </h3>
          {showReceipt && (
            <h3
              onClick={() => setNewOrderValue(!newOrder)}
              className="font-bold mb-4 flex items-center cursor-pointer"
            >
              <ArrowRight className="mr-2" />
              {newOrder ? "Receipt" : "Reset"}
            </h3>
          )}
        </div>
        <div className="mb-2 space-y-2">
          <Input
            placeholder="Hostel Name / Location"
            value={text}
            onChange={(e) => onChangeHandler(e.target.value)}
            onBlur={() => setTimeout(() => setSuggestions([]), 300)}
          />
          <ScrollArea className="suggestions max-h-24 overflow-auto absolute w-[250px] shadow-md z-10">
            {suggestions.map((name) => (
              <div key={name} onClick={() => onSuggestHandler(name)}>
                {name}
              </div>
            ))}
          </ScrollArea>

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
              onClick={() => {
                placeOrder();
                setNewOrderValue(!newOrder);
              }}
              className="w-full mt-2"
              disabled={!hostelDetails.hostelName || !hostelDetails.phoneNumber}
            >
              Place Order
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
