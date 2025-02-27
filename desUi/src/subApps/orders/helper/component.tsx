import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Message, OrderDetails } from "./typesGql";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

// components/ErrorCard.tsx
export const ErrorCard = ({ message }: { message: string }) => (
  <Card className="border-red-200 bg-red-50">
    <CardContent className="p-4 text-red-600">Error: {message}</CardContent>
  </Card>
);

// components/OrderDetailsView.tsx
export const OrderDetailsView = ({ orderDetails }: { orderDetails: OrderDetails }) => (
  <div className="space-y-4 p-4">
    <div>
      <strong>Order ID:</strong> {orderDetails.orderId}
    </div>
    <div>
      <strong>Customer Number:</strong> {orderDetails.customerNumber}
    </div>
    <div>
      <strong>Delivery Address:</strong> {orderDetails.deliveryAddress}
    </div>
    <div>
      <strong>Items:</strong>
      <ScrollArea className="h-[200px] w-full rounded-md border p-4 mt-2">
        <ul className="space-y-2">
          {orderDetails.productInfor.map((item, index) => (
            <li
              key={index}
              className="flex justify-between items-center border-b pb-2"
            >
              <span className="font-medium">
                {item.product[0]?.name || "Unknown Product"}
              </span>
              <span className="text-gray-600">Quantity: {item.quantity}</span>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  </div>
);


export const ChatMessage = ({ message }: { message: Message }) => (
    <div
      className={`flex ${
        message.sender === "VENDOR" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`rounded-lg px-4 py-2 max-w-[80%] ${
          message.sender === "VENDOR"
            ? "bg-blue-500 text-white"
            : "bg-gray-100"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
  
  // components/ChatForm.tsx
  export const ChatForm = ({ 
    newMessage, 
    onMessageChange, 
    onSubmit 
  }: { 
    newMessage: string;
    onMessageChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
  }) => (
    <CardFooter className="border-t p-4">
      <form onSubmit={onSubmit} className="flex w-full gap-2">
        <Input
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow"
        />
        <Button type="submit">Send</Button>
      </form>
    </CardFooter>
  );
  