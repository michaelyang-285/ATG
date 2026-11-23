import groupAudience from "@/lib/facebook-group.json";
import Link from "next/link";
import "../directory.css";
export const metadata = {
  title: "List your business in Gwinnett | Free and paid directory listings",
};
export default function Submit() {
  return (
    <main id="main" className="site-width page-content">
      <h1>List your Gwinnett business</h1>
      <p>
        Help neighbors find your business and the cities you serve. Start free
        and upgrade from your account whenever you’re ready.
      </p>
      <div className="listing-plans">
        <section>
          <h2>Free listing</h2>
          <p>
            <strong>$0</strong>
          </p>
          <ul>
            <li>Business name, logo and description</li>
            <li>Hours, service area and optional public phone number</li>
            <li>Directions when you show your address</li>
            <li>Appear in directory search after approval</li>
          </ul>
          <Link className="button button-orange" href="/account">
            Create a free listing
          </Link>
        </section>
        <section>
          <h2>Paid listing</h2>
          <p>
            <strong>$9 per year, per listing</strong>
          </p>
          <p>Everything in Free, plus</p>
          <ul>
            <li>Website, social and booking links</li>
            <li>Up to 10 photos of your work</li>
            <li>One active Gwinnett Deal</li>
            <li>Upcoming approved events on your profile</li>
          </ul>
          <p>
            Every week, we’ll share the Gwinnett Deals page with the{" "}
            {groupAudience.memberCountDisplay} members of the All Things
            Gwinnett Facebook group. We’ll also include it in our welcome post
            so new members can find current offers when they join.
          </p>
          <p>Renews annually. Manage your subscription from your account.</p>
          <Link className="text-link" href="/account">
            Manage or upgrade a listing →
          </Link>
        </section>
      </div>
      <p>
        ATG reviews submissions before publication. Free listings do not require
        a credit card.
      </p>
      <p>
        Already see your business?{" "}
        <Link href="/directory">Find your listing</Link> and select “Claim this listing.” ATG will verify ownership.
      </p>
    </main>
  );
}
