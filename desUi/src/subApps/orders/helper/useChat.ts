import { useMutation, useQuery } from "@apollo/client";
import { useRef, useState } from "react";
import { GET_CHAT_MESSAGES, Message, MessageGroup, SEND_CHAT_MESSAGE } from "./typesGql";

// hooks/useChat.ts
export const useChat = (customerNumber: string | undefined) => {
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    loading,
    error,
    data,
  } = useQuery(GET_CHAT_MESSAGES, {
    variables: { customerNumber },
    skip: !customerNumber,
    pollInterval: 5000,
  });

  const [sendMessage] = useMutation(SEND_CHAT_MESSAGE, {
    refetchQueries: ["GetAllChatMessageByNumber"],
  });

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !customerNumber) return;

    try {
      await sendMessage({
        variables: {
          input: {
            customerNumber,
            sender: "VENDOR",
            content: newMessage.trim(),
          },
        },
      });
      setNewMessage("");
      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return {
    loading,
    error,
    messages: data?.getAllChatMessageByNumber || [],
    newMessage,
    setNewMessage,
    handleSendMessage,
    scrollAreaRef,
    scrollToBottom,
  };
};


export const groupMessagesByOrder = (messages: Message[]): MessageGroup[] => {
  const groups: { [key: string]: Message[] } = {};

  messages.forEach((message) => {
    if (!groups[message.orderId]) {
      groups[message.orderId] = [];
    }
    groups[message.orderId].push(message);
  });

  return Object.entries(groups).map(([orderId, messages]) => ({
    orderId,
    messages,
  }));
};