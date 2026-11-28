import { BotIdClient } from "botid/client";
import type { Metadata } from "next";
import "@/styles/globals.css";
const contract =
  "THESIS: A useful guide leads; recent local stories support it. OWN-WORLD: White, ink #171717, orange #FF4D22, DM Sans, Soft Serif artwork, thin rules. STORY: Discover a local read, find a guide, make a plan. FIRST VIEWPORT: Compact logo and search above four topic links; tagline above a two-thirds lead and one-third story rail. FORM: The guide desk, grounded candidate 3, seed ff5b2443; approved November 4, 2026. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance";
const protectedRoutes = [
  "/api/directory/login",
  "/api/directory/owner",
  "/api/directory/progress",
  "/api/directory/upload",
  "/api/directory/checkout",
  "/api/directory/deletion",
  "/api/directory/corrections",
  "/api/inquiry",
  "/api/events",
  "/api/subscribe",
].map(path => ({path, method: "POST" as const}));

export const metadata: Metadata = {
  metadataBase: new URL("https://allthingsgwinnett.com"),
  title: {
    default: "All Things Gwinnett — Migos. Food. Traffic.",
    template: "%s | All Things Gwinnett",
  },
  description:
    "An independent guide to Gwinnett’s food, culture, and everyday life.",
  openGraph: {
    type: "website",
    siteName: "All Things Gwinnett",
    locale: "en_US",
    images: [{ url: "/brand/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.png" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
gtag('js', new Date());`,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-MJNC3TZ4" />
        <BotIdClient protect={protectedRoutes} />
      </head>
      <body>
        <template
          dangerouslySetInnerHTML={{ __html: `<!-- ${contract} -->` }}
        />
        {children}
      </body>
    </html>
  );
}
