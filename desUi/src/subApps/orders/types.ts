// types.ts
import { type ReactNode } from "react";

export interface ProductInfo {
  product: { name: string }[];
  quantity: number;
}

export interface OrderDetailsProps {
  children: ReactNode;
  orderId: string;
}

export interface Message {
  id: string;
  orderId: string;
  sender: "VENDOR" | "CUSTOMER";
  content: string;
}

export interface MessageGroup {
  orderId: string;
  messages: Message[];
}

export interface OrderDetails {
  orderId: string;
  customerNumber: string;
  deliveryAddress: string;
  productInfor: ProductInfo[];
}