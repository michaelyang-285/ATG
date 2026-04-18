import { PromoBar } from '@/components/Misc'
import ATGPin from '@/components/ATGPin'

export const metadata = {
  title: 'About — All Things Gwinnett',
  description: 'ATG started as a Facebook group and grew into Gwinnett\'s local media brand.',
}

export default function AboutPage() {
  return (
    <main className="w-full">
      {/* Header */}
      <div className="bg-ink border-b-2 border-ink w-full">
        <div className="max-w-[760px] mx-auto px-6 py-12 flex items-center gap-6">
          <ATGPin variant="dark" size={72} />
          <div>
            <h1 className="font-archivo text-[42px] text-white tracking-[-1px] leading-none mb-2">
              All Things <span className="text-orange">Gwinnett</span>
            </h1>
            <p className="font-inter text-[12px] text-[#555] uppercase tracking-[1.5px]">
              The county. No filter.
            </p>
          </div>
        </div>
      </div>

      {/* Story */}
      <div className="bg-paper border-b-2 border-ink w-full">
        <div className="max-w-[760px] mx-auto px-6 py-12 font-georgia text-[17px] text-ink leading-[1.85]">

          <p className="mb-6">
            All Things Gwinnett started as a Facebook group. A place where neighbors could share traffic
            alerts, restaurant recommendations, and the kind of hyperlocal news that never makes it into
            the Atlanta Journal-Constitution.
          </p>

          <p className="mb-6">
            It grew. 4,000+ members later, the group was doing what local news organizations had
            stopped doing — covering the actual county. Not the sanitized, press-release version.
            The real one.
          </p>

          <p className="mb-6">
            This website is the next step. A proper local media brand for Gwinnett — with
            real journalism, real restaurant coverage, a business directory built by locals,
            and a newsletter that respects your time.
          </p>

          <p className="mb-10">
            We are not the Chamber of Commerce. We are not the tourism board. We are not going to
            describe anything as a "vibrant community." We live here. We eat here. We sit in the
            same traffic. This is our county — and we're going to cover it like we mean it.
          </p>

          <div className="border-l-4 border-orange pl-5 mb-10">
            <p className="font-archivo text-[22px] text-ink tracking-[-0.5px] leading-tight">
              "The county. No filter."
            </p>
          </div>

          <h2 className="font-archivo text-[28px] text-ink tracking-[-0.5px] mb-4">What we cover</h2>
          <ul className="list-none space-y-2 mb-10">
            {[
              'Local news — development, schools, crime, roads, government',
              'Food & drink — reviews, rankings, new openings, hidden gems',
              'Events — what\'s happening in Gwinnett this week',
              'Opinions — community voices and things that needed to be said',
              'Businesses — a directory of local businesses you can actually trust',
            ].map(item => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-orange flex-shrink-0 mt-1">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <h2 className="font-archivo text-[28px] text-ink tracking-[-0.5px] mb-4">Contact</h2>
          <p className="mb-2">
            <strong className="font-space">Tips:</strong>{' '}
            <a href="/submit-a-tip" className="text-orange underline underline-offset-2">Submit a tip</a>
            {' '}or email <a href="mailto:tips@allthingsgwinnett.com" className="text-orange underline underline-offset-2">tips@allthingsgwinnett.com</a>
          </p>
          <p className="mb-2">
            <strong className="font-space">Advertising:</strong>{' '}
            <a href="/advertise" className="text-orange underline underline-offset-2">See our options</a>
            {' '}or email <a href="mailto:ads@allthingsgwinnett.com" className="text-orange underline underline-offset-2">ads@allthingsgwinnett.com</a>
          </p>
          <p>
            <strong className="font-space">Facebook group:</strong>{' '}
            <a href="https://facebook.com/groups/allthingsgwinnett" target="_blank" rel="noopener"
              className="text-orange underline underline-offset-2">
              Join 4,000+ locals
            </a>
          </p>
        </div>
      </div>

      <PromoBar />
    </main>
  )
}
