import { headers } from "next/headers";
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

  // Ensure OpenGraph images use full URLs
  const imageUrl = vendor.dpfile?.startsWith("/minio/")
    ? `https://winnemart.com${vendor.dpfile}`
    : vendor.dpfile || "/default-image.jpg";

  return {
    title: vendor.name,
    description: `Check out ${vendor.name} on Winnemart!`,
    openGraph: {
      title: vendor.name,
      description: `Shop with ${vendor.name} on Winnemart.`,
      images: [{ url: imageUrl }],
    },
  };
}

// 🔹 Detect Crawlers and Only Redirect Real Users
export default async function VendorPage({ params }) {
  const vendor = await getVendor(params.id);
  if (!vendor) notFound();

  // Get request headers
  const userAgent = headers().get("user-agent") || "";

  // List of known social media crawlers
  const crawlers = ["facebookexternalhit", "Twitterbot", "WhatsApp", "Discordbot", "LinkedInBot"];

  // If a crawler is detected, show metadata but don't redirect
  if (crawlers.some((bot) => userAgent.includes(bot))) {
    return (
      <html>
        <head>
          <meta property="og:title" content={vendor.name} />
          <meta property="og:description" content={`Shop with ${vendor.name} on Winnemart.`} />
          <meta property="og:image" content={imageUrl} />
        </head>
        <body>
          <p>OpenGraph metadata loaded.</p>
        </body>
      </html>
    );
  }

  // If not a bot, redirect the user
  redirect(`${MAIN_WEBSITE_URL}${params.id}`);
  return null;
}
