import { ScrollArea } from "@/components/ui/scroll-area";
import { OrderDetails } from "./types";

interface OrderInfoProps {
  details: OrderDetails;
}

export function OrderInfo({ details }: OrderInfoProps) {
  return (
    <div className="space-y-4 p-4">
      <div>
        <strong>Order ID:</strong> {details.orderId}
      </div>
      <div>
        <strong>Customer Number:</strong> {details.customerNumber}
      </div>
      <div>
        <strong>Delivery Address:</strong> {details.deliveryAddress}
      </div>
      <div>
        <strong>Items:</strong>
        <ScrollArea className="h-[200px] w-full rounded-md border p-4 mt-2">
          <ul className="space-y-2">
            {details.productInfor.map((item, index) => (
              <li
                key={index}
                className="flex justify-between items-center border-b pb-2"
              >
                <span className="font-medium">
                  {item.product[0]?.name || "Unknown Product"}
                </span>
                <span className="text-gray-600">
                  Quantity: {item.quantity}
                </span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
    </div>
  );
}