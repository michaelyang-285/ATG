import Link from "next/link";
import { libraryPath, jsonLd } from "@/lib/library-events";

export default function LibraryBreadcrumbs({ event }: { event?: { name: string; path: string } }) {
  const trail = [{ name: "Events", path: "/events" }, { name: "Library events", path: libraryPath }];
  if (event) trail.push(event);
  const schema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: trail.map(({ name, path }, index) => ({
      "@type": "ListItem", position: index + 1, name, item: "https://allthingsgwinnett.com" + path,
    })),
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
    <nav aria-label="Breadcrumb" style={{ display: "block", border: 0, padding: 0, fontSize: ".9rem" }}>
      {trail.map(({ name, path }, index) => <span key={path}>
        {index > 0 && <span aria-hidden="true"> › </span>}
        {index === trail.length - 1 ? <span aria-current="page">{name}</span> : <Link href={path}>{name}</Link>}
      </span>)}
    </nav>
  </>;
}
