import WorksNav from "@/components/custom/nav";
import OrderManagement from "./order-management";
import VendorItemManagement from "./vendor-item-management";
import ProfileVendor from "@/components/custom/nav/vendorProfile";
import VendorAvailabilityPage from "./available";
// import OrderManagement from "./order-management"
export function VendorDashboard() {
  return (
    <div className="flex flex-col w-full ">
      <WorksNav />
      <VendorItemManagement />
    </div>
  );
}

export function VendorItems() {
  return (
    <div className="flex flex-col w-full">
      <WorksNav />

      <OrderManagement />
    </div>
  );
}

export function VendorProfile() {
  return (
    <div className="flex flex-col w-full">
      <WorksNav />

      <ProfileVendor />
    </div>
  );
}
export function VendorCheckOut() {
  return (
    <div className="flex flex-col  w-full">
      <div className="pb-10">
        <WorksNav />
      </div>

      <VendorAvailabilityPage />
    </div>
  );
}
