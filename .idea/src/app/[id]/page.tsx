import { Metadata } from "next";
import { redirect } from "next/navigation";

const MAIN_WEBSITE_URL = "https://winnemart.com/items/";

async function getVendor(VendorId: string) {
  const res = await fetch("https://api.winnemart.com/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query getSharedVendor($VendorId: String!) {
          getSharedVendor(VendorId: $VendorId) {
            id
            name
            number
            type
            dpfile
          }
        }
      `,
      variables: { VendorId },
    }),
    cache: "no-store",
  });

  const { data } = await res.json();
  return data?.getSharedVendor ?? null;
}

// ✅ Ignore TypeScript strict rules if needed
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const vendor = await getVendor(params.id);

  if (!vendor) {
    return {
      title: "Vendor Not Found",
      description: "This vendor does not exist.",
    };
  }

  return {
    title: vendor.name,
    description: `Vendor Type: ${vendor.type} - Contact: ${vendor.number}`,
    openGraph: {
      title: vendor.name,
      description: `Vendor Type: ${vendor.type} - Contact: ${vendor.number}`,
      images: vendor.dpfile ? [{ url: vendor.dpfile }] : [],
    },
  };
}

// ✅ Fix potential build issues
export default function VendorPage({ params }: any) {
  redirect(`${MAIN_WEBSITE_URL}${params.id}`);
  return null;
}
