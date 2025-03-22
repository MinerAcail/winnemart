import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

const MAIN_WEBSITE_URL = "https://winnemart.com/items/";
const MINIO_BASE_URL = "https://winnemart.com/";

// Fetch vendor data from API
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

// 🔹 Generate OpenGraph Metadata for Social Sharing
export async function generateMetadata({ params }) {
  const vendor = await getVendor(params.id);
  if (!vendor) {
    notFound();
  }

  const imageUrl = vendor.dpfile?.startsWith("http")
    ? vendor.dpfile
    : `${MINIO_BASE_URL}${vendor.dpfile}`;

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

// 🔹 Detect Crawlers and Show Metadata Instead of Redirecting
export default async function VendorPage({ params }) {
  const vendor = await getVendor(params.id);
  if (!vendor) notFound();

  // Get user agent from request headers
  const userAgent = headers().get("user-agent") || "";

  // List of known social media bots
  const crawlers = [
    "facebookexternalhit", 
    "Twitterbot", 
    "WhatsApp", 
    "Discordbot", 
    "LinkedInBot"
  ];

  // If a crawler is detected, show metadata but don't redirect
  if (crawlers.some((bot) => userAgent.includes(bot))) {
    const imageUrl = vendor.dpfile?.startsWith("http")
      ? vendor.dpfile
      : `${MINIO_BASE_URL}${vendor.dpfile}`;

    return (
      <html>
        <head>
          <meta property="og:title" content={vendor.name} />
          <meta property="og:description" content={`Shop with ${vendor.name} on Winnemart.`} />
          <meta property="og:image" content={imageUrl} />
          <meta property="og:url" content={`${MAIN_WEBSITE_URL}${params.id}`} />
          <meta property="og:type" content="website" />
        </head>
        <body>
          <p>OpenGraph metadata loaded.</p>
        </body>
      </html>
    );
  }

  // If it's a real user, redirect them
  redirect(`${MAIN_WEBSITE_URL}${params.id}`);
  return null;
}
