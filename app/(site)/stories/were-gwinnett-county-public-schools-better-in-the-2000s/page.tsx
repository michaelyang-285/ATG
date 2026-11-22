import type { Metadata } from "next";
import article from "./article.json";
import FeatureCharts from "./FeatureCharts";

function capture(pattern: RegExp) {
  const match = article.match(pattern);
  if (!match) throw new Error("Missing GCPS feature markup: " + pattern);
  return match[1];
}

function meta(name: string) {
  return capture(new RegExp('<meta (?:property|name)="' + name + '" content="([^"]+)"'));
}

export const metadata: Metadata = {
  title: { absolute: capture(/<title>(.*?)<\/title>/) },
  description: meta("description"),
  keywords: meta("keywords"),
  alternates: { canonical: meta("og:url") },
  openGraph: { type: "article", title: meta("og:title"), description: meta("og:description"), url: meta("og:url"), images: [{url: meta("og:image"), width: 1200, height: 630}] },
  twitter: {card: "summary_large_image", title: meta("og:title"), description: meta("og:description"), images: [meta("og:image")]},
};

export default function SchoolsFeature() {
  const css = capture(/<style>([\s\S]*?)<\/style>/).replace(/\bbody\s*\{/g, ":scope{");
  const body = capture(/<body>([\s\S]*?)<\/body>/);
  const markup = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  const schema = capture(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  const chartCode = body.match(/<script>([\s\S]*?)<\/script>/)?.[1] || "";
  return <div className="gcps-feature">
    <style>{`@scope (.gcps-feature) { ${css} }`}</style>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: schema}} />
    <div dangerouslySetInnerHTML={{__html: markup}} />
    <FeatureCharts code={chartCode} />
  </div>;
}
