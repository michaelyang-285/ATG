import groupAudience from "@/lib/facebook-group.json";
import Link from "next/link";
import { facebookGroup } from "@/lib/gwinnett";
import "./advertise.css";

const title = "Advertise where Gwinnett neighbors ask for recommendations";
const description = "Meet the All Things Gwinnett Facebook community, explore membership by city, and ask about advertising your local business.";
export const metadata = { title, description, alternates: { canonical: "/advertise" } };

const cities = [
  ["Lawrenceville", 5979], ["Snellville", 3133], ["Lilburn", 2174],
  ["Dacula", 2063], ["Buford", 2052], ["Suwanee", 1949], ["Grayson", 1319],
  ["Duluth", 1219], ["Sugar Hill", 1077], ["Loganville", 1025],
  ["Peachtree Corners", 784], ["Braselton", 626], ["Auburn", 560], ["Norcross", 497],
] as const;
const monthly = [
  ["3,900", "new members"], ["1,100", "posts"], ["9,500", "comments"], ["18,400", "reactions"],
];

export default function AdvertisePage() {
  return (
    <main id="main" className="site-width page-content ad-page">
      <header className="ad-hero">
        <h1>{title}</h1>
        <p>Introduce your business to <strong>{groupAudience.memberCountDisplay} members of the All Things Gwinnett Facebook group.</strong> Neighbors come here to ask for recommendations, discover local businesses, and keep up with what’s happening around the county.</p>
        <a className="button button-orange" href="#advertising">Ask about advertising</a>
      </header>
      <section>
        <h2>A month in All Things Gwinnett</h2>
        <dl className="ad-stats">{monthly.map(([value, label]) => (
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
        ))}</dl>
        <small>Rounded monthly averages for September and October 2026. Source: Facebook Group Insights.</small>
      </section>
      <aside className="ad-invite">
        <div><h2>See the community for yourself</h2><p>Join the group and browse the conversations happening in the neighborhoods you serve.</p></div>
        <a className="button button-orange" href={facebookGroup}>Join the Facebook group</a>
      </aside>
      <section>
        <h2>Find your local audience</h2>
        <p><strong>20,194 members across 10 Gwinnett cities</strong> account for nearly 52% of the reported audience. Lawrenceville alone is home to nearly 6,000 members.</p>
        <figure><figcaption>Group members by city</figcaption>
          <ol className="ad-cities">{cities.map(([city, count]) => (
            <li key={city}><span>{city}</span><span className="ad-track" aria-hidden="true"><i style={{ width: (100 * count / cities[0][1]) + "%" }} /></span><strong>{count.toLocaleString("en-US")}</strong></li>
          ))}</ol>
          <small>Source: Facebook Group Insights, November 18, 2026. The chart also includes Buford, Loganville, Braselton, and Auburn. These four cities span county lines and are excluded from the 52% figure. Percentages use the 39,054 members in the country breakdown.</small>
        </figure>
      </section>
      <section id="advertising">
        <h2>Discuss a sponsorship</h2>
        <p>Message a group admin with your target cities, timing, budget range, and what you’d like neighbors to do. We’ll discuss availability and placement options. We label sponsored placements and choose editorial stories independently.</p>
        <a className="button button-orange" href={facebookGroup}>Find the group admins on Facebook</a>
        <h3>Give your business a directory listing</h3>
        <p>Help neighbors find your hours, service area, website, and directions. Basic listings are free, with a $9 annual upgrade for priority placement, photos and deals.</p>
        <Link className="text-link" href="/account">Create a directory listing</Link>
      </section>
    </main>
  );
}
