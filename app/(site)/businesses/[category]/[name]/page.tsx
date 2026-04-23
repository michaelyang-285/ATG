import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { client } from '@/lib/sanity'

export const revalidate = 60

type Params = {
  category: string
  name: string
}

async function getBusiness(category: string, name: string) {
  const slug = `${category}/${name}`
  return client.fetch(
    `*[_type == "business" && slug.current == $slug][0]{
      name, businessType, description,
      address1, address2, city, state, zip,
      website, instagram, facebook, linkedin, x, tiktok, googleMapsUrl,
      "mainImage": mainImage.asset->url,
      "galleryImages": galleryImages[].asset->url,
      hours,
      seoTitle, seoDescription, ogTitle, ogDescription
    }`,
    { slug }
  )
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const business = await getBusiness(params.category, params.name)
  if (!business) return {}

  const title = business?.seoTitle || business?.name
  const description = business?.seoDescription || business?.description
  const ogTitle = business?.ogTitle || title
  const ogDescription = business?.ogDescription || description

  return {
    title: `${title} — All Things Gwinnett`,
    description,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: 'website',
    },
  }
}

export default async function BusinessDetailPage({ params }: { params: Params }) {
  const business = await getBusiness(params.category, params.name)
  if (!business) notFound()

  const fullAddress = [business.address1, business.address2, `${business.city}, ${business.state} ${business.zip}`]
    .filter(Boolean)
    .join(', ')

  const socialLinks = [
    business.website ? { label: 'Website', href: business.website } : null,
    business.instagram ? { label: 'Instagram', href: business.instagram } : null,
    business.facebook ? { label: 'Facebook', href: business.facebook } : null,
    business.linkedin ? { label: 'LinkedIn', href: business.linkedin } : null,
    business.x ? { label: 'X', href: business.x } : null,
    business.tiktok ? { label: 'TikTok', href: business.tiktok } : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>

  return (
    <main className="w-full bg-paper">
      <div className="border-b-2 border-ink">
        <div className="max-w-[1100px] mx-auto px-6 py-8 md:py-10">
          <p className="font-inter text-[10px] font-bold uppercase tracking-[1.2px] text-orange mb-2">
            {business.businessType || 'Local business'}
          </p>
          <h1 className="font-archivo text-[40px] md:text-[52px] leading-[1.04] tracking-[-1px] text-ink">
            {business.name}
          </h1>
          <p className="mt-4 font-georgia text-[18px] leading-relaxed text-[#4a4a4a]">
            {business.description}
          </p>
        </div>
      </div>

      {business.mainImage && (
        <div className="border-b-2 border-ink bg-card">
          <div className="max-w-[1200px] mx-auto">
            <img src={business.mainImage} alt={business.name} className="w-full h-[260px] sm:h-[360px] md:h-[500px] object-cover" />
          </div>
        </div>
      )}

      <div className="max-w-[1100px] mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] gap-8">
        <section>
          <h2 className="font-archivo text-[24px] tracking-[-0.4px] text-ink mb-3">About</h2>
          <p className="font-georgia text-[17px] leading-[1.8] text-ink mb-6">
            {business.description}
          </p>

          {Array.isArray(business.galleryImages) && business.galleryImages.length > 0 && (
            <>
              <h3 className="font-archivo text-[20px] tracking-[-0.3px] text-ink mb-3">Gallery</h3>
              <div className="grid grid-cols-2 gap-3">
                {business.galleryImages.map((img: string) => (
                  <img key={img} src={img} alt={business.name} className="w-full h-[150px] object-cover border-2 border-ink" />
                ))}
              </div>
            </>
          )}
        </section>

        <aside className="border-2 border-ink bg-card shadow-brutalist-sm p-5 h-fit">
          <h3 className="font-archivo text-[18px] tracking-[-0.3px] text-ink mb-3">Visit</h3>
          <p className="font-inter text-[13px] text-ink/80 mb-4">{fullAddress}</p>
          {business.googleMapsUrl && (
            <a href={business.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block mb-5 font-inter text-[11px] font-bold uppercase tracking-[0.8px] text-orange no-underline">
              Open in Google Maps →
            </a>
          )}

          {business.hours && (
            <>
              <h4 className="font-archivo text-[16px] text-ink mb-2">Hours</h4>
              <ul className="space-y-1 font-inter text-[12px] text-ink/75">
                {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((d) => (
                  <li key={d} className="flex justify-between gap-3">
                    <span className="capitalize">{d}</span>
                    <span>{business.hours?.[d] || '—'}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {socialLinks.length > 0 && (
            <div className="mt-6 pt-4 border-t-2 border-ink/10 flex flex-wrap gap-2">
              {socialLinks.map((s) => (
                <a
                  key={`${s.label}-${s.href}`}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 px-3 items-center justify-center border-2 border-ink bg-paper text-ink shadow-brutalist-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-yellow transition-all font-inter text-[10px] font-bold uppercase tracking-[0.8px] no-underline"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </aside>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 pb-10">
        <Link href="/businesses" className="font-inter text-[10px] font-bold uppercase tracking-[0.8px] text-ink hover:text-orange no-underline">
          ← Back to Businesses
        </Link>
      </div>
    </main>
  )
}
