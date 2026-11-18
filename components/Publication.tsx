import NewsletterSignup from "./NewsletterSignup";
import { DirectionIcon } from "@/components/DirectionIcon";
import Link from "next/link";
import Image from "next/image";
import {
  type Story,
  imageUrl,
  storyHref,
  storyLabel,
  isGuide,
  safeUrl,
} from "@/lib/publication";
export function StoryImage({
  story,
  priority = false,
}: {
  story: Story;
  priority?: boolean;
}) {
  const src = imageUrl(story.image);
  return src ? (
    <Image
      src={src}
      alt={story.image?.alt || ""}
      width={1200}
      height={675}
      priority={priority}
      sizes="(max-width: 760px) 100vw, 65vw"
      className="story-image"
    />
  ) : null;
}
export function StoryPreview({ story }: { story: Story }) {
  return (
    <article className="story-preview">
      <h3>
        <Link href={storyHref(story)}>{story.title}</Link>
      </h3>
      <p className="story-label">
        {storyLabel(story)}
        {isGuide(story) ? " · Guide" : ""}
      </p>
      {story.excerpt && <p>{story.excerpt}</p>}
    </article>
  );
}
export function Newsletter(_props: { url?: string }) {
  return (
    <section
      className="newsletter"
      id="newsletter"
      aria-labelledby="newsletter-heading"
    >
      <div>
        <h2 id="newsletter-heading">Get Gwinnett in your inbox.</h2>
        <p>Good food. Local plans. Changes worth paying attention to.</p>
      </div>
      <NewsletterSignup />
    </section>
  );
}
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
export function Footer() {
  return (
    <footer className="site-width site-footer">
      <nav aria-label="Footer">
        {[
          ["About", "/about"],
          ["Contact", "/contact"],
          ["Contribute", "/contribute"],
          ["Editorial standards", "/editorial-standards"],
          ["Advertise", "/advertise"],
          ["Privacy", "/privacy"],
        ].map(([label, href]) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
      </nav>
      <a href="https://www.facebook.com/groups/allthingsgwinnett">
        Join the Facebook group <DirectionIcon external />
      </a>
      <p className="footer-credit">
        All Things Gwinnett · Independent local coverage.
      </p>
    </footer>
  );
}
