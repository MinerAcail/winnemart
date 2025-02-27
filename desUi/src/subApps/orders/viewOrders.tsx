import { useEffect, useState } from "react";
import { GET_ORDER_ITEMS, OrderDetailsProps } from "./helper/typesGql";
import { useQuery } from "@apollo/client";
import { groupMessagesByOrder, useChat } from "./helper/useChat";
import {
  ChatForm,
  ChatMessage,
  ErrorCard,
  LoadingSpinner,
  OrderDetailsView,
} from "./helper/component";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getRelativeTime } from "@/components/custom/dateUtils";

export default function OrderList({
  children,
  orderId,
  orderDate,
}: OrderDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const relativeTime = getRelativeTime(orderDate);

  const {
    loading: orderLoading,
    error: orderError,
    data: orderData,
  } = useQuery(GET_ORDER_ITEMS, {
    variables: { orderId },
    skip: !isOpen,
  });

  const customerNumber = orderData?.getAllOrderItemsByProductId?.customerNumber;

  const {
    loading: chatLoading,
    error: chatError,
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    scrollAreaRef,
    scrollToBottom,
  } = useChat(customerNumber);

  useEffect(() => {
    if (activeTab === "chat") {
      scrollToBottom();
    }
  }, [messages, activeTab, scrollToBottom]);

  const renderOrderDetails = () => {
    if (orderLoading) return <LoadingSpinner />;
    if (orderError) return <ErrorCard message={orderError.message} />;

    const orderDetails = orderData?.getAllOrderItemsByProductId;
    if (!orderDetails) {
      return (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 text-yellow-600">
            No order details found
          </CardContent>
        </Card>
      );
    }

    return <OrderDetailsView orderDetails={orderDetails} />;
  };

  const renderChat = () => {
    if (chatLoading) return <LoadingSpinner />;
    if (chatError) return <ErrorCard message={chatError.message} />;

    const messageGroups = groupMessagesByOrder(messages);

    return (
      <div className="flex flex-col h-[400px]">
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
          <div className="space-y-4 p-4">
            {messageGroups.map((group, groupIndex) => (
              <div key={group.orderId} className="space-y-4">
                {group.messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}

                {groupIndex < messageGroups.length - 1 && (
                  <div>
                    <div className="p-2 mx-3">
                      <Badge>{orderId.slice(0, 5)}</Badge>
                      <Badge className="ml-3">{` ${relativeTime} - ${new Date(
                        orderDate
                      ).toLocaleString()}`}</Badge>
                    </div>
                    <Separator className="my-4 bg-red-800" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <ChatForm
          newMessage={newMessage}
          onMessageChange={setNewMessage}
          onSubmit={handleSendMessage}
        />
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="chat">
                Chat
                {messages.length > 0 && (
                  <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
                    {messages.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details">{renderOrderDetails()}</TabsContent>
            <TabsContent value="chat">{renderChat()}</TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
