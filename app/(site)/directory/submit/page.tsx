import Link from "next/link";
import group from "@/lib/facebook-group.json";
import { DirectionIcon } from "@/components/DirectionIcon";
import "./plans.css";

export const metadata = {
  title: "List your business in Gwinnett | Compare free and paid listings",
  description: "Create a free Gwinnett business listing, or upgrade for $9 a year to share a local deal, show your work and take bookings.",
};

const features = [
  ["Business profile", "Logo, hours, phone & service area", "Everything in Free"],
  ["Customer links", "None", "Website, socials & booking"],
  ["Photos of your work", "Logo only", "Logo + 10 photos"],
  ["Deals & events", "None on profile", "One active deal + approved events"],
];

export default function Submit() {
  return <main id="main" className="site-width directory-pricing">
    <header className="pricing-intro"><h1>List your business in Gwinnett.</h1>
      <p>Start free so neighbors can find you. For $9 a year, show them your work, give them a deal and send them straight to your booking page.</p>
    </header>
    <table className="pricing-matrix">
      <caption className="sr-only">Compare free and paid directory listings</caption>
      <colgroup><col className="feature-column"/><col/><col/></colgroup>
      <thead><tr><th scope="col" className="matrix-label">Compare listings</th>
        <th scope="col"><span>Free listing</span><strong>$0</strong></th>
        <th scope="col" className="paid-heading"><span>Paid listing</span><strong>$9<small> / year</small></strong></th>
      </tr></thead>
      <tbody>{features.map(([label,free,paid])=><tr key={label}><th scope="row">{label}</th><td>{free}</td><td>{paid}</td></tr>)}</tbody>
    </table>
    <div className="pricing-actions">
      <Link className="button button-orange" href="/account?mode=signup">Create my free listing <DirectionIcon/></Link>
      <Link className="text-link" href="/account?mode=signin">Already listed? Sign in</Link>
    </div>
    <section className="pricing-deals"><div><h2>Give Gwinnett a reason to stop by.</h2><Link href="/deals">Explore Gwinnett Deals <DirectionIcon/></Link></div>
      <p>Publish an offer on <strong>Gwinnett Deals</strong> with your paid listing. Every week, we share the deals page with our <strong>{group.memberCountDisplay} Facebook group members</strong>. We also link to it in our welcome post for new members.</p>
    </section>
    <p className="pricing-claim">Already see your business? <Link href="/directory">Find and claim your listing.</Link></p>
  </main>;
}
