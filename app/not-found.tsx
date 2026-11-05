import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="site-width page-content">
      <h1>That page isn’t here.</h1>
      <p className="page-deck">
        The link may have changed, or the story isn’t published yet.
      </p>
      <Link href="/" className="text-link">
        Back to All Things Gwinnett →
      </Link>
    </main>
  );
}
