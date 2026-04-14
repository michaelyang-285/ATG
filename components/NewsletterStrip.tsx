'use client'

export default function NewsletterStrip({
  headline     = 'Gwinnett in 3 minutes. Every Thursday.',
  sub          = 'No fluff. No tourism board energy. Just what actually happened.',
  subscriberCount = '4,127 locals already subscribed',
}: {
  headline?: string
  sub?: string
  subscriberCount?: string
}) {
  return (
    /* Full-bleed black */
    <div className="bg-ink border-b-2 border-ink w-full">
      {/* Contained content */}
      <div className="max-w-[1200px] mx-auto px-6 py-[22px] grid grid-cols-[1fr_auto] gap-7 items-center">
        <div>
          <p className="font-archivo text-[19px] text-yellow leading-tight mb-1">{headline}</p>
          <p className="font-inter text-[12px] text-[#aaa] leading-relaxed">{sub}</p>
          <p className="font-inter text-[11px] text-white font-semibold mt-[6px]">{subscriberCount}</p>
        </div>
        {/* Input + button stacked, button centered under input */}
        <div className="flex flex-col items-center gap-2 w-[240px]">
          <input
            type="email"
            placeholder="your@email.com"
            className="w-[240px] h-10 px-[14px] bg-[#1c1c1c] border-2 border-[#444]
                       text-white font-inter text-[13px] outline-none
                       focus:border-yellow transition-colors placeholder:text-[#555]"
          />
          <span className="bg-yellow text-ink font-inter text-[11px] font-bold uppercase
                           tracking-[0.8px] px-7 h-10 leading-10 text-center cursor-pointer
                           whitespace-nowrap shadow-brutalist-dk-sm
                           hover:translate-x-[1px] hover:translate-y-[1px] transition-transform">
            I'm in →
          </span>
        </div>
      </div>
    </div>
  )
}
