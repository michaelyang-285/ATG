import Link from 'next/link'
import { client } from '@/lib/sanity'
import { slugHref } from '@/lib/slugHref'
import StoryTag from '@/components/StoryTag'

export const revalidate = 60

export const metadata = {
  title: 'Stories - All Things Gwinnett',
  description: 'Latest stories from around Gwinnett County.',
}

type Story = {
  title: string
  deck?: string
  slug?: { current?: string }
  publishedAt?: string
  readTime?: number
  author?: string
  location?: string
  thumb?: string
  category?: { name?: string; color?: string }
}

async function getStories(): Promise<Story[]> {
  try {
    return await client.fetch(`
      *[_type == "story"] | order(publishedAt desc)[0...18]{
        title, deck, slug, publishedAt, readTime, author, location,
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

export default async function StoriesPage() {
  const stories = await getStories()
  const storyRows = stories.filter((s) => slugHref(s.slug))
  const [featured, ...rest] = storyRows

  return (
    <main className="w-full bg-paper">
      <div className="border-b-2 border-ink">
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <p className="font-inter text-[10px] font-bold uppercase tracking-[1.8px] text-orange mb-2">
            Editorial
          </p>
          <h1 className="font-archivo text-[42px] leading-none tracking-[-1px] text-ink mb-2">
            Stories
          </h1>
          <p className="font-georgia text-[16px] italic text-[#5b5b5b]">
            Reporting and features from across Gwinnett County.
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
                  <span className="text-ink">{featured.author ?? 'ATG Staff'}</span>
                  <span>·</span>
                  <span>{featured.location || 'Gwinnett County, GA'}</span>
                  <span>·</span>
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
              Stories coming soon.
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="max-w-[1200px] mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((s) => {
            const h = slugHref(s.slug)
            return (
              <Link
                key={h || s.title}
                href={h ? `/stories/${h}` : '/stories'}
                className="border-2 border-ink bg-paper no-underline group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-brutalist-sm transition-all"
              >
                <div className="h-[190px] border-b-2 border-ink bg-card flex items-center justify-center">
                  {s.thumb ? (
                    <img src={s.thumb} alt={s.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-inter text-[11px] text-ink/35">photo</span>
                  )}
                </div>
                <div className="p-4">
                  <StoryTag color={s.category?.color ?? ''} name={s.category?.name ?? ''} />
                  <h3 className="font-space text-[18px] font-bold text-ink leading-tight mt-2 mb-2 group-hover:underline underline-offset-2">
                    {s.title}
                  </h3>
                  <p className="font-georgia text-[14px] text-[#575757] leading-relaxed mb-3">
                    {s.deck}
                  </p>
                  <p className="font-inter text-[10px] text-[#888]">
                    {formatDate(s.publishedAt)}{s.readTime ? ` · ${s.readTime} min read` : ''}
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
