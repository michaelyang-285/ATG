import { client } from '@/lib/sanity'
import { slugHref } from '@/lib/slugHref'
import Link from 'next/link'

export const revalidate = 60
export const metadata = {
  title: 'Events — All Things Gwinnett',
  description: "What's happening in Gwinnett County this week and beyond.",
}

async function getEvents() {
  try {
    return await client.fetch(`
      *[_type == "event"] | order(date asc)[0...50]{
        name, date, location, price, slug
      }
    `)
  } catch { return [] }
}

function groupByMonth(events: any[]) {
  return events.reduce((acc: any, e: any) => {
    const month = new Date(e.date).toLocaleString('en-US', { month: 'long', year: 'numeric' })
    if (!acc[month]) acc[month] = []
    acc[month].push(e)
    return acc
  }, {})
}

export default async function EventsPage() {
  const events = await getEvents()
  const eventRows = events.filter((e: { slug?: unknown }) => slugHref(e.slug))
  const grouped = groupByMonth(eventRows)

  return (
    <main className="w-full">
      <div className="bg-ink border-b-2 border-ink w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <h1 className="font-archivo text-[42px] text-white tracking-[-1px] leading-none mb-2">Events</h1>
          <p className="font-georgia text-[15px] text-[#666] italic">What's happening in Gwinnett this week and beyond.</p>
        </div>
      </div>

      <div className="bg-paper w-full">
        <div className="max-w-[1200px] mx-auto px-6">
          {Object.keys(grouped).length > 0 ? Object.entries(grouped).map(([month, evts]: [string, any]) => (
            <div key={month} className="border-b-2 border-ink last:border-b-0">
              {/* Month header */}
              <div className="bg-yellow border-b-2 border-ink py-3">
                <p className="font-archivo text-[13px] text-ink tracking-[-0.3px]">{month}</p>
              </div>
              {evts.map((e: any) => {
                const d = new Date(e.date)
                const h = slugHref(e.slug)
                return (
                  <Link key={h || e.name} href={h ? `/events/${h}` : '/events'}
                    className="flex items-start gap-4 py-4 border-b border-[#ddd] last:border-b-0
                               hover:bg-card transition-colors group no-underline px-0">
                    {/* Date block */}
                    <div className="w-[52px] h-[52px] flex-shrink-0 bg-orange flex flex-col
                                    items-center justify-center border-2 border-ink shadow-brutalist-sm">
                      <span className="font-inter text-[8px] font-bold uppercase text-white/70">
                        {d.toLocaleString('en-US', { month: 'short' })}
                      </span>
                      <span className="font-archivo text-[22px] text-white leading-none">{d.getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-space text-[16px] font-bold text-ink leading-tight mb-1 group-hover:underline underline-offset-2">{e.name}</p>
                      <p className="font-inter text-[11px] text-[#999]">{e.location} · {e.price}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )) : (
            <p className="py-12 font-inter text-[14px] text-[#999] text-center">Events coming soon.</p>
          )}
        </div>
      </div>
    </main>
  )
}
