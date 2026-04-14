import { client } from '@/lib/sanity'
import Nav from '@/components/Nav'
import Ticker from '@/components/Ticker'
import StoryTag from '@/components/StoryTag'
import { Footer } from '@/components/Misc'
import Link from 'next/link'

export const revalidate = 60

export const metadata = {
  title: 'News — All Things Gwinnett',
  description: 'Local news for Gwinnett County, GA. No press releases. Just what actually happened.',
}

async function getStories() {
  try {
    return await client.fetch(`
      *[_type == "story"] | order(publishedAt desc)[0...24]{
        title, deck, slug, publishedAt, readTime, location,
        "category": category->{ name, color },
        "thumb": thumbnail.asset->url
      }
    `)
  } catch { return [] }
}

export default async function NewsPage() {
  const stories = await getStories()

  return (
    <main className="w-full">
      <Nav />
      <Ticker items={[]} />

      {/* Page header — full bleed ink */}
      <div className="bg-ink border-b-2 border-ink w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <h1 className="font-archivo text-[42px] text-white tracking-[-1px] leading-none mb-2">
            News
          </h1>
          <p className="font-georgia text-[15px] text-[#666] italic">
            What's actually happening in Gwinnett County. No press releases.
          </p>
        </div>
      </div>

      {/* Story grid */}
      <div className="bg-paper border-b-2 border-ink w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-0">
          {stories.length > 0 ? stories.map((s: any) => (
            <Link key={s.slug.current} href={`/stories/${s.slug.current}`}
              className="flex items-stretch border-b-2 border-ink last:border-b-0
                         hover:bg-card transition-colors group no-underline cursor-pointer">
              <div className="py-5 flex-1 pr-4">
                <StoryTag color={s.category?.color} name={s.category?.name ?? ''} />
                <p className="font-space text-[18px] font-bold text-ink leading-snug mb-2
                               group-hover:underline underline-offset-2">
                  {s.title}
                </p>
                <p className="font-georgia text-[14px] text-[#555] leading-relaxed mb-2">{s.deck}</p>
                <p className="font-inter text-[10px] text-[#999]">
                  {s.location && `${s.location} · `}{s.readTime} min read
                </p>
              </div>
              <div className="w-[160px] flex-shrink-0 border-l-2 border-ink bg-card
                              flex items-center justify-center text-[10px] text-[#bbb]">
                {s.thumb
                  ? <img src={s.thumb} alt={s.title} className="w-full h-full object-cover" />
                  : 'photo'}
              </div>
            </Link>
          )) : (
            // Fallback while Sanity is being set up
            <p className="py-12 font-inter text-[14px] text-[#999] text-center">
              Stories coming soon. Set up Sanity to start publishing.
            </p>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
