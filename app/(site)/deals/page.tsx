import Image from "next/image";
import Link from "next/link";
import DealDetails from "@/components/DealDetails";
import { DirectionIcon } from "@/components/DirectionIcon";
import { activeDeal } from "@/lib/directory/deal";
import { listingPath } from "@/lib/directory/profile";
import { dealPromotions } from "@/lib/directory/promotions";
import { directoryPublic } from "@/lib/directory/public";
import "./deals.css";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Gwinnett Deals | Local Offers from Gwinnett Businesses",
  description: "Discover offers from independent Gwinnett businesses. Business owners can share a deal with a paid ATG directory listing for $1 a month, billed at $12 a year.",
  alternates: { canonical: "/deals" },
};

export default async function Deals() {
  const offers = (await directoryPublic()).filter(row => activeDeal(row.deal));
  return <main id="main" className="site-width deals-front">
    <header className="deals-hero">
      <div className="deals-intro">
        <h1>Gwinnett Deals</h1>
        <h2>{offers.length ? "Local offers you can use now." : "Local offers are coming soon."}</h2>
        <p>{offers.length ? "Explore offers from independent Gwinnett businesses. Each deal includes the dates, terms, and how to use it." : "We’re gathering offers from independent shops, restaurants, and service providers across Gwinnett. Each deal will tell you where to go, when it ends, and how to redeem it."}</p>
        <Link className="deals-text-link" href={offers.length ? "#current-offers" : "/#newsletter"}>{offers.length ? "See current offers" : "Get deals in the ATG newsletter"} <DirectionIcon /></Link>
      </div>
      <Image className="deals-photo" src="/images/gwinnett-deals-counter.webp" width={1080} height={720}
        sizes="(max-width: 700px) 100vw, 48vw" priority alt="A bakery employee hands a customer a paper bag across the counter." />
    </header>
    {offers.length > 0 && <section className="deals-offers" id="current-offers"><h2>Current offers</h2>
      {offers.map(row => <article key={row._id}><h3>{row.deal.title}</h3>
        <Link className="deals-business" href={listingPath(row.slug)}>{row.name}</Link>
        <DealDetails deal={row.deal} />
      </article>)}</section>}
    <section className="deals-membership" aria-labelledby="business-offer">
      <div className="deals-pitch"><h2 id="business-offer">Put your offer in front of Gwinnett.</h2>
        <p>A paid ATG directory listing lets your business publish one active deal at a time. You choose the offer, the dates, and how neighbors redeem it.</p>
        <h3>Where we share your deal</h3><ul>{dealPromotions.map(text => <li key={text}>{text}</li>)}</ul>
      </div>
      <div className="deals-plan"><h3>Paid business listing</h3>
        <p className="deals-price"><strong>$1</strong><span> / month</span></p>
        <p className="deals-billing">Billed at $12 per year.</p>
        <Link className="button button-orange" href="/account?mode=signup&tier=paid">Get a paid listing <DirectionIcon /></Link>
        <Link className="deals-compare" href="/directory/submit">Compare listing plans</Link>
      </div>
    </section>
    <div className="deals-footer"><p>Already have a business listing? <Link href="/account">Manage your listing and deals</Link></p>
      <Link className="deals-text-link" href="/directory">Browse the business directory <DirectionIcon /></Link></div>
  </main>;
}
