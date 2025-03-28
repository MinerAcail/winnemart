import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";

const MAIN_WEBSITE_URL = "https://winnemart.com/";
const MINIO_BASE_URL = "https://winnemart.com";

// Known social media crawlers (regex for flexibility)
const BOT_REGEX = /(facebookexternalhit|Twitterbot|WhatsApp|Discordbot|LinkedInBot)/i;
export const ghSim = "GH¢";

// Fetch product data from API
async function getProduct(id) {
  try {
    const res = await fetch("https://api.winnemart.com/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query getProduct($id: String!) {
            getProduct(id: $id) {
              id
              name
              price
              categories
              imageUrls
            }
          }
        `,
        variables: { id },
      }),
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch product data");

    const { data } = await res.json();
    return data?.getProduct || null;
  } catch (error) {
    console.error("Product fetch error:", error);
    return null;
  }
}

// 🔹 Generate OpenGraph Metadata for Social Sharing
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const imageUrl = product.imageUrls?.[0]?.startsWith("http")
    ? product.imageUrls[0]
    : `${MINIO_BASE_URL}${product.imageUrls?.[0] || "/default-image.jpg"}`;

  return {
    title: product.name,
    description: `Get ${product.name} for just ${ghSim}${product.price} on Winnemart!`,
    openGraph: {
      title: product.name,
      description: `Check out ${product.name} for ${ghSim}${product.price} on Winnemart.`,
      images: [{ url: imageUrl }],
    },
  };
}

// 🔹 Detect Crawlers and Show Metadata Instead of Redirecting
export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const userAgent = headers().get("user-agent") || "";

  // Check if user-agent belongs to a bot
  if (BOT_REGEX.test(userAgent)) {
    const imageUrl = product.imageUrls?.[0]?.startsWith("http")
      ? product.imageUrls[0]
      : `${MINIO_BASE_URL}${product.imageUrls?.[0] || "/default-image.jpg"}`;

    return (
      <html>
        <head>
          <meta property="og:title" content={product.name} />
          <meta property="og:description" content={`Get ${product.name} for just ${ghSim}${product.price} on Winnemart!`} />
          <meta property="og:image" content={imageUrl} />
          <meta property="og:url" content={`${MAIN_WEBSITE_URL}${params.id}`} />
          <meta property="og:type" content="product" />
        </head>
        <body>
          <p>OpenGraph metadata loaded.</p>
        </body>
      </html>
    );
  }

  // Redirect human users
  redirect(`${MAIN_WEBSITE_URL}${params.id}?name=${encodeURIComponent(product.name)}`);

  return null;
}


