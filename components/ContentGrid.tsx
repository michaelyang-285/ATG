import StoryTag from './StoryTag'

type Story = {
  title: string
  deck?: string
  slug: { current: string }
  readTime?: number
  publishedAt?: string
  location?: string
  thumb?: string
  category?: { name: string; color: string }
}

const FALLBACK_STORIES: Story[] = [
  { title: "We ranked every dumpling spot in Gwinnett. 14 stops. One afternoon. Our opinion is ready.", deck: "Duluth's Asian Square alone took two hours and one regrettable fourth order of soup dumplings. Worth it.", slug: { current: 'dumpling-ranking' }, location: 'Duluth', readTime: 6, publishedAt: '', category: { name: 'Food & drink', color: 'orange' } },
  { title: "The Lawrenceville-Suwanee widening is moving. It'll cost you 18 months of patience.", deck: "GDOT confirmed the schedule. We translated it from bureaucrat to English so you don't have to.", slug: { current: 'lawrenceville-widening' }, location: 'Lawrenceville', readTime: 3, publishedAt: '', category: { name: 'Roads', color: 'yellow' } },
  { title: "That Buford brewery can't keep beer on tap — so they're opening a second location. Correct response.", deck: "Here's where it's going, when it opens, and yes, they're keeping the IPA.", slug: { current: 'buford-brewery' }, location: 'Buford', readTime: 2, publishedAt: '', category: { name: 'Business', color: 'ink' } },
  { title: "Sugarloaf Mills is getting a makeover. The anchor tenant is not another gym. We were surprised too.", deck: "What's leaving, what's replacing it, and the one thing nobody expected.", slug: { current: 'sugarloaf-makeover' }, location: 'Lawrenceville', readTime: 4, publishedAt: '', category: { name: 'Development', color: 'mid' } },
]

export function StoryFeed({ stories = [] }: { stories?: Story[] }) {
  const display = stories.length > 0 ? stories : FALLBACK_STORIES

  return (
    <div className="md:border-r-2 md:border-ink border-b-2 border-ink md:border-b-0">
      {display.map((s) => (
        <a
          key={s.slug.current}
          href={`/stories/${s.slug.current}`}
          className="flex items-stretch border-b-2 border-ink last:border-b-0 hover:bg-card group cursor-pointer"
        >
          <div className="p-4 flex-1">
            <StoryTag color={s.category?.color} name={s.category?.name ?? ''} />
            <p className="font-space text-[16px] font-bold leading-[1.25] text-ink mb-[5px] group-hover:underline underline-offset-2">
              {s.title}
            </p>
            <p className="font-georgia text-[13px] text-ink/60 leading-[1.55] mb-[6px]">{s.deck}</p>
            <p className="font-inter text-[10px] text-ink/50">
              {s.location} · {s.readTime} min read
            </p>
          </div>
          {/* Thumbnail placeholder */}
          <div className="w-[110px] h-[110px] flex-shrink-0 bg-card border-l-2 border-ink overflow-hidden flex items-center justify-center font-inter text-[10px] text-ink/30">
            {s.thumb ? (
              <img src={s.thumb} alt={s.title} className="w-full h-full object-cover" />
            ) : (
              'photo'
            )}
          </div>
        </a>
      ))}
    </div>
  )
}

// ── Rail ──────────────────────────────────────────────

type Event = { name: string; date: string; location: string; price: string; slug: { current: string } }
type List  = { title: string; subtitle: string; order: number; slug: { current: string } }

const FALLBACK_EVENTS: Event[] = [
  { name: 'Lawrenceville Farmers Market — opening day', date: '2026-04-12', location: 'Downtown Square', price: 'Free', slug: { current: 'farmers-market' } },
  { name: 'Suwanee Town Center concerts kick off',      date: '2026-04-19', location: 'Town Center Park', price: 'Free', slug: { current: 'suwanee-concerts' } },
  { name: 'Duluth Spring Festival',                     date: '2026-04-26', location: 'Downtown Duluth',  price: '$5',  slug: { current: 'duluth-spring' } },
  { name: 'Gwinnett Soccer Classic',                    date: '2026-05-03', location: 'Gas South District', price: 'Free', slug: { current: 'soccer-classic' } },
]

const FALLBACK_LISTS: List[] = [
  { title: '8 best taco spots in Gwinnett right now',                    subtitle: "We ate at 20 places. You're welcome.",   order: 1, slug: { current: 'best-tacos' } },
  { title: "10 restaurants locals love that never show up on Yelp",      subtitle: 'No chains. No tourist bait.',            order: 2, slug: { current: 'hidden-restaurants' } },
  { title: "New to Gwinnett? Here's what no one tells you.",             subtitle: 'Not the chamber version.',               order: 3, slug: { current: 'new-to-gwinnett' } },
]

export function Rail({ events = [], lists = [] }: { events?: Event[]; lists?: List[] }) {
  const evts = events.length > 0 ? events : FALLBACK_EVENTS
  const lsts = lists.length  > 0 ? lists  : FALLBACK_LISTS

  return (
    <div className="flex flex-col">

      {/* Events */}
      <div className="p-4 border-b-2 border-ink">
        <div className="font-archivo text-[13px] text-ink mb-3 pb-2 border-b-2 border-ink flex items-center justify-between">
          This week
          <a href="/events" className="font-inter text-[9px] text-orange font-bold uppercase tracking-[0.8px] no-underline">See all →</a>
        </div>
        {evts.map((e) => {
          const d = new Date(e.date)
          return (
            <a key={e.slug.current} href={`/events/${e.slug.current}`} className="flex gap-3 py-[10px] border-b border-ink/15 last:border-b-0 last:pb-0 hover:no-underline group">
              <div className="w-[42px] h-[42px] flex-shrink-0 bg-orange flex flex-col items-center justify-center border-[1.5px] border-ink shadow-brutalist-dk-sm">
                <span className="font-inter text-[7px] font-bold uppercase text-white/70">{d.toLocaleString('en-US', { month: 'short' })}</span>
                <span className="font-archivo text-[18px] text-white leading-none">{d.getDate()}</span>
              </div>
              <div>
                <p className="font-space text-[13px] font-bold text-ink leading-[1.3] mb-[2px] group-hover:underline underline-offset-2">{e.name}</p>
                <p className="font-inter text-[10px] text-ink/50">{e.location} · {e.price}</p>
              </div>
            </a>
          )
        })}
      </div>

      {/* Lists */}
      <div className="p-4">
        <div className="font-archivo text-[13px] text-ink mb-3 pb-2 border-b-2 border-ink flex items-center justify-between">
          Gwinnett lists
          <a href="/lists" className="font-inter text-[9px] text-orange font-bold uppercase tracking-[0.8px] no-underline">All →</a>
        </div>
        {lsts.map((l) => (
          <a key={l.slug.current} href={`/lists/${l.slug.current}`} className="flex border-2 border-ink shadow-brutalist-sm mb-[10px] last:mb-0 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer group">
            <div className="bg-ink text-yellow font-archivo text-[18px] min-w-[44px] flex items-center justify-center border-r-2 border-ink flex-shrink-0">
              {String(l.order).padStart(2, '0')}
            </div>
            <div className="p-[10px_12px]">
              <p className="font-space text-[13px] font-bold text-ink leading-[1.3] group-hover:underline underline-offset-2">{l.title}</p>
              <p className="font-inter text-[10px] text-ink/50 mt-[2px]">{l.subtitle}</p>
            </div>
          </a>
        ))}
      </div>

    </div>
  )
}
