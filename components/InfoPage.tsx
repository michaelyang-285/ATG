import Link from "next/link";
export const info: Record<string, { title: string; paragraphs: string[] }> = {
  about: {
    title: "About All Things Gwinnett",
    paragraphs: [
      "An independent guide to Gwinnett’s food, culture, and everyday life.",
      "We’re here to help residents find worthwhile places, understand local changes, and hear from one another. Black, Hispanic, and Asian residents belong at the center of that coverage alongside their neighbors.",
      "Expect specific opinions, practical guides, and local voices. We want to know what worked, what disappointed, and why.",
    ],
  },
  contact: {
    title: "Get in touch",
    paragraphs: [
      "Have a local story, a question, or a correction? Contact the admins of the All Things Gwinnett Facebook group.",
      "For corrections, include the article link and explain what needs to be checked.",
    ],
  },
  contribute: {
    title: "Bring your perspective",
    paragraphs: [
      "Live here? Know a story we should hear? We’re interested in local perspectives on food, culture, neighborhoods, and everyday life in Gwinnett.",
      "Send the group admins a short introduction and your story idea. Tell us what you know firsthand, what you’d need to report, and any personal or business connection to the subject.",
      "Please ask permission before sharing someone else’s private group post or story. Contributor terms will be discussed before publication.",
    ],
  },
  "editorial-standards": {
    title: "Our editorial standards",
    paragraphs: [
      "We distinguish verified facts, resident experiences, allegations, and editorial judgments. Opinions should be attributable and supported by specifics.",
      "We identify reporting, opinion, owner-submitted directory details, and paid placements. A paid directory listing is not an editorial endorsement or a place in a best-of list.",
      "We give people a fair chance to answer significant criticism and correct material errors visibly. We credit contributors and seek permission before quoting private group posts.",
      "AI may help with drafting and organization; a named human verifies the work. We don’t invent visits, interviews, quotes, or identities, and generated imagery does not stand in for reporting photographs.",
      "We disclose relevant commercial relationships, including relationships with 285 Marketing. Client status should not determine editorial judgments.",
    ],
  },
  advertise: {
    title: "Reach people who live here",
    paragraphs: [
      "Interested in a clearly labeled sponsorship or advertising on All Things Gwinnett? Contact the group admins to discuss the opportunity.",
      "Paid placements are separate from editorial coverage. A commercial relationship does not buy a favorable review or inclusion in a recommendation list.",
    ],
  },
  privacy: {
    title: "Privacy",
    paragraphs: [
      "You can browse this site without creating an account. Search terms are used to display matching public content.",
      "This website is hosted by Vercel, and published content is served through Sanity. Those services receive normal technical request information needed to deliver the website, such as your IP address and browser details.",
      "Links to Facebook and other external websites take you to services with their own privacy practices. Newsletter signup is not open on this website yet.",
      "To ask about privacy, contact the All Things Gwinnett group admins through Facebook.",
    ],
  },
  "directory-submit": {
    title: "List your independent business",
    paragraphs: [
      "The directory is for independent small businesses around Gwinnett, including food businesses, beauty professionals, and local services. Franchises and large businesses aren’t the focus.",
      "The signup price is $3 for a basic directory listing. A listing is not an editorial endorsement, and an exclusive group promotion is not required for a basic listing.",
      "Submissions and payment are not open yet. The billing and review details will be shown before you submit or pay. In the meantime, contact the group admins to express interest.",
    ],
  },
};
export default function InfoPage({ kind }: { kind: string }) {
  const page = info[kind];
  return (
    <main id="main" className="site-width page-content">
      <article className="prose">
        <h1>{page.title}</h1>
        <div style={{ marginTop: 28 }}>
          {page.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <a
          className="text-link"
          href="https://www.facebook.com/groups/allthingsgwinnett"
        >
          Visit the Facebook group <span aria-hidden="true">↗</span>
        </a>
        <p style={{ marginTop: 28 }}>
          <Link href="/">Back to All Things Gwinnett</Link>
        </p>
      </article>
    </main>
  );
}
