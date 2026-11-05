import { Newsletter } from "@/components/Publication";
import { getPublication } from "@/lib/publication";
export const metadata = { title: "Get the newsletter" };
export default async function Page() {
  const { settings } = await getPublication();
  return (
    <main id="main" className="site-width page-content">
      <h1>Stay close to what’s happening.</h1>
      <Newsletter url={settings.newsletterUrl} />
    </main>
  );
}
