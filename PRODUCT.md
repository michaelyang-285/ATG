# All Things Gwinnett

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing repository `michaelyang-285/ATG`, Next.js 14.2.35, React 18 and TypeScript. Existing Vercel project `atg-site`, team `285-marketing`, serves allthingsgwinnett.com. The founder explicitly selected connected Sanity project `xnm5c645`, public `production` dataset, replacing the old site's Sanity target. The existing Studio application `tg2pib63zu890y3tcluji8jy` uses Sanity 6.22.0. Public reads require no write token. Supabase and Stripe are not used by this release.

## Users

Gwinnett-connected residents seeking food, events, culture and practical local information. Coverage should represent multiple local perspectives, including Black, Hispanic and Asian residents. Independent small business owners are a secondary audience for the directory.

## Product Purpose

An independent local publication built around useful stories and guides, with events and a directory easy to reach.

## Positioning

Candid, attributable and human local coverage. The publication should become a lasting identity beyond any individual contributor.

## Operating Context

The established community is at https://www.facebook.com/groups/allthingsgwinnett. Editors publish stories, guides, businesses and events through Sanity. The website refreshes public content about every 60 seconds.

## Capabilities and Constraints

- Homepage, topic hubs, guides, area browsing, search, article pages, directory pages and upcoming events are implemented.
- Primary navigation: Food & drink, Things to do, Local life, Directory.
- Topic and area shortcuts appear as real published content becomes available. Main hubs remain reachable.
- Stories require a title, slug, section and publication date. Draft, hidden and future-dated stories are excluded publicly, including direct article links.
- Homepage settings can pin one featured story, three supporting stories and two guides. Recent published content provides the fallback.
- The old test article is preserved but hidden. No real reporting, photography, business listings or events were supplied for release. Explicit coming-soon states replace illustrative wireframe content.
- Newsletter collection remains closed until a real hosted signup URL is added in site settings.
- A basic directory listing is intended to cost $5 as a spam deterrent. Recurrence, approval, refund and payment workflow are unconfirmed. No checkout is active.
- Public submission APIs return unavailable until a real workflow is configured; they do not log submissions or claim success.

## Brand Commitments

Approved identity: the supplied Soft Serif logo artwork, with lowercase lettering, white interiors, vivid orange outline and shallow flat orange offset. Use the production SVG artwork rather than re-typesetting it. Logo guidance sets a 240px minimum for the full-color web mark.

Palette: orange #FF4D22, ink #171717, white #FFFFFF, surface #F5F5F2 and accessible text orange #B92F10. Typography: self-hosted DM Sans, weights 400 for body, 500 for labels, 700 for headings. The website retains a subtle neo-brutalist treatment through flat surfaces and thin rules.

Approved launch tagline: “Migos. Food. Traffic.” Keep it separate from permanent logo artwork, with a descriptive line explaining the publication.

Voice: an informed local with a point of view who respects the reader's time. Get to the point, earn opinions with specifics, sound human, write from within the community, match tone to subject, and make summaries useful. Never use profanity. Distinguish facts from judgments.

## Evidence on Hand

The supplied logo, exact palette and fonts are implemented. Approved comparison artifacts are `.impeccable/mocks/approved-homepage.png` and `.impeccable/mocks/approved-navigation.png`. Illustrative headlines in these references are not reported facts. No testimonials, readership claims or commercial outcomes may be invented.

## Product Principles

- Serve people who live in Gwinnett and want to participate in its life.
- Make room for multiple local voices and candid, attributable judgments.
- Put useful local reading first.
- Keep empty states truthful and operational flows explicit.
- Focus the directory on independent businesses rather than franchises.

## Approved Homepage and Navigation

On November 4, 2026, the founder approved Option A — The guide desk — and its navigation: “A is good. Nav is fine too”. Stories and local guides lead, followed by more guides, local plans, the directory, newsletter and footer. Desktop uses dropdowns; mobile uses expandable menu sections. Search, newsletter, all-guides and area shortcuts support the main topics.

The founder subsequently explicitly authorized updating the existing GitHub ATG repository, Sanity and Vercel projects, and chose `xnm5c645` as the content project. No additional publication permission is pending for this implementation.

## Implementation Record — November 4, 2026

Direction seed `ff5b2443`, scope surface/read, dealt 3/5/2, approved option A. Desktop lead ratio 2.7:1; mobile 2.4:1. The hero reproduction checkpoint was captured late, after the full implementation, and does not establish a before-lower-content checkpoint.

The independent finish review closed all seven material fixes: lead proportions, tablet search, conditional topic inventory, SVG icons, metadata order, checkpoint evidence and this implementation record. The final review disposition is ship for those fixes. Populated navigation and metadata were verified with clearly labeled local sample content in an isolated copy, never published to Sanity or the website.
