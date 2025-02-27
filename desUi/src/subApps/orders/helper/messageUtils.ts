import { Message, MessageGroup } from "../types";

export function groupMessagesByOrder(messages: Message[]): MessageGroup[] {
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
}