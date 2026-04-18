import { client } from '@/lib/sanity'
import { slugHref } from '@/lib/slugHref'
import Ticker from '@/components/Ticker'
import StoryTag from '@/components/StoryTag'
import Link from 'next/link'

export const revalidate = 60
export const metadata = {
  title: 'Opinions — All Things Gwinnett',
  description: 'Community voices, editorials, and hot takes from Gwinnett County locals.',
}

async function getOpinions() {
  try {
    return await client.fetch(`
      *[_type == "story" && category->section->name == "Opinions"] | order(publishedAt desc)[0...20]{
        title, deck, slug, publishedAt, readTime, author,
        "category": category->{ name, color },
        "thumb": thumbnail.asset->url
      }
    `)
  } catch { return [] }
}

export default async function OpinionsPage() {
  const opinions = await getOpinions()
  const opinionRows = opinions.filter((s: { slug?: unknown }) => slugHref(s.slug))

  return (
    <main className="w-full">
      <Ticker items={[]} />

      {/* Header */}
      <div className="bg-paper border-b-2 border-ink w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-8 border-b-4 border-ink">
          <p className="font-inter text-[10px] font-bold uppercase tracking-[2px] text-orange mb-2">
            Community voices
          </p>
          <h1 className="font-archivo text-[42px] text-ink tracking-[-1px] leading-none mb-2">
            Opinions
          </h1>
          <p className="font-georgia text-[15px] text-[#666] italic">
            Hot takes, community voices, and things that needed to be said.
            These are opinions — not ATG editorial positions.
          </p>
        </div>
      </div>

      {/* Opinion stories — wider single column, editorial feel */}
      <div className="bg-paper w-full">
        <div className="max-w-[760px] mx-auto px-6">
          {opinionRows.length > 0 ? opinionRows.map((s: any) => {
            const h = slugHref(s.slug)
            return (
            <Link key={h || s.title} href={h ? `/stories/${h}` : '/news'}
              className="block py-8 border-b-2 border-ink last:border-b-0
                         hover:bg-card transition-colors group no-underline -mx-6 px-6">
              <StoryTag color={s.category?.color} name={s.category?.name ?? ''} />
              <p className="font-archivo text-[26px] text-ink leading-tight mb-3 mt-2
                             group-hover:underline underline-offset-2 tracking-[-0.5px]">
                {s.title}
              </p>
              <p className="font-georgia text-[15px] text-[#555] leading-relaxed mb-3 italic">
                {s.deck}
              </p>
              <div className="flex items-center gap-3 font-inter text-[11px] text-[#999]">
                <span className="font-semibold text-ink">{s.author ?? 'ATG Staff'}</span>
                <span>·</span>
                <span>{s.readTime} min read</span>
              </div>
            </Link>
            )
          }) : (
            <p className="py-16 font-inter text-[14px] text-[#999] text-center">
              Opinion pieces coming soon.
            </p>
          )}
        </div>
      </div>

      {/* Submit an opinion CTA */}
      <div className="bg-yellow border-t-2 border-b-2 border-ink w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between gap-6">
          <div>
            <p className="font-archivo text-[18px] text-ink mb-1">Got something to say?</p>
            <p className="font-inter text-[12px] text-ink/60">
              We publish community voices on things that matter to Gwinnett. Keep it under 600 words.
            </p>
          </div>
          <Link href="/submit-a-tip"
            className="inline-block bg-ink text-yellow font-inter text-[11px] font-bold
                       uppercase tracking-[1px] px-6 py-3 shadow-brutalist-sm
                       no-underline whitespace-nowrap flex-shrink-0
                       hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
            Submit an opinion →
          </Link>
        </div>
      </div>
    </main>
  )
}
