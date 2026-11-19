import Link from "next/link";
import { GameEventTable } from "@/components/GameEventTable";
import { upcomingGameEvents } from "@/lib/events";
import { eventPageMetadata } from "@/lib/event-metadata";
import { eventFormats } from "@/lib/game-topics";
import "@/components/community.css";
import "@/styles/story-guide.css";

export const revalidate = 60;
export const metadata = eventPageMetadata(
  "Pokémon Events in Gwinnett County",
  "Find upcoming Pokémon tournaments, league play, trade nights and card shows in Gwinnett County, Georgia.",
  "/events/pokemon",
);

export default async function PokemonEvents({ searchParams }: { searchParams: { type?: string } }) {
  const format = eventFormats.find(f => f.value === searchParams.type);
  const events = await upcomingGameEvents(["pokemon"]);
  const filtered = format ? events.filter(e => e.eventFormats?.includes(format.value)) : events;
  return (
    <main id="main" className="site-width page-content atg-desk">
      <header>
        <Link className="text-link" href="/events">Gwinnett events calendar</Link>
        <h1>Pokémon events in Gwinnett County</h1>
        <p>Find a tournament, bring a deck to league play, or take your binder to a trade night or card show.</p>
      </header>
      <nav className="calendar-tabs game-event-filters" aria-label="Filter by event type">
        <Link href="/events/pokemon" aria-current={!format ? "page" : undefined}>All events</Link>
        {eventFormats.map(f => (
          <Link key={f.value} href={"/events/pokemon?type=" + f.value}
            aria-current={format?.value === f.value ? "page" : undefined}>{f.title}</Link>
        ))}
      </nav>
      <GameEventTable events={filtered} caption={format ? format.title : "Upcoming Pokémon events"} />
      <p><Link className="text-link" href="/stories/pokemon-cards-gwinnett-county">Read the Gwinnett Pokémon card guide</Link></p>
    </main>
  );
}
