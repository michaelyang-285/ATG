import groupAudience from "@/lib/facebook-group.json";
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
      <p>
        Every week, we’ll share the Gwinnett Deals page with the{" "}
        {groupAudience.memberCountDisplay} members of the All Things Gwinnett
        Facebook group. We also share deals in our weekly newsletter. We’ll include the deals page in our welcome post so new members
        can find current offers when they join.
      </p>
      {offers.length ? (
        offers.map((row) => (
          <article key={row._id}>
            <h2>{row.deal.title}</h2>
            <Link href={listingPath(row.slug)}>{row.name}</Link>
            <p>{row.deal.terms}</p>
            <p>Valid through {row.deal.end}</p>
          </article>
        ))
      ) : (
        <p>There are no active offers right now.</p>
      )}
      <Link href="/directory">Browse the business directory</Link>
    </main>
  );
}
