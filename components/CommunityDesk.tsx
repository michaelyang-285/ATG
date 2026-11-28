import InquiryForm from "./InquiryForm";
import Link from "next/link";
import { facebookGroup } from "@/lib/gwinnett";
import "./community.css";
const desks = {
  advertise: {
    title: "Reach people who live in Gwinnett",
    lead: "Opening a shop, filling seats at a show, or introducing a service to a new neighborhood? Tell us who you want to reach and where they live.",
    sections: [
      [
        "Discuss a sponsorship",
        "For a campaign tied to a date, use the partnership form to share your launch window, budget range, target cities, and the action you want readers to take. We’ll discuss availability and what a labeled placement could look like.",
      ],
      [
        "Give your business a home",
        "A directory profile is where neighbors can find your hours, service area, website, and directions. Basic listings are free. ATG reviews submissions before publication.",
      ],
      [
        "How editorial coverage works",
        "Editors choose stories and guide entries independently. We identify sponsored placements so readers know who paid for them.",
      ],
    ],
    actions: [
      ["Ask about advertising", "/advertise#advertising"],
      ["Create a directory listing", "/account"],
    ],
  },
  contribute: {
    title: "Bring a Gwinnett story to the table",
    lead: "Some of our best leads start with someone who noticed a change on their block. You can bring us a tip, pitch a reported piece, or share a date for the calendar.",
    sections: [
      [
        "Pitch a story",
        "Tell the editorial team what happened, where, why it matters now, and how you know. For a restaurant opening, for example, include the cross streets, the opening date, and who can confirm it.",
      ],
      [
        "Write from experience",
        "Include a short introduction, your connection to the area, any relationship to the subject, and one example of your work if you have one. We’ll discuss scope and contributor terms before publication.",
      ],
      [
        "Share a community event",
        "For festivals, meetups, performances, and workshops, use the events form. Have the venue, dates, cost, and organizer’s link handy. Get permission before sharing private posts or someone else’s photos.",
      ],
    ],
    actions: [
      ["Pitch a story", "/contribute"],
      ["Submit an event", "/events/submit"],
    ],
  },
  contact: {
    title: "Contact All Things Gwinnett",
    lead: "Start with the team that can help. Our team handles editorial questions, listing support, corrections, and sponsorship inquiries.",
    sections: [
      [
        "Request a correction",
        "Send the article URL, the specific detail to check, and a firsthand source or public record when available. For a time-sensitive change, include the effective date.",
      ],
      [
        "Get listing or payment help",
        "Include your business name, listing URL if available, and what happened. Use the contact form for account or payment questions. Keep card details, passwords, and sign-in links out of messages.",
      ],
      [
        "Ask your neighbors",
        "Looking for a mobile barber in Buford, a mechanic near Lilburn, or somewhere to take family this weekend? Post in the Facebook group and include your city so neighbors can give relevant answers.",
      ],
    ],
    actions: [
      ["Contact the team", "#contact-form"],
      ["Manage my listing", "/account?mode=signin"],
    ],
  },
  about: {
    title: "A local guide built around Gwinnett",
    lead: "All Things Gwinnett grew out of the conversations neighbors have every day. Here, a recommendation can become a guide, a question can become a story, and a local business can be easier to find.",
    sections: [
      [
        "What we cover",
        "Food and drink, things to do, and the changes that affect everyday life across Gwinnett County. We look for specifics, from the dish people drive across town for to the details a family needs before heading to an event.",
      ],
      [
        "Who belongs here",
        "Gwinnett includes storefronts and home-based businesses, newcomers and longtime residents, faith communities and independent workers. Black, Hispanic, Asian, and other local voices shape what we cover.",
      ],
      [
        "Where the conversation happens",
        "The website gives stories, events, and listings a home. The Facebook group is where residents compare notes, ask follow-up questions, and tell us what deserves a closer look.",
      ],
    ],
    actions: [
      ["Join All Things Gwinnett on Facebook", facebookGroup],
      ["Read our editorial standards", "/editorial-standards"],
    ],
  },
};
export type Desk = keyof typeof desks;
export function deskMetadata(kind: Desk) {
  const d = desks[kind];
  return {
    title: d.title,
    description: d.lead,
    alternates: { canonical: "/" + kind },
  };
}
export default function CommunityDesk({ kind }: { kind: Desk }) {
  const d = desks[kind];
  return (
    <main id="main" className="site-width page-content atg-desk">
      <header>
        <h1>{d.title}</h1>
        <p>{d.lead}</p>
        <div>
          {d.actions.map(([label, url], i) => (
            <Link
              key={url}
              className={i ? "text-link" : "button button-orange"}
              href={url}
            >
              {label}
            </Link>
          ))}
        </div>
      </header>
      {kind==="contact" && <section id="contact-form"><h2>Send a message</h2><InquiryForm kind="contact"/></section>}
      <section>
        {d.sections.map(([title, body]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
