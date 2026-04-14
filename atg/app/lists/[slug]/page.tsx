import { client } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import Nav from '@/components/Nav'
import { Footer } from '@/components/Misc'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const lists = await client.fetch(`*[_type == "list"]{ "slug": slug.current }`)
    return lists.map((l: any) => ({ slug: l.slug }))
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const list = await client.fetch(
      `*[_type == "list" && slug.current == $slug][0]{ title, subtitle }`,
      { slug: params.slug }
    )
    return {
      title: `${list.title} — All Things Gwinnett`,
      description: list.subtitle,
    }
  } catch { return { title: 'List — All Things Gwinnett' } }
}

async function getList(slug: string) {
  return client.fetch(
    `*[_type == "list" && slug.current == $slug][0]{
      title, subtitle, order, body,
      items[]{ rank, name, address, city, description, tip, "photo": photo.asset->url }
    }`,
    { slug }
  )
}

export default async function ListPage({ params }: { params: { slug: string } }) {
  const list = await getList(params.slug)
  if (!list) notFound()

  return (
    <main className="w-full">
      <Nav />

      {/* Header */}
      <div className="bg-yellow border-b-2 border-ink w-full">
        <div className="max-w-[760px] mx-auto px-6 py-10">
          <p className="font-inter text-[10px] font-bold uppercase tracking-[2px] text-ink/40 mb-3">
            Gwinnett lists
          </p>
          <h1 className="font-archivo text-[38px] text-ink tracking-[-1px] leading-[1.05] mb-3">
            {list.title}
          </h1>
          <p className="font-georgia text-[15px] text-ink/60 italic">{list.subtitle}</p>
        </div>
      </div>

      {/* Intro body */}
      {list.body && (
        <div className="bg-paper border-b-2 border-ink w-full">
          <div className="max-w-[760px] mx-auto px-6 py-8 font-georgia text-[16px] text-ink leading-[1.8]">
            <PortableText value={list.body} />
          </div>
        </div>
      )}

      {/* Ranked items */}
      <div className="bg-paper border-b-2 border-ink w-full">
        <div className="max-w-[760px] mx-auto px-6 py-0">
          {list.items?.map((item: any) => (
            <div key={item.rank}
              className="border-b-2 border-ink last:border-b-0 py-8">
              <div className="flex items-start gap-4">
                {/* Rank number */}
                <div className="bg-ink text-yellow font-archivo text-[28px] tracking-[-1px]
                                w-[56px] h-[56px] flex-shrink-0 flex items-center justify-center
                                border-2 border-ink shadow-brutalist-sm">
                  {item.rank}
                </div>
                <div className="flex-1">
                  <p className="font-archivo text-[22px] text-ink tracking-[-0.5px] leading-tight mb-1">
                    {item.name}
                  </p>
                  <p className="font-inter text-[11px] text-[#999] mb-3">
                    {item.address}{item.city && ` · ${item.city}`}
                  </p>
                  {item.photo && (
                    <img src={item.photo} alt={item.name}
                      className="w-full h-[220px] object-cover border-2 border-ink mb-4" />
                  )}
                  <p className="font-georgia text-[15px] text-[#444] leading-relaxed mb-2">
                    {item.description}
                  </p>
                  {item.tip && (
                    <div className="bg-yellow border-l-4 border-orange px-4 py-2 mt-3">
                      <p className="font-inter text-[10px] font-bold uppercase tracking-[1px] text-orange mb-1">ATG tip</p>
                      <p className="font-georgia text-[13px] text-ink italic">{item.tip}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  )
}
