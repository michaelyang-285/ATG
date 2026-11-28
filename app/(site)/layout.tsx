import {publisher,website} from "@/lib/publisher";
import ExternalLinkTargets from "@/components/ExternalLinkTargets";
import SiteHeader from "@/components/SiteHeader";
import { Footer } from "@/components/Publication";
import { navigation } from "@/lib/navigation";
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@graph":[publisher,website]})}}/>
      <ExternalLinkTargets />
      <SiteHeader items={navigation()} />
      {children}
      <Footer />
    </>
  );
}
