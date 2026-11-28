import Link from "next/link";
import { calendarNotices } from "@/lib/gcps-calendar";
import { enrich, libraryEventPath, libraryFeed, libraryPath } from "@/lib/library-events";
import { upcomingGameEvents, occurrencePath } from "@/lib/events";
import { localClock, shift } from "@/lib/event-time";
import styles from "./CalendarHighlights.module.css";

const dateLabel = (day:string) => new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",timeZone:"UTC"}).format(new Date(day));

export default async function CalendarHighlights({ sectionFront = false }: { sectionFront?: boolean } = {}) {
  const now=Date.now(), local=localClock(now), today=local.slice(0,10);
  const [library,games]=await Promise.all([
    libraryFeed().catch(()=>null), upcomingGameEvents(["pokemon"],now).catch(()=>[])
  ]);
  const school=calendarNotices(today,shift(today,365)).find(e=>e.school && e.end>=today);
  const nextProgram=library?.events.find(e=>e.start>=local);
  const program = nextProgram ? await enrich(nextProgram) : undefined;
  const game=games[0];
  const cards=[
    {label:"GCPS school calendar",url:"/events/gcps",event:school && {title:school.title,when:dateLabel(school.day)+(school.end!==school.day?" to "+dateLabel(school.end):""),url:"/events/gcps"}},
    {label:"Gwinnett library events",url:libraryPath,event:program && {title:program.title,when:dateLabel(program.day),url:libraryEventPath(program)}},
    {label:"Pokémon events",url:"/events/pokemon",event:game && {title:game.title,when:dateLabel(game.day),url:occurrencePath(game)}}
  ];
  return <section className={sectionFront ? "sf-calendars" : styles.section}><h2>School, library &amp; Pokémon calendars</h2>
    <div className={sectionFront ? "sf-calendar-grid" : styles.grid}>{cards.map(card=><article key={card.url}>
      <h3><Link href={card.url}>{card.label}</Link></h3>
      {card.event && <p><small>{card.event.when}</small><Link href={card.event.url}>{card.event.title}</Link></p>}
    </article>)}</div>
  </section>;
}