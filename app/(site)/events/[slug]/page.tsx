import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import {
  eventFields,
  eventDates,
  occurrencePath,
  type EventRecord,
} from "@/lib/events";
import { publication, safeUrl, imageUrl } from "@/lib/publication";
import { eventPageMetadata, eventPublisher } from "@/lib/event-metadata";
import { zone } from "@/lib/event-time";
const load = cache(async (slug: string, day?: string) => {
  const e = await publication.fetch<EventRecord | null>(
    '*[_type=="event" && coalesce(slug.current,_id)==$slug][0]{' +
      eventFields +
      "}",
    { slug },
    { next: { revalidate: 60 } },
  );
  if (!e) return null;
  const dates = eventDates(e);
  return day ? dates.find((d) => d.day === day) : dates[0];
});
type Props = { params: { slug: string }; searchParams: { date?: string } };
export async function generateMetadata({ params, searchParams }: Props) {
  const e = await load(params.slug, searchParams.date);
  return e ? eventPageMetadata(e.title, e.summary, occurrencePath(e)) : {};
}
export default async function Page({ params, searchParams }: Props) {
  const e = await load(params.slug, searchParams.date);
  if (!e) notFound();
  const url = safeUrl(e.url),
    pageUrl = eventPublisher.url + occurrencePath(e),
    atgOrganizesEvent = /^(all things gwinnett|atg)$/i.test(e.organizer?.trim() || ""),
    ticketUrl = safeUrl(e.ticketUrl),
    price = e.cost === "free" ? 0 : e.price;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    startDate: e.startsAt,
    endDate: e.endsAt,
    description: e.summary,
    image: atgOrganizesEvent ? eventPublisher.logo.url : imageUrl(e.image) || undefined,
    url: pageUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
      publisher: eventPublisher,
    },
    location: e.venue
      ? {
          "@type": "Place",
          name: e.venue,
          address: e.street
            ? {
                "@type": "PostalAddress",
                streetAddress: e.street,
                addressLocality: e.city,
                postalCode: e.postalCode,
                addressRegion: "GA",
                addressCountry: "US",
              }
            : e.neighborhood,
        }
      : undefined,
    organizer: e.organizer
      ? { "@type": "Organization", name: e.organizer }
      : undefined,
    isAccessibleForFree: e.cost ? e.cost === "free" : undefined,
    offers:
      typeof price === "number"
        ? { "@type": "Offer", url: ticketUrl || undefined, price, priceCurrency: "USD" }
        : undefined,
  };
  const when = (time: string) =>
    new Date(time).toLocaleString("en-US", {
      timeZone: zone,
      dateStyle: "full",
      timeStyle: "short",
    });
  return (
    <main id="main" className="site-width page-content">
      <article className="prose">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
        <Link href="/events">← Events calendar</Link>
        <h1>{e.title}</h1>
        <p>
          <time dateTime={e.startsAt}>{when(e.startsAt)}</time>
          {e.endsAt && <> to {when(e.endsAt)}</>} (Eastern)
        </p>
        <p>
          {[e.venue, e.street, [e.city || e.neighborhood, e.postalCode].filter(Boolean).join(" ")]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p>{e.summary}</p>
        <p>{e.priceLabel}</p>
        {e.organizer && <p>Organized by {e.organizer}</p>}
        {ticketUrl && ticketUrl !== url && <p><a className="button button-orange" href={ticketUrl}>Tickets and registration</a></p>}
        {url && (
          <a className="button button-orange" href={url}>
            Visit event website ↗
          </a>
        )}
      </article>
    </main>
  );
}
