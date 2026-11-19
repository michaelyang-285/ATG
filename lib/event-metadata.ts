import type { Metadata } from "next";

const site = "https://allthingsgwinnett.com";
const squareLogo = {
  url: site + "/brand/atg-avatar.png",
  width: 1024,
  height: 1024,
};

export const eventPublisher = {
  "@type": "Organization",
  "@id": site + "/#organization",
  name: "All Things Gwinnett",
  url: site,
  logo: { "@type": "ImageObject", ...squareLogo },
};

export function eventPageMetadata(title: string, description: string | undefined, path: string): Metadata {
  const preview = { ...squareLogo, alt: "All Things Gwinnett logo" };
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: eventPublisher.name,
      title,
      description,
      url: path,
      images: [preview],
    },
    twitter: { card: "summary", title, description, images: [preview] },
  };
}
