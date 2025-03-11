import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, gql } from "@apollo/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const SEND_MESSAGE = gql`
  mutation sendChatMessage($input: ChatMessageInput!,$orderId:String) {
    sendChatMessage(input: $input,orderId:$orderId) {
      id
      orderId
      sender
      Read
    }
  }
  `;

const GET_CHAT = gql`
   query getOrderChat($orderId:String){
    getOrderChat(orderId:$orderId) {
      orderId
      messages {
        id
        sender
        content
      }
    }
  }
`;

type Message = {
  id: number;
  sender: "CUSTOMER" | "VENDOR";
  content: string;
};

type ChatData = {
  getOrderChat: {
    orderId: string;
    messages: Message[];
  };
};

export default function MinChat() {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const rawOrderId = localStorage.getItem("foodie_last_order_id");
  const orderId = rawOrderId ? rawOrderId.replace(/^"|"$/g, "").trim() : null;
  const sanitizedOrderId = orderId && orderId.length > 0 ? orderId : null;

  

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // Query to fetch chat messages
  const { data, loading, error } = useQuery<ChatData>(GET_CHAT, {
    variables: { orderId: sanitizedOrderId },
    pollInterval: 5000, // Poll every 5 seconds for new messages
  });

  // Mutation to send a new message
  const [sendMessage] = useMutation(SEND_MESSAGE, {
    refetchQueries: [{ query: GET_CHAT }],
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [data?.getOrderChat.messages]);
  // variables: { orderId: sanitizedOrderId },
  // skip: !sanitizedOrderId, // Skip query if orderId is null
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim()) {
      try {
        await sendMessage({
          variables: {
            input: {
              sender: "CUSTOMER",
              content: newMessage.trim(),
            },
            orderId: sanitizedOrderId,
          },
        });
        setNewMessage("");
      } catch (err) {
        console.error("Error sending message:", err);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading chat: {error.message}</div>;

  const messages = data?.getOrderChat.messages || [];

  return (
    <Card className="w-full max-w-md mx-auto h-[450px] flex flex-col">
      <CardHeader>
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1">
        <ScrollArea ref={scrollAreaRef} className="h-[300px] pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "CUSTOMER" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.sender === "CUSTOMER"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
          />
          <Button type="submit">Send</Button>
        </form>
      </CardFooter>
    </Card>
  );
}