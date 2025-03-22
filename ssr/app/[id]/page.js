import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

const MAIN_WEBSITE_URL = "https://winnemart.com/items/";
const MINIO_BASE_URL = "https://files.winnemart.com"; // MinIO base URL

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

// 🔹 Generate OpenGraph Metadata
export async function generateMetadata({ params }) {
  const vendor = await getVendor(params.id);
  if (!vendor) {
    notFound();
  }

  // Convert relative MinIO paths to absolute URLs
  const imageUrl = vendor.dpfile?.startsWith("/minio/")
    ? `${MINIO_BASE_URL}${vendor.dpfile}`
    : vendor.dpfile;

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

// 🔹 Detect Crawlers and Prevent Redirection
export default async function VendorPage({ params }) {
  const vendor = await getVendor(params.id);
  if (!vendor) notFound();

  // Get user agent from headers
  const userAgent = headers().get("user-agent") || "";

  // List of known social media bots
  const crawlers = [
    "facebookexternalhit", 
    "Twitterbot", 
    "WhatsApp", 
    "Discordbot", 
    "LinkedInBot"
  ];

  // Convert MinIO paths to full URLs for OpenGraph images
  const imageUrl = vendor.dpfile?.startsWith("/minio/")
    ? `${MINIO_BASE_URL}${vendor.dpfile}`
    : vendor.dpfile;

  // If a crawler is detected, show metadata without redirecting
  if (crawlers.some((bot) => userAgent.includes(bot))) {
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

  // Redirect real users
  redirect(`${MAIN_WEBSITE_URL}${params.id}`);
  return null;
}
