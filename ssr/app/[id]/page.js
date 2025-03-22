import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

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

// 🔹 Generate OG Metadata
export async function generateMetadata({ params }) {
  const vendor = await getVendor(params.id);

  if (!vendor) {
    notFound(); // Show 404 page if vendor doesn't exist
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

// 🔹 Serve OG Metadata before redirecting
export default async function VendorPage({ params }) {
  const vendor = await getVendor(params.id);
  if (!vendor) notFound();

  return (
    <html>
      <head>
        <meta property="og:title" content={vendor.name} />
        <meta property="og:description" content={`Shop with ${vendor.name} on Winnemart.`} />
        <meta property="og:image" content={vendor.dpfile || "/default-image.jpg"} />
        <meta http-equiv="refresh" content={`0; url=${MAIN_WEBSITE_URL}${params.id}`} />
      </head>
      <body>
        <p>Redirecting to <a href={`${MAIN_WEBSITE_URL}${params.id}`}>{vendor.name}</a>...</p>
      </body>
    </html>
  );
}
