import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "../ui/card";
import { ghSim } from "./ItemGrid";
import { Item } from "@/app/HostelStoreApp";
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
  const { error } = useQuery(GET_ORDER_TRACKING);
  const OrderTimestamp = localStorage.getItem("lastOrderTimestamp");

  useEffect(() => {
    if (error) {
      if (error.message.includes("no tracking cookie found")) {
        setShowReceipt(false);
      }
    } else {
      const currentTime = new Date().getTime();
      const orderTime = OrderTimestamp ? new Date(OrderTimestamp).getTime() : 0;
      const timeDifference = currentTime - orderTime;
      const oneHour = 60 * 60 * 1000;

      if (timeDifference > oneHour) {
        setShowReceipt(false);
      } else {
        setShowReceipt(true); // Show receipt if no error and within 1 hour
      }
    }
  }, [error, OrderTimestamp]);
  return (
    <div className={"h-72 w-[350px] overflow-auto border p-1 m-4 "}>
      {!showReceipt ? (
        <Card className="sticky  mt-30 lg:mt-32">
          <CardContent className="p-4">
            <h3 className="font-bold mb-4 flex items-center">
              <ShoppingCart className="mr-2 overflow-y-scrol" />
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
    </div>
  );
};

export default CartSidebar;


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MinChat from "@/app/message";

export function SideTabs() {
  return (
    <Tabs defaultValue="receipt" className="w-full sticky lg:mt-32 ">
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="receipt">Receipt</TabsTrigger>
      <TabsTrigger value="message">Message</TabsTrigger>
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
