import { client } from '@/lib/sanity'
import { slugHref } from '@/lib/slugHref'
import Link from 'next/link'

export const revalidate = 60
export const metadata = {
  title: 'Business Directory — All Things Gwinnett',
  description: 'Local businesses in Gwinnett County. Discover new spots, support locals.',
}

const CITIES = ['All', 'Lawrenceville', 'Duluth', 'Norcross', 'Buford', 'Snellville', 'Suwanee', 'Lilburn']
const CATS   = ['All', 'Restaurant', 'Auto', 'Retail', 'Health', 'Services', 'Entertainment']

async function getBusinesses() {
  try {
    return await client.fetch(`
      *[_type == "business" && status != "pending"] | order(openedAt desc){
        name, businessType, city, category, description, status, slug, phone, website
      }
    `)
  } catch { return [] }
}

export default async function BusinessesPage() {
  const businesses = await getBusinesses()
  const bizRows = businesses.filter((b: { slug?: unknown }) => slugHref(b.slug))

  return (
    <main className="w-full">
      {/* Header */}
      <div className="bg-ink border-b-2 border-ink w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex items-end justify-between">
          <div>
            <h1 className="font-archivo text-[42px] text-white tracking-[-1px] leading-none mb-2">Businesses</h1>
            <p className="font-georgia text-[15px] text-[#666] italic">Gwinnett's local business directory. Support your neighbors.</p>
          </div>
          <Link href="/submit-a-business"
            className="inline-block bg-yellow text-ink font-inter text-[11px] font-bold
                       uppercase tracking-[1px] px-5 py-3 border-2 border-yellow
                       shadow-[3px_3px_0_#7A2800] no-underline hover:translate-x-[1px] hover:translate-y-[1px] transition-transform">
            + Add your business
          </Link>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-paper border-b-2 border-ink w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex gap-2 flex-wrap">
          {CATS.map(c => (
            <span key={c} className="font-inter text-[10px] font-bold uppercase tracking-[0.8px]
                                      px-3 py-2 border-2 border-ink cursor-pointer
                                      first:bg-ink first:text-yellow hover:bg-card transition-colors">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Business grid */}
      <div className="bg-paper border-b-2 border-ink w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-0
                        grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {bizRows.length > 0 ? bizRows.map((b: any, i: number) => {
            const h = slugHref(b.slug)
            return (
            <Link key={h || b.name} href={h ? `/businesses/${h}` : '/businesses'}
              className={`block py-6 pr-6 no-underline hover:bg-card transition-colors group
                          border-b-2 border-ink
                          ${i % 3 !== 2 ? 'border-r-2' : ''}
                          ${i % 3 !== 0 ? 'pl-6' : ''}`}>
              <span className={`inline-block font-inter text-[8px] font-bold uppercase tracking-[1px]
                                px-[10px] py-1 border mb-[10px]
                                ${b.status === 'opened' ? 'bg-yellow text-ink border-ink' : 'bg-mid text-yellow border-mid'}`}>
                {b.status === 'opened' ? 'Open' : 'Coming soon'}
              </span>
              <p className="font-space text-[15px] font-bold text-ink mb-1 group-hover:underline underline-offset-2">{b.name}</p>
              <p className="font-inter text-[11px] text-[#999] mb-2">{b.businessType} · {b.city}</p>
              <p className="font-georgia text-[13px] text-[#555] leading-relaxed">{b.description}</p>
              {b.phone && <p className="font-inter text-[11px] text-orange mt-3">{b.phone}</p>}
            </Link>
            )
          }) : (
            <div className="col-span-3 py-16 text-center">
              <p className="font-inter text-[14px] text-[#999] mb-4">No businesses yet.</p>
              <Link href="/submit-a-business"
                className="inline-block bg-orange text-white font-inter text-[11px] font-bold
                           uppercase tracking-[1px] px-5 py-3 no-underline">
                Be the first to add one →
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
