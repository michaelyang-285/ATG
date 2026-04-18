import Link from 'next/link'

export const metadata = {
  title: 'Advertise — All Things Gwinnett',
  description: 'Reach 4,000+ Gwinnett County locals. Advertising options for local businesses.',
}

const PACKAGES = [
  {
    name: 'Business listing',
    price: '$49/mo',
    desc: 'Featured placement in the business directory with enhanced profile — photos, hours, link, description.',
    includes: ['Directory listing', 'Homepage "Just opened" feature', 'Category spotlight'],
    best: false,
  },
  {
    name: 'Newsletter sponsor',
    price: '$199/issue',
    desc: 'Single sponsor placement in the ATG Thursday newsletter. Seen by 4,000+ Gwinnett locals.',
    includes: ['Logo + 2-line copy in newsletter', 'Link to your site or offer', 'One issue per sponsor'],
    best: true,
  },
  {
    name: 'Story feature',
    price: '$299',
    desc: 'A written feature about your business, event, or opening — written by ATG, published on the site.',
    includes: ['500-word feature story', 'Photos', 'Promoted in newsletter', 'Permanent on site'],
    best: false,
  },
]

export default function AdvertisePage() {
  return (
    <main className="w-full">
      <div className="bg-yellow border-b-2 border-ink w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <h1 className="font-archivo text-[42px] text-ink tracking-[-1px] leading-none mb-2">Advertise</h1>
          <p className="font-georgia text-[15px] text-ink/60 italic">
            Reach 4,000+ Gwinnett County locals who actually live, eat, and spend money here.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-ink border-b-2 border-ink w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-0 grid grid-cols-4">
          {[
            { num: '4,000+', lbl: 'Facebook group members' },
            { num: '4,100+', lbl: 'Newsletter subscribers' },
            { num: 'Gwinnett', lbl: 'County only — no wasted reach' },
            { num: 'Thursday', lbl: 'Newsletter send day' },
          ].map((s, i) => (
            <div key={i} className={`py-6 ${i < 3 ? 'border-r-2 border-[#222]' : ''} ${i > 0 ? 'pl-6' : ''}`}>
              <p className="font-archivo text-[26px] text-yellow mb-1">{s.num}</p>
              <p className="font-inter text-[11px] text-[#555] uppercase tracking-[0.8px]">{s.lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Packages */}
      <div className="bg-paper border-b-2 border-ink w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-0 grid grid-cols-3">
          {PACKAGES.map((pkg, i) => (
            <div key={i}
              className={`py-8 ${i < 2 ? 'border-r-2 border-ink pr-8' : ''} ${i > 0 ? 'pl-8' : ''}
                          ${pkg.best ? 'relative' : ''}`}>
              {pkg.best && (
                <span className="inline-block bg-orange text-white font-inter text-[8px] font-bold
                                  uppercase tracking-[1px] px-3 py-1 mb-3 border border-orange">
                  Most popular
                </span>
              )}
              <p className="font-archivo text-[20px] text-ink mb-1">{pkg.name}</p>
              <p className="font-archivo text-[32px] text-orange mb-3 tracking-[-1px]">{pkg.price}</p>
              <p className="font-georgia text-[14px] text-[#555] leading-relaxed mb-4">{pkg.desc}</p>
              <ul className="space-y-2 mb-6">
                {pkg.includes.map(item => (
                  <li key={item} className="flex items-center gap-2 font-inter text-[12px] text-ink">
                    <span className="text-orange">✓</span> {item}
                  </li>
                ))}
              </ul>
              <a href="mailto:ads@allthingsgwinnett.com"
                className={`inline-block font-inter text-[11px] font-bold uppercase tracking-[1px]
                             px-5 py-3 border-2 border-ink no-underline transition-all
                             hover:translate-x-[2px] hover:translate-y-[2px]
                             ${pkg.best
                               ? 'bg-orange text-white border-orange shadow-[3px_3px_0_#7A2800] hover:shadow-[1px_1px_0_#7A2800]'
                               : 'bg-paper text-ink shadow-brutalist-sm hover:shadow-none'}`}>
                Get started →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="bg-paper border-b-2 border-ink w-full">
        <div className="max-w-[760px] mx-auto px-6 py-8">
          <p className="font-georgia text-[14px] text-[#777] italic leading-relaxed">
            ATG is ad-free in the editorial sense — we don't let advertisers influence coverage.
            Sponsored content is always clearly labeled. We only work with local businesses that
            are actually relevant to Gwinnett residents.
          </p>
        </div>
      </div>
    </main>
  )
}
