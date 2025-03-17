import WorksNav from "@/components/custom/nav";
import OrderManagement from "./order-management";
import VendorItemManagement from "./vendor-item-management";
// import OrderManagement from "./order-management"
export function VendorDashboard() {
  return (
    <div className="flex flex-col w-full ">
      <WorksNav navName="orders" to="/vendoritems"/>
      <VendorItemManagement />
    </div>
  );
}

export function VendorItems() {
  return (
    <div className="flex flex-col w-full">
      <WorksNav navName="items" to="/vendor" />

      <OrderManagement />
    </div>
  );
}


