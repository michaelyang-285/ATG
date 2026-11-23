import Link from "next/link";
import { dealPromotions } from "@/lib/directory/promotions";
import { DirectionIcon } from "@/components/DirectionIcon";
import "./plans.css";

export const metadata = {
  title: "List your business in Gwinnett | Compare free and paid listings",
  description: "Create a free Gwinnett business listing, or advertise for $1/month, billed at $12 per year, to share a local deal, show your work and take bookings.",
};

const features = [
  ["Business profile", "Logo, hours, phone & service area", "Everything in Free"],
  ["Customer links", "Website, socials & booking", "Website, socials & booking"],
  ["Photos of your work", "Logo only", "Logo + 10 photos"],
  ["Directory placement", "Standard", "Priority in matching results"],
  ["Profile flair", "Standard profile", "ATG Verified blue check"],
  ["Search optimization", "Business details for search engines", "Additional SEO markup for gallery photos and active offers"],
  ["Gwinnett Deals", "None", "One active deal"],
  ...dealPromotions.map(label => [label, "Not included", "Included"]),
  ["Events on your profile", "None", "Approved upcoming events"],
];

export default function Submit() {
  return <main id="main" className="site-width directory-pricing">
    <header className="pricing-intro"><h1>List your business in Gwinnett.</h1>
      <p>Start free so neighbors can find you. Include your website and social links at no charge. For $1/month, billed at $12 per year, get priority in the directory, show your work and share a deal with local customers.</p>
    </header>
    <table className="pricing-matrix">
      <caption className="sr-only">Compare free and paid directory listings</caption>
      <colgroup><col className="feature-column"/><col/><col/></colgroup>
      <thead><tr><th scope="col" className="matrix-label">Compare listings</th>
        <th scope="col"><span>Free listing</span><strong>$0</strong></th>
        <th scope="col" className="paid-heading"><span>Advertise your business</span><strong>$1<small> / month</small></strong><span>Billed at $12 per year</span></th>
      </tr></thead>
      <tbody>{features.map(([label,free,paid])=><tr key={label}><th scope="row">{label}</th><td>{free}</td><td>{paid}</td></tr>)}</tbody>
      <tfoot><tr><td></td><td><Link className="text-link" href="/account?mode=signup&tier=free">Create a free business listing</Link></td><td><Link className="button button-orange" aria-label="Get Started with a paid listing for $12 per year" href="/account?mode=signup&tier=paid">Get Started</Link></td></tr></tfoot>
    </table>
    <p className="pricing-claim"><Link href="/account?mode=signin">Already listed? Sign in</Link></p>
    <section className="pricing-deals"><div><h2>Give Gwinnett a reason to stop by.</h2><Link href="/deals">Explore Gwinnett Deals <DirectionIcon/></Link></div>
      <p>Publish one offer at a time on <strong>Gwinnett Deals</strong>. Neighbors can visit your listing for details and redemption instructions.</p>
    </section>
    <p className="pricing-claim">Already see your business? <Link href="/directory">Find and claim your listing.</Link></p>
  </main>;
}
