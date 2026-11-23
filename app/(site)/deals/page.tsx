import DealDetails from "@/components/DealDetails";
import { dealPromotions } from "@/lib/directory/promotions";
import Link from "next/link";
import { directoryPublic } from "@/lib/directory/public";
import { activeDeal } from "@/lib/directory/deal";
import { listingPath } from "@/lib/directory/profile";
export const dynamic = "force-dynamic";
export const metadata = { title: "Gwinnett Deals | All Things Gwinnett" };
export default async function Deals() {
  const offers = (await directoryPublic()).filter((row) =>
    activeDeal(row.deal),
  );
  return (
    <main id="main" className="site-width page-content">
      <h1>Gwinnett Deals</h1>
      <p>Find Gwinnett Deals in these ATG updates.</p>
    <ul className="list-disc pl-6">{dealPromotions.map(label => <li key={label}>{label}</li>)}</ul>
      {offers.length ? (
        offers.map((row) => (
          <article key={row._id}>
            <h2>{row.deal.title}</h2>
            <Link href={listingPath(row.slug)}>{row.name}</Link>
            <DealDetails deal={row.deal}/>
          </article>
        ))
      ) : (
        <p>There are no active offers right now.</p>
      )}
      <Link href="/directory">Browse the business directory</Link>
    </main>
  );
}
