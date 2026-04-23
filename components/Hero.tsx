import Link from 'next/link'
import { slugHref } from '@/lib/slugHref'
import HeroStats from './HeroStats'

type Story = {
  title: string; deck: string; slug: { current: string }
  readTime?: number; publishedAt?: string; author?: string
  category?: { name: string; color: string }
  thumb?: string
  photoCredit?: string
}
type SidebarStory = {
  title: string; slug: { current: string }; publishedAt?: string
  thumb?: string
  category?: { name: string }
}

const DEFAULT_SIDEBAR: SidebarStory[] = [
  { title: 'GCPS overcrowding report drops — three schools flagged, one closure possible', slug: { current: 'gcps-overcrowding' }, category: { name: 'Schools' } },
  { title: "Snellville store robberies: what GPD said (and didn't say)", slug: { current: 'snellville-robberies' }, category: { name: 'Crime & safety' } },
  { title: 'Wing Chef in Lawrenceville dropped a ghost pepper menu. Send help.', slug: { current: 'wing-chef-ghost-pepper' }, category: { name: 'Food & drink' } },
  { title: 'Hmong New Year at Gas South — biggest turnout yet, photos inside', slug: { current: 'hmong-new-year' }, category: { name: 'Community' } },
]

export default function Hero({ heroStory, sidebarStories = [] }: { heroStory?: Story; sidebarStories?: SidebarStory[] }) {
  const story = heroStory ?? {
    title: "Gwinnett approved a $42M development. Here's what's actually going in — not the press release.",
    deck: "We read the permits, called the planning board, and found which restaurant chains already signed leases. You deserve more than a ribbon-cutting photo.",
    slug: { current: 'gwinnett-42m-development' }, readTime: 4, author: 'ATG Staff',
    publishedAt: new Date().toISOString(), category: { name: "Today's lead", color: 'orange' },
  }
  const leadSlug = slugHref(story.slug)
  const leadImage = story.thumb
  const photoCredit = story.photoCredit
  const sidebarFromCms = sidebarStories.filter((s) => slugHref(s.slug))
  const sidebar =
    sidebarStories.length === 0
      ? DEFAULT_SIDEBAR
      : sidebarFromCms.length > 0
        ? sidebarFromCms
        : DEFAULT_SIDEBAR

  return (
    <div className="bg-paper border-b-2 border-ink w-full">
      <div className="max-w-[1200px] mx-auto px-0 sm:px-6 grid grid-cols-1 md:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        {/* LEFT — eyebrow introduces the photo, photo leads the story, text follows */}
        <div className="md:border-r-2 md:border-ink flex flex-col">
          {/* Eyebrow — tag + date, introducing the lead photo + story */}
          <div className="px-4 pt-6 md:pt-7 lg:px-8 lg:pt-8 pb-[14px]">
            <div className="flex flex-wrap items-center gap-[10px]">
              <span className="font-inter text-[9px] font-bold uppercase tracking-[1.5px] bg-orange text-white px-[10px] py-1">
                Today's lead
              </span>
              <span className="font-inter text-[11px] text-ink/50">
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  timeZone: 'America/New_York',
                })}
              </span>
            </div>
          </div>

          {/* Lead photo — inset to match text padding, 1.91:1 matches OG/social share previews */}
          <div className="px-4 lg:px-8">
            <Link
              href={leadSlug ? `/stories/${leadSlug}` : '/news'}
              className="block relative w-full aspect-[191/100] bg-card overflow-hidden no-underline group shadow-brutalist-sm"
              aria-label={`Open lead story: ${story.title}`}
            >
              {leadImage ? (
                <img
                  src={leadImage}
                  alt={story.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.015]"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center
                                bg-[repeating-linear-gradient(135deg,theme(colors.card)_0_10px,rgba(0,0,0,0.035)_10px_11px)]">
                  <div className="text-center">
                    <p className="font-archivo text-[22px] text-ink/30 tracking-[-0.5px] leading-none mb-1">
                      Lead photo
                    </p>
                    <p className="font-inter text-[9px] font-bold uppercase tracking-[1.5px] text-ink/35">
                      1.91:1 · add via Sanity
                    </p>
                  </div>
                </div>
              )}
            </Link>
            {/* Photo credit — small caption directly under the image.
                Extra top padding leaves breathing room for the 3px drop shadow. */}
            <p className="pt-[14px] font-inter text-[10px] text-ink/50 leading-tight">
              {photoCredit ?? 'Photo: ATG'}
            </p>
          </div>

          {/* Story text */}
          <div className="px-4 pt-5 pb-6 md:pb-7 lg:px-8 lg:pt-5 lg:pb-8 flex-1 flex flex-col">
            <h1 className="font-archivo text-[30px] sm:text-[34px] leading-[1.02] text-ink tracking-[-1px] mb-[14px]">
              {story.title}
            </h1>
            <p className="font-georgia text-[14px] sm:text-[15px] text-ink/70 leading-relaxed mb-5 pl-[14px] border-l-[3px] border-orange">
              {story.deck}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-[14px]">
              <Link
                href={leadSlug ? `/stories/${leadSlug}` : '/news'}
                className="inline-block self-start bg-orange text-white font-inter text-[10px] sm:text-[11px] font-bold uppercase tracking-[1px]
                           px-5 py-[10px] sm:px-[22px] sm:py-3 border-2 border-ink shadow-brutalist-dk-sm cursor-pointer select-none no-underline
                           hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Read the story →
              </Link>
              <span className="font-inter text-[11px] text-ink/50">{story.readTime} min read · {story.author ?? 'ATG Staff'}</span>
            </div>
          </div>
        </div>

        {/* RIGHT — stats strip (orange) tops the column, "Also today" list fills the rest */}
        <div className="flex flex-col border-t-2 border-ink md:border-t-0">
          <HeroStats />
          <div className="flex-1">
            {sidebar.map((s) => {
              const sSlug = slugHref(s.slug)
              return (
                <Link
                  key={sSlug || s.title}
                  href={sSlug ? `/stories/${sSlug}` : '/news'}
                  className="block px-4 lg:px-5 py-[14px] border-b border-ink/15 last:border-b-0 hover:bg-card group no-underline"
                >
                  <div className="flex gap-3 items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-[8px] font-bold uppercase tracking-[1px] text-ink/50 mb-[5px]">
                        {s.category?.name}
                      </p>
                      <p className="font-space text-[13px] font-bold text-ink leading-[1.3] group-hover:underline underline-offset-2">
                        {s.title}
                      </p>
                    </div>
                    <div className="w-[88px] h-[88px] flex-shrink-0 bg-card overflow-hidden relative shadow-brutalist-sm">
                      {s.thumb ? (
                        <img
                          src={s.thumb}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div
                          className="absolute inset-0
                                     bg-[repeating-linear-gradient(135deg,theme(colors.card)_0_8px,rgba(0,0,0,0.035)_8px_9px)]
                                     flex items-center justify-center"
                          aria-hidden
                        >
                          <span className="font-inter text-[7px] font-bold uppercase tracking-[1px] text-ink/30">
                            Photo
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
