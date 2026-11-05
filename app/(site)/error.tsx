"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="site-width page-content">
      <h1>We couldn’t load this page.</h1>
      <p className="page-deck">Please try again in a moment.</p>
      <button className="button button-orange" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
