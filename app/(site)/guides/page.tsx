import Link from 'next/link'
import { client } from '@/lib/sanity'
import { slugHref } from '@/lib/slugHref'
import StoryTag from '@/components/StoryTag'

export const revalidate = 60

export const metadata = {
  title: 'Guides - All Things Gwinnett',
  description: 'Useful local guides, best-of lists, and explainers for Gwinnett.',
}

type Guide = {
  title: string
  deck?: string
  slug?: { current?: string }
  publishedAt?: string
  readTime?: number
  thumb?: string
  category?: { name?: string; color?: string }
}

async function getGuides(): Promise<Guide[]> {
  try {
    return await client.fetch(`
      *[_type == "story" && storyType == "guide"] | order(publishedAt desc)[0...24]{
        title, deck, slug, publishedAt, readTime,
        "category": category->{ name, color },
        "thumb": thumbnail.asset->url
      }
    `)
  } catch {
    return []
  }
}

function formatDate(date?: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function GuidesPage() {
  const guides = await getGuides()
  const guideRows = guides.filter((g) => slugHref(g.slug))
  const [featured, ...rest] = guideRows

  return (
    <main className="w-full bg-paper">
      <div className="border-b-2 border-ink">
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <p className="font-inter text-[10px] font-bold uppercase tracking-[1.8px] text-orange mb-2">
            Utility
          </p>
          <h1 className="font-archivo text-[42px] leading-none tracking-[-1px] text-ink mb-2">
            Guides
          </h1>
          <p className="font-georgia text-[16px] italic text-[#5b5b5b]">
            Best-of lists, practical explainers, and local cheat sheets.
          </p>
        </div>
      </div>

      <div className="border-b-2 border-ink">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          {featured ? (
            <Link
              href={`/stories/${slugHref(featured.slug)}`}
              className="grid grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] border-2 border-ink bg-paper no-underline group"
            >
              <div className="min-h-[260px] border-b-2 md:border-b-0 md:border-r-2 border-ink bg-card flex items-center justify-center">
                {featured.thumb ? (
                  <img src={featured.thumb} alt={featured.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-inter text-[12px] text-ink/35">featured image</span>
                )}
              </div>
              <div className="p-6 md:p-7">
                <StoryTag color={featured.category?.color ?? ''} name={featured.category?.name ?? ''} />
                <h2 className="font-archivo text-[34px] leading-[1.05] tracking-[-0.6px] text-ink mt-3 mb-3 group-hover:underline underline-offset-2">
                  {featured.title}
                </h2>
                <p className="font-georgia text-[16px] leading-relaxed text-[#4f4f4f] mb-5 italic">
                  {featured.deck}
                </p>
                <div className="font-inter text-[11px] text-[#7a7a7a] flex items-center gap-2 flex-wrap">
                  <span>{featured.readTime ?? 5} min read</span>
                  {featured.publishedAt && (
                    <>
                      <span>·</span>
                      <span>{formatDate(featured.publishedAt)}</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ) : (
            <p className="font-inter text-[14px] text-[#888] py-8 text-center">
              Guides coming soon. Mark stories as `Guide` in Studio to populate this page.
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="max-w-[1200px] mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((g) => {
            const h = slugHref(g.slug)
            return (
              <Link
                key={h || g.title}
                href={h ? `/stories/${h}` : '/guides'}
                className="border-2 border-ink bg-paper no-underline group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-brutalist-sm transition-all"
              >
                <div className="h-[190px] border-b-2 border-ink bg-card flex items-center justify-center">
                  {g.thumb ? (
                    <img src={g.thumb} alt={g.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-inter text-[11px] text-ink/35">photo</span>
                  )}
                </div>
                <div className="p-4">
                  <StoryTag color={g.category?.color ?? ''} name={g.category?.name ?? ''} />
                  <h3 className="font-space text-[18px] font-bold text-ink leading-tight mt-2 mb-2 group-hover:underline underline-offset-2">
                    {g.title}
                  </h3>
                  <p className="font-georgia text-[14px] text-[#575757] leading-relaxed mb-3">
                    {g.deck}
                  </p>
                  <p className="font-inter text-[10px] text-[#888]">
                    {formatDate(g.publishedAt)}{g.readTime ? ` · ${g.readTime} min read` : ''}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
