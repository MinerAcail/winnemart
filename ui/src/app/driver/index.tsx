import WorksNav from "@/components/custom/nav";
import OrderManagement from "./order-management";


export function DriverOrderItems() {
  return (
    <div className="flex flex-col w-full">
      <WorksNav  />

      <OrderManagement />
    </div>
  );
}