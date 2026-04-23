import Link from 'next/link'
import { slugHref } from '@/lib/slugHref'

// ── Business Spotlight ──────────────────────────────────

type Business = {
  name: string
  businessType: string
  description: string
  status: 'opened' | 'soon'
  slug: { current: string }
}

const FALLBACK: Business[] = [
  { name: 'Pho Saigon Palace',  businessType: 'Vietnamese · Norcross',   description: 'Northern-style pho already causing traffic on Jimmy Carter Blvd. Open daily for lunch and dinner.', status: 'opened', slug: { current: 'pho-saigon' } },
  { name: 'Gwinnett Auto Pros', businessType: 'Auto service · Snellville', description: 'Same-day appointments, no upsell nonsense. Locals are already loyal after two weeks.',            status: 'opened', slug: { current: 'gwinnett-auto' } },
  { name: 'Bloom Boutique',     businessType: "Women's fashion · Buford",  description: 'Local boutique opening Q2. Curated styles, in-store sessions. Taking a waitlist now.',              status: 'soon',   slug: { current: 'bloom-boutique' } },
]

export function BusinessSpotlight({ businesses = [] }: { businesses?: Business[] }) {
  const raw = businesses.length > 0 ? businesses : FALLBACK
  const ok = raw.filter((b) => slugHref(b.slug))
  const display = ok.length > 0 ? ok : FALLBACK.filter((b) => slugHref(b.slug))
  return (
    /* Full-bleed paper */
    <div className="bg-paper border-b-2 border-ink w-full">
      {/* Contained — 3 cols with proper gutters */}
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3">
        {display.map((b, i) => {
          const bSlug = slugHref(b.slug)
          return (
          <Link
            key={bSlug || b.name}
            href={bSlug ? `/businesses/${bSlug}` : '/businesses'}
            className={[
              'block p-6 no-underline hover:bg-card transition-colors cursor-pointer',
              // Mobile: stack with dividers
              i < display.length - 1 ? 'border-b-2 border-ink md:border-b-0' : '',
              // Desktop: column dividers
              i < display.length - 1 ? 'md:border-r-2 md:border-ink' : '',
            ].filter(Boolean).join(' ')}
          >
            <span className={`inline-block font-inter text-[8px] font-bold uppercase tracking-[1px]
                              px-[10px] py-1 border mb-[10px]
                              ${b.status === 'opened'
                                ? 'bg-yellow text-ink border-ink'
                                : 'bg-mid text-yellow border-mid'}`}>
              {b.status === 'opened' ? 'Just opened' : 'Coming soon'}
            </span>
            <p className="font-space text-[15px] font-bold text-ink mb-[3px]">{b.name}</p>
            <p className="font-inter text-[11px] text-ink/50 mb-2">{b.businessType}</p>
            <p className="font-georgia text-[13px] text-ink/60 leading-relaxed">{b.description}</p>
          </Link>
          )
        })}
      </div>
    </div>
  )
}

// ── Promo Bar ───────────────────────────────────────────

export function PromoBar() {
  return (
    /* Full-bleed orange */
    <div className="bg-orange border-b-2 border-ink w-full">
      {/* Contained */}
      <div className="max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between gap-6">
        <p className="font-space text-[16px] font-bold text-white leading-snug">
          7,200+ Gwinnett locals in the Facebook group.{' '}
          <span className="underline underline-offset-[3px]">The website just launched.</span>{' '}
          Get in early.
        </p>
        <Link
          href="/newsletter"
          className="inline-block bg-white text-orange font-inter text-[11px] font-bold
                     uppercase tracking-[1px] px-6 py-3
                     border-2 border-ink shadow-brutalist-dk-sm whitespace-nowrap flex-shrink-0
                     no-underline select-none
                     hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
                     transition-all"
        >
          Join the newsletter →
        </Link>
      </div>
    </div>
  )
}

// ── Footer ──────────────────────────────────────────────

const FOOTER_LINKS = ['About', 'Advertise', 'Submit a tip', 'Facebook']

export function Footer() {
  return (
    /* Full-bleed ink */
    <footer className="bg-ink w-full">
      {/* Contained */}
      <div className="max-w-[1200px] mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="font-archivo text-[14px] text-white text-center md:text-left">
          All Things <em className="not-italic text-orange">Gwinnett</em> · Built by locals.
        </p>
        <div className="grid grid-cols-2 md:flex gap-x-6 gap-y-3 md:gap-5 justify-items-center md:justify-items-start">
          {FOOTER_LINKS.map((l) => (
            <Link key={l} href={`/${l.toLowerCase().replace(/\s/g, '-')}`}
              className="font-inter text-[9px] md:text-[10px] text-paper/40 uppercase tracking-[0.8px]
                         font-semibold no-underline hover:text-yellow transition-colors">
              {l}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
