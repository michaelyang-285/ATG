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
import { eventDetailMetadata, eventPublisher } from "@/lib/event-metadata";
import { localClock, zone } from "@/lib/event-time";
import styles from "./event.module.css";

const dateLabel = new Intl.DateTimeFormat("en-US", {
  timeZone: zone, weekday: "short", month: "short", day: "numeric", year: "numeric",
});
const timeLabel = new Intl.DateTimeFormat("en-US", {
  timeZone: zone, hour: "numeric", minute: "2-digit",
});

function EventTime({ startsAt, endsAt }: { startsAt: string; endsAt?: string }) {
  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;
  const hasEnd = end && end > start;
  if (hasEnd && localClock(start.getTime()).slice(0, 10) !== localClock(end.getTime()).slice(0, 10)) {
    return <>
      <time dateTime={startsAt}>Starts {dateLabel.format(start)}<br />{timeLabel.format(start)} ET</time>
      <time className={styles.end} dateTime={endsAt}>Ends {dateLabel.format(end)}<br />{timeLabel.format(end)} ET</time>
    </>;
  }
  const hours = hasEnd ? timeLabel.formatRange(start, end) : timeLabel.format(start);
  return <>
    <time dateTime={startsAt}>{dateLabel.format(start)}</time>
    <span className={styles.hours}>{hours.replace(/:00\b/g, "")} ET</span>
  </>;
}

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
  return e ? eventDetailMetadata({
    name: e.title, place: e.venue || e.city || e.neighborhood || "", day: e.day,
    time: timeLabel.format(new Date(e.startsAt)), summary: e.summary, path: occurrencePath(e),
    image: imageUrl(e.image, 1200, 630, "jpg"), imageAlt: e.image?.alt, cancelled: e.cancelled,
  }) : {};
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
    eventStatus: e.cancelled ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
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
  const city = (e.city || e.neighborhood || "").trim();
  const locality = [city ? city + ", GA" : "", e.postalCode].filter(Boolean).join(" ");
  const rawVenue = e.venue?.trim() || "";
  const citySuffix = ", " + city;
  const venue = city && rawVenue.toLowerCase().endsWith(citySuffix.toLowerCase())
    ? rawVenue.slice(0, -citySuffix.length) : rawVenue;
  const street = e.street?.trim();
  const destination = street || (venue && city && !/\b(?:online|virtual)\b/i.test(venue) ? venue : "");
  const mapsUrl = destination
    ? "https://www.google.com/maps/dir/?api=1&destination=" +
      encodeURIComponent([destination, locality || "Georgia"].join(", "))
    : null;
  const admission = e.priceLabel?.trim() || (price === 0 ? "Free" :
    typeof price === "number" ? "$" + price : e.cost === "paid" ? "Paid admission" : "");

  return (
    <main id="main" className="site-width page-content">
      <article className={styles.event}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
        <Link className={styles.back} href="/events">← Events calendar</Link>
        <h1>{e.title}</h1>
        {e.cancelled && <p className={styles.cancelled}>This event has been cancelled.</p>}
        <dl className={styles.details}>
          <div>
            <dt>Date &amp; time</dt>
            <dd><EventTime startsAt={e.startsAt} endsAt={e.endsAt} /></dd>
          </div>
          {(venue || street || locality) && <div>
            <dt>Location</dt>
            <dd>
              {venue && <strong>{venue}</strong>}
              {street && <span>{street}</span>}
              {locality && <span>{locality}</span>}
              {mapsUrl && <a className={styles.maps} href={mapsUrl} target="_blank" rel="noopener noreferrer">
                View on Google Maps <span aria-hidden="true">↗</span>
              </a>}
            </dd>
          </div>}
          {admission && <div>
            <dt>Admission</dt>
            <dd>{admission}{e.pricingDetails && <span>{e.pricingDetails}</span>}</dd>
          </div>}
          {typeof e.registrationRequired === "boolean" && <div><dt>Registration</dt><dd>{e.registrationRequired ? "Registration required" : "No registration required"}</dd></div>}
        </dl>
        {e.summary && <p className={styles.description}>{e.summary}</p>}
        {e.organizer && <p className={styles.organizer}>Organized by <strong>{e.organizer}</strong></p>}
        {(ticketUrl || url) && <div className={styles.actions}>
          {ticketUrl && <a className="button button-orange" href={ticketUrl} target="_blank" rel="noopener noreferrer">Tickets and registration</a>}
          {url && url !== ticketUrl && <a className={ticketUrl ? styles.back : "button button-orange"} href={url} target="_blank" rel="noopener noreferrer">Visit event website</a>}
        </div>}
      </article>
    </main>
  );
}
