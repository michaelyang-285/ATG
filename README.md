# All Things Gwinnett

Local news, food, events, and community for Gwinnett County, GA.

**Stack:** Next.js 14 (App Router) · Tailwind CSS · Sanity CMS · Vercel

---

## Site structure

```
allthingsgwinnett.com/
├── /                          Homepage
├── /news                      All news stories
├── /eats                      Food & drink stories + restaurant picks
├── /events                    Upcoming events, grouped by month
├── /opinions                  Community voices + editorials
├── /businesses                Business directory
├── /businesses/[slug]         Individual business page
├── /stories/[slug]            Individual story/article page
├── /events/[slug]             Individual event page
├── /lists/[slug]              Individual listicle (8 best tacos, etc.)
├── /newsletter                Newsletter signup page
├── /submit-a-business         Public business submission form
├── /about                     About ATG
├── /advertise                 Advertising info
└── /submit-a-tip              Story tip submission
```

---

## Taxonomy system

ATG uses a **two-level taxonomy**: Sections (nav) → Categories (tags).

### Sections (top-level nav)
| Section | URL | Purpose |
|---|---|---|
| News | /news | Local news — crime, schools, development, roads |
| Eats | /eats | Food & drink stories, restaurant reviews, best-of lists |
| Events | /events | What's happening in Gwinnett |
| Opinions | /opinions | Community voices, letters, editorials |
| Businesses | /businesses | Business directory + new openings |

### Categories (fine-grained, live under a section)

**News**
- Crime & safety
- Schools
- Development
- Roads & traffic
- Local government
- Health
- Community

**Eats**
- Restaurant review
- New opening
- Food news
- Bar & drinks
- Best-of list

**Events**
- Free events
- Family
- Music
- Food & drink events
- Sports
- Festivals

**Opinions**
- Community voice
- Editorial
- Hot take

**Businesses**
- Just opened
- Coming soon
- Closed
- Business news

### How to set up in Sanity Studio
1. Create each Section document first (News, Eats, Events, Opinions, Businesses)
2. Create Category documents — link each to its parent Section
3. When writing a Story, pick its Category (Section is inferred automatically)

---

## Content types (Sanity documents)

| Type | Controls | Who creates it |
|---|---|---|
| **Homepage** | Ticker, hero story, newsletter copy, community quote | ATG editor |
| **Story** | All articles and reviews | ATG editor |
| **Section** | Top-level nav sections | Set up once, rarely changed |
| **Category** | Story tags/filters | Set up once, add as needed |
| **Event** | Upcoming events | ATG editor or scraped |
| **List** | Listicles (8 best tacos…) | ATG editor |
| **Business** | Business directory entries | Scraped, user-submitted, or ATG staff |

---

## Business submissions

Users submit via `/submit-a-business` → hits `/api/submit-business` → creates a **draft** in Sanity with `status: pending`. You review and publish in Sanity Studio. Nothing goes live without your approval.

For bulk imports (scraping), run:
```bash
npx ts-node scripts/import-businesses.ts
```

---

## Layout pattern

Every section uses **full-bleed background + contained content**:

```tsx
// Full-bleed color bar
<div className="bg-ink border-b-2 border-ink w-full">
  // Contained content — max 1200px, centered, with gutters
  <div className="max-w-[1200px] mx-auto px-6">
    {/* content */}
  </div>
</div>
```

Change `max-w-[1200px]` in one place to adjust site width everywhere.

---

## Quick start

```bash
git clone https://github.com/YOUR_ORG/all-things-gwinnett
cd all-things-gwinnett
npm install
cp .env.local.example .env.local
# Add your Sanity project ID
npm run dev
```

## Deploy to Vercel

```bash
vercel --prod
```

Set env vars in Vercel dashboard:
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET` → `production`
- `SANITY_API_TOKEN`
