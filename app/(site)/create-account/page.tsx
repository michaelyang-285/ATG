import EventSubmission from "@/components/EventSubmission";
import { facebookGroup } from "@/lib/gwinnett";
import "@/components/community.css";

export const metadata = {
  title: "Create an account | All Things Gwinnett",
  description: "Create a free All Things Gwinnett account to submit a local event or add your business to the Gwinnett directory.",
};

export default function CreateAccount() {
  return (
    <main id="main" className="site-width page-content directory-owner">
      <div className="signup-layout">
        <section className="signup-intro">
          <h1>Create an ATG account</h1>
          <p>Hosting a trade night in Duluth? Cutting hair in Buford? Create a free account to submit your event or add your business or independent service to the Gwinnett directory.</p>
          <p className="fee-note">One account covers both. Event submissions are free. Directory listings have a one-time $3 listing fee.</p>
          <h2>Meet the neighbors behind ATG</h2>
          <p>Our Facebook group has <strong>39,000 members</strong>. Neighbors share weekend plans, ask who they should hire, and trade local recommendations. The group averaged <strong>9,500 comments a month</strong> in September and October 2026.</p>
          <p><a className="text-link" href={facebookGroup}>Visit the Facebook group</a></p>
          <small>Source: Facebook Group Insights, November 2026. <a href="/advertise">See the audience breakdown</a>.</small>
        </section>
        <EventSubmission generalAccount />
      </div>
    </main>
  );
}
