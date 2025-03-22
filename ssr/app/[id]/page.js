import { redirect } from "next/navigation";

const MAIN_WEBSITE_URL = "https://winnemart.com/items/";

async function getVendor(id) {
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
      variables: { VendorId: id },
    }),
    cache: "no-store",
  });

  const { data } = await res.json();
  return data?.getSharedVendor;
}

// 🔹 Generate OpenGraph Metadata
export async function generateMetadata({ params }) {
  const vendor = await getVendor(params.id);

  if (!vendor) {
    return { title: "Vendor Not Found" };
  }

  return {
    title: vendor.name,
    description: `Check out ${vendor.name} on Winnemart!`,
    openGraph: {
      title: vendor.name,
      description: `Shop with ${vendor.name} on Winnemart.`,
      images: [{ url: vendor.dpfile || "/default-image.jpg" }],
    },
  };
}

// 🔹 Redirect to main site
export default function VendorPage({ params }) {
  redirect(`${MAIN_WEBSITE_URL}${params.id}`);
  return null;
}
