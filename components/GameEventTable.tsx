import Link from "next/link";
import { occurrencePath, type EventOccurrence } from "@/lib/events";
import { zone } from "@/lib/event-time";

const when = new Intl.DateTimeFormat("en-US", {
  timeZone: zone, weekday: "short", month: "short", day: "numeric",
  year: "numeric", hour: "numeric", minute: "2-digit",
});

export function GameEventTable({ events, caption }: { events: EventOccurrence[]; caption: string }) {
  if (!events.length) return <p>No upcoming dates are listed yet.</p>;
  return (
    <div className="story-table-wrap" role="region" aria-label={caption} tabIndex={0}>
      <table className="story-table">
        <caption>{caption}</caption>
        <thead><tr><th scope="col">Date &amp; time (Eastern)</th><th scope="col">Event</th><th scope="col">Where</th></tr></thead>
        <tbody>{events.map(event => (
          <tr key={event._id + event.day}>
            <td><time dateTime={event.startsAt}>{when.format(new Date(event.startsAt))}</time></td>
            <th scope="row"><Link href={occurrencePath(event)}>{event.title}</Link></th>
            <td>{[event.venue, event.city || event.neighborhood].filter(Boolean).join(" · ")}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
