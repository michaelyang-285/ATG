import { client } from '@/lib/sanity'
import { slugHref } from '@/lib/slugHref'
import StoryTag from '@/components/StoryTag'
import Link from 'next/link'

export const revalidate = 60
export const metadata = {
  title: 'Eats — All Things Gwinnett',
  description: 'The best food and drink in Gwinnett County. Ranked by locals who actually eat here.',
}

async function getData() {
  try {
    const [stories, businesses] = await Promise.all([
      client.fetch(`*[_type == "story" && category->name in ["Food & drink", "Eats"]] | order(publishedAt desc)[0...12]{
        title, deck, slug, publishedAt, readTime, location,
        "category": category->{ name, color }, "thumb": thumbnail.asset->url
      }`),
      client.fetch(`*[_type == "business" && category == "Restaurant"] | order(openedAt desc)[0...6]{
        name, businessType, description, status, slug
      }`),
    ])
    return { stories, businesses }
  } catch { return { stories: [], businesses: [] } }
}

export default async function EatsPage() {
  const { stories, businesses } = await getData()
  const storyRows = stories.filter((s: { slug?: unknown }) => slugHref(s.slug))

  return (
    <main className="w-full">
      {/* Header */}
      <div className="bg-orange border-b-2 border-ink w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <h1 className="font-archivo text-[42px] text-white tracking-[-1px] leading-none mb-2">Eats</h1>
          <p className="font-georgia text-[15px] text-white/70 italic">
            The best food and drink in Gwinnett. Ranked by locals who actually eat here.
          </p>
        </div>
      </div>

      {/* Featured lists strip */}
      <div className="bg-yellow border-b-2 border-ink w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center gap-4 flex-wrap">
          <span className="font-archivo text-[11px] text-ink/40 uppercase tracking-[1.5px]">Quick picks:</span>
          {['Best tacos', 'Best pho', 'Best brunch', 'Hidden gems', 'New openings'].map(t => (
            <Link key={t} href={`/lists?tag=${t.toLowerCase().replace(' ', '-')}`}
              className="font-inter text-[10px] font-bold uppercase tracking-[0.8px]
                         border-2 border-ink px-3 py-2 text-ink hover:bg-ink hover:text-yellow
                         transition-colors no-underline">
              {t}
            </Link>
          ))}
        </div>
      </div>

      {/* Stories */}
      <div className="bg-paper border-b-2 border-ink w-full">
        <div className="max-w-[1200px] mx-auto px-6">
          {storyRows.length > 0 ? storyRows.map((s: any) => {
            const h = slugHref(s.slug)
            return (
            <Link key={h || s.title} href={h ? `/stories/${h}` : '/news'}
              className="flex items-stretch border-b-2 border-ink last:border-b-0
                         hover:bg-card transition-colors group no-underline">
              <div className="py-5 flex-1 pr-4">
                <StoryTag color={s.category?.color} name={s.category?.name ?? ''} />
                <p className="font-space text-[18px] font-bold text-ink leading-snug mb-2 group-hover:underline underline-offset-2">{s.title}</p>
                <p className="font-georgia text-[14px] text-[#555] leading-relaxed mb-2">{s.deck}</p>
                <p className="font-inter text-[10px] text-[#999]">{s.location} · {s.readTime} min read</p>
              </div>
              <div className="w-[160px] flex-shrink-0 border-l-2 border-ink bg-card flex items-center justify-center text-[10px] text-[#bbb]">
                {s.thumb ? <img src={s.thumb} alt={s.title} className="w-full h-full object-cover" /> : 'photo'}
              </div>
            </Link>
            )
          }) : (
            <p className="py-12 font-inter text-[14px] text-[#999] text-center">Food stories coming soon.</p>
          )}
        </div>
      </div>
    </main>
  )
}
