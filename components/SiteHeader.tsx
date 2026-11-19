"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { browserClient } from "@/lib/browser-client";
export type NavItem = {
  label: string;
  href: string;
  children: { label: string; href: string }[];
};
const Search = ({ id }: { id: string }) => (
  <form action="/search" role="search" className="site-search">
    <label className="sr-only" htmlFor={id}>
      Search All Things Gwinnett
    </label>
    <input
      id={id}
      name="q"
      placeholder="Search the site"
      type="search"
      maxLength={100}
    />
    <button aria-label="Search" type="submit">
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </svg>
    </button>
  </form>
);
export default function SiteHeader({ items }: { items: NavItem[] }) {
  const [menu, setMenu] = useState(false),
    [expanded, setExpanded] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null),
    trigger = useRef<HTMLButtonElement>(null),
    header = useRef<HTMLElement>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    const client = browserClient();
    if (!client) { setSignedIn(false); return; }
    const { data } = client.auth.onAuthStateChange((_, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);
  const pathname = usePathname();
  useEffect(() => {
    setMenu(false);
    setExpanded(null);
  }, [pathname]);
  useEffect(() => {
    if (!menu) return;
    const d = dialog.current;
    d?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      d?.close();
      document.body.style.overflow = previous;
      trigger.current?.focus();
    };
  }, [menu]);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!header.current?.contains(e.target as Node)) setExpanded(null);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);
  const collapse = () => {
    setMenu(false);
    setExpanded(null);
  };
  const accountLinks = signedIn === null ? null : signedIn ? (
    <Link className="text-link" href="/directory/manage" onClick={collapse}>My account</Link>
  ) : (
    <>
      <a className="text-link" href="/directory/manage?mode=signin">Sign in</a>
      <a className="text-link" href="/directory/manage?mode=signup">Create an account</a>
    </>
  );
  return (
    <header
      className="site-header"
      ref={header}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setExpanded(null);
          (e.target as HTMLElement)
            .closest(".nav-group")
            ?.querySelector("button")
            ?.focus();
        }
      }}
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="site-width masthead">
        <Link href="/" aria-label="All Things Gwinnett home" onClick={collapse}>
          <img
            className="brand-logo"
            src="/brand/logo.svg"
            alt="All Things Gwinnett"
            width="260"
            height="86"
          />
        </Link>
        <div className="desktop-tools">
          <div style={{display:"flex", gap:"1rem", whiteSpace:"nowrap"}}>{accountLinks}</div>
          <Search id="desktop-search" />
          <Link className="button button-orange" href="/newsletter">
            Get the newsletter
          </Link>
        </div>
        <button
          className="menu-trigger"
          ref={trigger}
          onClick={() => setMenu(true)}
          aria-haspopup="dialog"
          aria-expanded={menu}
        >
          Menu{" "}
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>
      <nav aria-label="Main navigation" className="site-width desktop-nav">
        {items.map((item, i) => (
          <div
            className="nav-group"
            key={item.href}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node))
                setExpanded(null);
            }}
          >
            <Link
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
            <button
              aria-label={`Show ${item.label} links`}
              aria-expanded={expanded === item.href}
              aria-controls={`nav-submenu-${i}`}
              onClick={() =>
                setExpanded(expanded === item.href ? null : item.href)
              }
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
              >
                <path d="m3 6 5 5 5-5" />
              </svg>
            </button>
            {expanded === item.href && (
              <ul id={`nav-submenu-${i}`} className="nav-submenu">
                {item.children.map((c) => (
                  <li key={c.href}>
                    <Link href={c.href} onClick={collapse}>
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
      <dialog
        ref={dialog}
        className="mobile-menu"
        aria-label="Navigation"
        onCancel={() => setMenu(false)}
      >
        <div className="menu-top">
          <Link href="/" onClick={collapse}>
            <img
              src="/brand/logo.svg"
              alt="All Things Gwinnett home"
              width="240"
              height="80"
            />
          </Link>
          <button
            className="icon-button"
            aria-label="Close menu"
            onClick={collapse}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="m5 5 14 14M19 5 5 19" />
            </svg>
          </button>
        </div>
        <Search id="mobile-search" />
        <nav aria-label="Mobile navigation">
          {items.map((item) => (
            <details key={item.href}>
              <summary>
                {item.label}
                <svg
                  className="disclosure-icon"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  <path d="M4 12h16" />
                  <path className="disclosure-vertical" d="M12 4v16" />
                </svg>
              </summary>
              <ul>
                {item.children.map((c) => (
                  <li key={c.href}>
                    <Link href={c.href} onClick={collapse}>
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
          <div className="menu-shortcuts">
            {accountLinks}
            <Link href="/guides" onClick={collapse}>
              Browse all guides
            </Link>
            <Link href="/areas" onClick={collapse}>
              Explore by area
            </Link>
            <Link
              href="/newsletter"
              className="button button-orange"
              onClick={collapse}
            >
              Get the newsletter
            </Link>
            <a href="https://www.facebook.com/groups/allthingsgwinnett">
              Join the Facebook group
            </a>
          </div>
        </nav>
      </dialog>
    </header>
  );
}
