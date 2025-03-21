import React from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, gql } from "@apollo/client";
import { useParams } from "react-router";

const GET_SHARED_VENDOR = gql`
  query getSharedVendor($Vendor: String!) {
    getSharedVendor(VendorId: $Vendor) {
      id
      name
      number
      type
      dpfile
    }
  }
`;

const SocialMediaHelmet: React.FC = () => {
  const { Vendorid } = useParams<{ Vendorid: string }>(); // Extract Vendor ID from URL
  const { data, loading, error } = useQuery(GET_SHARED_VENDOR, {
    variables: { Vendor: Vendorid },
  });

  if (loading) return null; // Don't render while loading
  if (error) return null; // Handle error (optional: log or show a message)

  const vendorData = data?.getSharedVendor;

  const pageTitle = vendorData?.name
    ? `${vendorData.name} | Vendor Profile`
    : "Vendor Profile";

  const pageDescription = vendorData?.type
    ? `${vendorData.name} - ${vendorData.type} Vendor Profile`
    : "Check out this vendor profile.";

  const pageImage = vendorData?.dpfile || "/default-image.jpg";

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />

      {/* Open Graph Meta Tags */}
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content="profile" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />

      {/* Profile Meta Tags */}
      {vendorData?.name && (
        <meta
          property="profile:first_name"
          content={vendorData.name.split(" ")[0]}
        />
      )}
      {vendorData?.name && vendorData.name.split(" ").length > 1 && (
        <meta
          property="profile:last_name"
          content={vendorData.name.split(" ").slice(1).join(" ")}
        />
      )}
      {vendorData?.type && (
        <meta property="profile:username" content={vendorData.type} />
      )}
    </Helmet>
  );
};

export default SocialMediaHelmet;
