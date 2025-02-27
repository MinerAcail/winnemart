import { gql } from "@apollo/client";
import { ReactNode } from "react";

// types.ts
export interface ProductInfo {
    product: { name: string }[];
    quantity: number;
  }
  
  export interface OrderDetailsProps {
    children: ReactNode;
    orderId: string;
    orderDate: string;

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
  
  // graphql/queries.ts
  export const GET_ORDER_ITEMS = gql`
    query GetAllOrderItemsByProductID($orderId: String!) {
      getAllOrderItemsByProductId(orderId: $orderId) {
        orderId
        customerNumber
        deliveryAddress
        productInfor {
          product {
            name
          }
          quantity
        }
      }
    }
  `;
  
  export const GET_CHAT_MESSAGES = gql`
    query GetAllChatMessageByNumber($customerNumber: String!) {
      getAllChatMessageByNumber(customerNumber: $customerNumber) {
        id
        orderId
        sender
        content
      }
    }
  `;
  
  export const SEND_CHAT_MESSAGE = gql`
    mutation SendChatMessageByNumber($input: ChatMessageAdminInput!) {
      sendChatMessageByNumber(input: $input) {
        id
        orderId
        sender
      }
    }
  `;