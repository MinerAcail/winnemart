import { Copy } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "../ui/scroll-area";
import { gql, useQuery } from "@apollo/client";

interface Product {
  id: string;
  name: string;
  price: string; // Price comes as a string in the response
}

interface ProductInfo {
  quantity: number;
  product: Product[];
}

interface OrderTrackingData {
  useGetordertracking: {
    orderId: string;
    customerNumber: string;
    deliveryAddress: string;
    estimatedDeliveryDate: string;
    createdAt: string;

    status: string;
    productInfor: ProductInfo[];
  };
}

export interface ReceiptProps {
  orderNumber: string;
  date: string;
  userLocation: string;
  vendorNumber: string;
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
}

export const GET_ORDER_TRACKING = gql`
  query useGetordertracking {
    useGetordertracking {
      orderId
      customerNumber
      deliveryAddress
      status
      estimatedDeliveryDate
      createdAt
      productInfor {
        quantity
        product {
          id
          name
          price
        }
      }
    }
  }
`;

export default function CardReceipt() {
  const { data, loading, error } =
    useQuery<OrderTrackingData>(GET_ORDER_TRACKING);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading order details.</p>;

  const order = data?.useGetordertracking;

  if (!order) return <p>No order details available.</p>;

  // Map the order items
  const items = order.productInfor.flatMap((info) => {
    const product = info.product[0]; // Assuming only one product per "product" array
    return {
      name: product.name,
      price: parseFloat(product.price), // Convert price from string to number
      quantity: info.quantity,
    };
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = 5; // Example tax amount
  const total = subtotal + tax;
const orderId =order.orderId.slice(0, 5)
  return (
    <ScrollArea className="mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="h-[600px] w-full max-w-md mx-auto">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Order Receipt
          </h3>
          <p className="mt-1 text-sm text-zinc-500">Thank you for your order</p>
        </div>

        {/* Order Details */}
        <div className="p-6 space-y-6">
          {/* Order Info Section */}
          <div className="space-y-4">
            <div className="space-y-2 flex-col items-start flex">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Order ID: {orderId}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Order:{" "}
                {new Date(order.createdAt).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Estimated Delivery: {order.estimatedDeliveryDate}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Location: {order.deliveryAddress}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Status: {order.status || "Pending"}
              </p>
            </div>
            <div
              onClick={() => {
                navigator.clipboard.writeText(order.customerNumber);
                toast("Copied to clipboard", {
                  description: order.customerNumber,
                });
              }}
              className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
              Momo number or Assistance:  {order.customerNumber}
              </span>
              <Copy className="w-4 h-4 text-zinc-500" />
            </div>
            <div
              onClick={() => {
                navigator.clipboard.writeText(orderId);
                toast("Copied to clipboard", {
                  description: orderId,
                });
              }}
              className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {/* {order.customerNumber} */}
                Momo Reference : {orderId}

              </span>
              <Copy className="w-4 h-4 text-zinc-500" />
            </div>
           
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
              Order Items
            </h4>
            <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {item.quantity}x
                    </span>
                    <span className="text-zinc-900 dark:text-zinc-100">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Section */}
          <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Subtotal</span>
              <span className="text-zinc-900 dark:text-zinc-100">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                Delivery Fee
              </span>
              <span className="text-zinc-900 dark:text-zinc-100">
                ${tax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-base font-medium pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-900 dark:text-zinc-100">Total</span>
              <span className="text-zinc-900 dark:text-zinc-100">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        
      </div>
    </ScrollArea>
  );
}
