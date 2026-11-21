import article from "./article.json";

export const dynamic = "force-static";

export function GET() {
  return new Response(article, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
