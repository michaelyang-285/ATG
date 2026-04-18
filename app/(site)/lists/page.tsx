import { client } from '@/lib/sanity'
import { slugHref } from '@/lib/slugHref'
import Ticker from '@/components/Ticker'
import Link from 'next/link'

export const revalidate = 60
export const metadata = {
  title: 'Gwinnett Lists — All Things Gwinnett',
  description: 'The best of Gwinnett County, ranked. Best tacos, best parks, hidden gems, and more.',
}

async function getLists() {
  try {
    return await client.fetch(`
      *[_type == "list"] | order(order asc){
        title, subtitle, slug, order,
        "tag": tag
      }
    `)
  } catch { return [] }
}

const FALLBACK_LISTS = [
  { title: '8 best taco spots in Gwinnett right now',                   subtitle: "We ate at 20 places. You're welcome.",         slug: { current: 'best-tacos' },           order: 1 },
  { title: '10 restaurants locals love that never show up on Yelp',     subtitle: 'No chains. No tourist bait.',                  slug: { current: 'hidden-restaurants' },   order: 2 },
  { title: 'New to Gwinnett? Here\'s what no one tells you.',           subtitle: 'Not the chamber of commerce version.',         slug: { current: 'new-to-gwinnett' },      order: 3 },
  { title: 'The 6 best parks for families in Gwinnett, ranked',         subtitle: 'Playgrounds, trails, splash pads.',             slug: { current: 'best-parks' },           order: 4 },
  { title: 'Best brunch spots in Gwinnett that are worth the wait',     subtitle: 'We waited. Here\'s where it\'s worth it.',     slug: { current: 'best-brunch' },          order: 5 },
  { title: '5 Gwinnett coffee shops that aren\'t Starbucks',            subtitle: 'Support local. The coffee is better anyway.',  slug: { current: 'coffee-shops' },         order: 6 },
]

export default async function ListsPage() {
  const lists = await getLists()
  const base = lists.length > 0 ? lists : FALLBACK_LISTS
  const ok = base.filter((l: { slug?: unknown }) => slugHref(l.slug))
  const display = ok.length > 0 ? ok : FALLBACK_LISTS.filter((l) => slugHref(l.slug))

  return (
    <main className="w-full">
      <Ticker items={[]} />

      {/* Header */}
      <div className="bg-ink border-b-2 border-ink w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <h1 className="font-archivo text-[42px] text-white tracking-[-1px] leading-none mb-2">
            Gwinnett lists
          </h1>
          <p className="font-georgia text-[15px] text-[#666] italic">
            The best of the county, ranked by locals. Updated as new spots open and old ones fall off.
          </p>
        </div>
      </div>

      {/* Lists grid */}
      <div className="bg-paper border-b-2 border-ink w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-0">
          {display.map((l: any, i: number) => {
            const h = slugHref(l.slug)
            return (
            <Link key={h || `list-${i}`} href={h ? `/lists/${h}` : '/lists'}
              className="flex items-center gap-0 border-b-2 border-ink last:border-b-0
                         hover:bg-card transition-colors group no-underline cursor-pointer">
              {/* Large number */}
              <div className="bg-ink text-yellow font-archivo text-[32px] tracking-[-1px]
                              w-[72px] flex-shrink-0 flex items-center justify-center
                              self-stretch border-r-2 border-ink">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="py-5 px-6 flex-1">
                <p className="font-space text-[18px] font-bold text-ink leading-snug mb-1
                               group-hover:underline underline-offset-2">
                  {l.title}
                </p>
                <p className="font-inter text-[12px] text-[#999]">{l.subtitle}</p>
              </div>
              <div className="pr-6 flex-shrink-0">
                <span className="font-inter text-[20px] text-[#ccc] group-hover:text-orange transition-colors">→</span>
              </div>
            </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
