import { localClock, shift } from "./event-time";

export const libraryPath = "/events/gwinnett-libraries";
export const libraryCalendar = "https://gwinnettpl.libnet.info/events";
const host = "https://gwinnettpl.libnet.info";
const filters = { location: ["all"], ages: ["all"], types: ["all"], tags: [], term: "", days: 1 };
const feed = host + "/feeds?data=" + encodeURIComponent(Buffer.from(JSON.stringify({ feedType: "rss", filters })).toString("base64"));

function plain(s: string) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g," ").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,"&").replace(/\s+/g," ").trim();
}
function field(xml: string, name: string) {
  return plain(xml.match(new RegExp("<"+name+">([\\s\\S]*?)</"+name+">"))?.[1] || "");
}
async function source(url: string) {
  const r = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) });
  if (!r.ok) throw new Error("Library source unavailable");
  return r.text();
}
export async function libraryFeed() {
  const xml = await source(feed);
  if (!xml.includes("</channel>")) throw new Error("Incomplete library feed");
  const events = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g)).flatMap(([,item]) => {
    const url = field(item,"link");
    const id = url.match(/^https:\/\/gwinnettpl\.libnet\.info\/event\/(\d+)$/)?.[1];
    const stamp = Date.parse(field(item,"pubDate"));
    if (!id || !Number.isFinite(stamp)) return [];
    // Communico writes the local wall clock into the RSS +0000 field.
    const start = new Date(stamp).toISOString().slice(0,16);
    const time = field(item,"description").match(/\b\d{1,2}:\d{2}[ap]m\s*-\s*\d{1,2}:\d{2}[ap]m/i)?.[0];
    return [{ id, url, start, day:start.slice(0,10), time:time || start.slice(11), title:field(item,"title"), description:field(item,"content:encoded") }];
  });
  return { events: events.sort((a,b)=>a.start.localeCompare(b.start)), updated: field(xml.split("<item>")[0],"lastBuildDate") };
}
export type Listing = Awaited<ReturnType<typeof libraryFeed>>["events"][number];
export async function enrich(event: Listing) {
  let branch = "", address = "";
  const ages: string[] = [];
  try {
    const html = await source(event.url);
    for (const [,href,inner] of Array.from(html.matchAll(/<a\b[^>]*?\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi))) {
      const label = plain(inner);
      if (href.endsWith("#branch") && /\w/.test(label)) branch = label;
      if (/\/events\?a=/.test(href) && label && !ages.includes(label)) ages.push(label);
      if (/maps\.google\.com/.test(href) && /\d.*\w/.test(label) && !address) address = label;
    }
  } catch { /* Keep the official event link available during a detail-page outage. */ }
  const tags = new Set<string>();
  for (const age of ages) {
    if (/\b(kids|children|tweens|preschool|baby|toddlers?)\b/i.test(age) || Number(age.match(/ages?\s+(\d+)/i)?.[1] ?? 99) < 13) tags.add("Kids");
    if (/teen|ages?\s+1[3-7]/i.test(age)) tags.add("Teens");
    if (/adult|senior|ages?\s+(18|19|[2-9]\d)/i.test(age)) tags.add("Adults");
    if (/all ages/i.test(age)) tags.add("All ages");
  }
  return {...event,branch,address,ages,tags:Array.from(tags)};
}
export async function libraryWeek(offset:number) {
  const {events,updated} = await libraryFeed();
  const today = localClock(Date.now()).slice(0,10);
  const from = shift(today,offset*7), to=shift(from,6);
  const selected = events.filter(e=>e.day>=from && e.day<=to);
  const rows: Awaited<ReturnType<typeof enrich>>[] = [];
  for(let i=0;i<selected.length;i+=12) rows.push(...await Promise.all(selected.slice(i,i+12).map(enrich)));
  return {rows,updated,from,to,hasNext:events.some(e=>e.day>to)};
}
export function dayLabel(day:string) {
  return new Date(day+"T12:00:00Z").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",timeZone:"UTC"});
}
export function jsonLd(data:unknown) {return JSON.stringify(data).replace(/</g,"\\u003c");}
