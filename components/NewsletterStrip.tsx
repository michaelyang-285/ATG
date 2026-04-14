'use client'

export default function NewsletterStrip({
  headline = 'Gwinnett in 3 minutes. Every Thursday.',
  sub = 'No fluff. No tourism board energy. Just what actually happened.',
  subscriberCount = '4,127 locals already subscribed',
}: {
  headline?: string
  sub?: string
  subscriberCount?: string
}) {
  return (
    <div className="bg-ink border-b-2 border-ink w-full">
      <div className="max-w-[600px] mx-auto px-6 py-10 flex flex-col items-center text-center gap-4">
        <p className="font-archivo text-[28px] text-yellow leading-tight">{headline}</p>
        <p className="font-inter text-[13px] text-[#aaa] leading-relaxed">{sub}</p>
        <p className="font-inter text-[11px] text-white font-semibold">{subscriberCount}</p>
        <div className="flex flex-col items-center gap-2 w-full max-w-[320px] mt-2">
          <input type="email" placeholder="your@email.com"
            className="w-full h-11 px-[14px] bg-[#1c1c1c] border-2 border-[#444] text-white font-inter text-[13px] outline-none focus:border-yellow transition-colors placeholder:text-[#555]" />
          <span className="bg-yellow text-ink font-inter text-[12px] font-bold uppercase tracking-[0.8px] px-8 h-11 leading-[44px] text-center cursor-pointer whitespace-nowrap w-full">
            I'm in →
          </span>
        </div>
      </div>
    </div>
  )
}
