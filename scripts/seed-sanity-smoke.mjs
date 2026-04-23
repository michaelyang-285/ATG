/**
 * Idempotent smoke seed for Sanity (ATG).
 *
 * Requires a write token:
 *   https://www.sanity.io/manage → your project → API → Tokens → Add API token (Editor)
 *
 * Usage (repo root):
 *   export SANITY_API_WRITE_TOKEN="sk..."
 *   npm run seed:sanity
 *
 * Or put SANITY_API_WRITE_TOKEN in .env.local (loaded automatically).
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
dotenv.config({ path: join(root, '.env') })
dotenv.config({ path: join(root, '.env.local') })

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_STUDIO_PROJECT_ID ||
  'zl7y53re'
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_STUDIO_DATASET ||
  'production'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!token) {
  console.error(
    '\nMissing SANITY_API_WRITE_TOKEN.\n\nCreate one: https://www.sanity.io/manage → Project → API → Tokens (Editor).\nThen:\n  export SANITY_API_WRITE_TOKEN="sk..."\n  npm run seed:sanity\n\nOr add SANITY_API_WRITE_TOKEN to .env.local at the repo root.\n',
  )
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const IDS = {
  category: 'atg-seed-category',
  storyHero: 'atg-seed-story-hero',
  storySide: 'atg-seed-story-side',
  event: 'atg-seed-event',
  list: 'atg-seed-list',
  business: 'atg-seed-business',
}

function slug(current) {
  return { _type: 'slug', current }
}

async function seed() {
  console.log(`Seeding ${projectId} / ${dataset} …\n`)

  await client.createIfNotExists({
    _id: IDS.category,
    _type: 'category',
    name: "Today's lead",
    color: 'orange',
  })

  await client.createIfNotExists({
    _id: IDS.storyHero,
    _type: 'story',
    title: 'ATG smoke test: Sanity is connected',
    deck: 'If you see this story on the homepage hero, your Studio content is flowing into Next.js. Replace it in Studio when you are ready.',
    slug: slug('atg-smoke-test-lead'),
    publishedAt: new Date().toISOString(),
    readTime: 3,
    location: 'Gwinnett County',
    author: 'ATG Staff',
    category: { _type: 'reference', _ref: IDS.category },
  })

  await client.createIfNotExists({
    _id: IDS.storySide,
    _type: 'story',
    title: 'Second seed story (sidebar)',
    deck: 'Used for the homepage sidebar rail. Safe to delete after real content exists.',
    slug: slug('atg-smoke-test-sidebar'),
    publishedAt: new Date().toISOString(),
    readTime: 2,
    location: 'Duluth',
    author: 'ATG Staff',
    category: { _type: 'reference', _ref: IDS.category },
  })

  await client.createIfNotExists({
    _id: IDS.event,
    _type: 'event',
    name: 'ATG smoke test event',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Suwanee Town Center',
    price: 'Free',
    slug: slug('atg-smoke-test-event'),
  })

  await client.createIfNotExists({
    _id: IDS.list,
    _type: 'list',
    title: 'ATG smoke test list',
    subtitle: 'Placeholder list for the homepage rail.',
    order: 99,
    slug: slug('atg-smoke-test-list'),
  })

  await client.createIfNotExists({
    _id: IDS.business,
    _type: 'business',
    name: 'ATG Smoke Test Bakery',
    businessType: 'Bakery · Smoke test',
    location: 'Lawrenceville',
    description: 'Placeholder business for the homepage spotlight. Delete when real businesses exist.',
    status: 'opened',
    openedAt: new Date().toISOString().slice(0, 10),
    slug: slug('atg-smoke-test-bakery'),
  })

  const homepageCount = await client.fetch(`count(*[_type == "homepage"])`)

  if (homepageCount === 0) {
    await client.create({
      _type: 'homepage',
      ticker: [
        'Smoke test: Sanity ticker is live.',
        'Edit Homepage in Studio to change these lines.',
      ],
      heroStory: { _type: 'reference', _ref: IDS.storyHero },
      sidebarStories: [
        { _type: 'reference', _ref: IDS.storySide },
        { _type: 'reference', _ref: IDS.storyHero },
      ],
      newsletterHeadline: 'Gwinnett in 3 minutes. Every Thursday.',
      newsletterSub: 'No fluff. No tourism board energy. Just what actually happened.',
      subscriberCount: '6.2k+ locals already subscribed',
      communityQuote: 'If you can read this quote on the homepage, the homepage document and fields are wired.',
      communityQuoteSource: 'ATG seed script',
    })
    console.log('Created first Homepage document (none existed) with hero + sidebar + ticker.')
  } else {
    console.log(
      'A Homepage document already exists — skipped creating a new one so we do not overwrite your content.',
    )
    console.log(
      'In Studio: open Homepage → set Hero story to “ATG smoke test: Sanity is connected” and add ticker lines if you want to see the same checks.',
    )
  }

  console.log('\nDone. Next steps:')
  console.log('  1. npm run studio  → confirm documents in Structure.')
  console.log('  2. npm run dev     → open http://localhost:3000 and refresh.')
  console.log('  3. Remove seed docs in Studio when you no longer need them.\n')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
