import ExternalLinkTargets from "@/components/ExternalLinkTargets";
import SiteHeader from "@/components/SiteHeader";
import { Footer } from "@/components/Publication";
import { getPublication } from "@/lib/publication";
import { navigation } from "@/lib/navigation";
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let data;
  try {
    data = await getPublication();
  } catch {
    data = { stories: [], businesses: [] };
  }
  return (
    <>
      <ExternalLinkTargets />
      <SiteHeader items={navigation(data.stories, data.businesses)} />
      {children}
      <Footer />
    </>
  );
}
