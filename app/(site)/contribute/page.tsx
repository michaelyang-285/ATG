import { BotIdClient } from "botid/client";
import InterestForm from "./InterestForm";
import "./contribute.css";

export const metadata = {
  title: "Write for All Things Gwinnett",
  description: "Share a story only a local could tell. Meet Michael, see what contributors receive, and pitch an idea or ask for a topic.",
  alternates: { canonical: "/contribute" },
};

const guidelines = [
  ["Start with Gwinnett", "I want every story to help someone understand what’s happening here in Gwinnett. If a state decision changes a local bus route, tell riders which stops are affected."],
  ["Cover faith and politics", "I want readers to understand how faith and politics shape everyday life in Gwinnett. You might cover a church opening its doors as a warming shelter or explain how a city council vote affects your neighborhood. Leave campaigning and religious persuasion out of the piece."],
  ["Give us your honest take", "I want readers to hear the same honest opinion you’d give a neighbor who asked if a place was worth the trip. If you’re reviewing a restaurant, tell us what you ordered, what you loved, and what fell short. Back factual claims with details we can check. You can write about your own shop or event. Tell readers your connection and give them something useful beyond what you sell."],
  ["Show how you know", "I want readers to know why you’re the person to tell this story. If you’re sharing a birding spot, tell us how often you walk that trail, what you’ve spotted, and where readers can check the details. In search, that’s called E-E-A-T. It stands for experience, expertise, authoritativeness, and trustworthiness."],
  ["Use AI as a guide", "I welcome AI as a second set of eyes while you work. Use it to organize field notes or flag a confusing sentence. Write the story in your own voice and send photos of what you actually saw. I prefer a quick phone photo from your visit, and professional shots are welcome too. Fully AI-generated articles and photos fall outside our guidelines."],
  ["Expect a light edit and an honest conversation", "I want the finished story to sound like you and be easy for a neighbor to follow. I’ll fix grammar and smooth out wording without flagging every small change. Your opinion stays yours. If I’m unsure what you meant, I’ll ask. I leave my ego out of edits and ask you to do the same. If an edit loses a detail that matters, tell me."],
];

export default function Contribute() {
  return <main id="main" className="site-width page-content contributor">
    <BotIdClient protect={[{ path: "/api/contributor-interest", method: "POST" }]} />
    <header><h1>Help me tell the story of Gwinnett.</h1>
      <p>When I asked who wanted to write for ATG, a coworking space in Lawrenceville pointed me toward the history of its building. A homeschooling parent offered to share places other families miss. Those are the stories I want to do justice to.</p>
      <p>I’ve spent over 14 years in enterprise SEO. I want to bring that experience home so that when someone searches Google or asks ChatGPT about Gwinnett, they can find the people who know it firsthand. People like you.</p>
      <p><strong>Michael Yang</strong> · Founder, All Things Gwinnett</p>
      <a className="button button-orange" href="#interest">I’m interested</a>
    </header>
    <section><h2>What you get when we publish</h2>
      <p>ATG is entirely bootstrapped, with zero corporate funding. Contributions are unpaid right now. Here’s what I can offer for every published piece.</p>
      <ul><li><strong>A local audience.</strong> We share every story in our Facebook group of 39,000 members.</li>
      <li><strong>Your byline.</strong> You get a published piece for your portfolio, with your name on it.</li>
      <li><strong>A link to your website.</strong> A link from allthingsgwinnett.com may help your website show up higher in Google search results. It also gives local readers a direct way to visit your shop, book a service, or buy from you.</li></ul>
      <p>Facebook is where we started. The website gives stories a home, with Instagram, TikTok, and local events planned.</p>
    </section>
    <section><h2>Writing for ATG</h2>{guidelines.map(([title,body]) => <details key={title}><summary>{title}</summary><p>{body}</p></details>)}</section>
    <section id="interest"><h2>What would you like to cover?</h2><p>Pitch an idea before writing a draft, or ask me for a topic. A sentence or two is plenty. I review the topic first and make the final publication decision after reading the finished piece.</p><InterestForm /></section>
  </main>;
}
