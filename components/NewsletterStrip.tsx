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
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <div className="max-w-[980px] mx-auto grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_340px] md:items-center gap-6 md:gap-8">
          <div className="min-w-0">
            <p className="font-archivo text-[20px] text-yellow leading-tight mb-1">{headline}</p>
            <p className="font-inter text-[12px] text-paper/60 leading-relaxed">{sub}</p>
            <p className="font-inter text-[11px] text-white font-semibold mt-[5px]">{subscriberCount}</p>
          </div>
          <div className="flex flex-col items-center gap-2 w-full">
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full h-10 px-[14px] bg-mid border-2 border-yellow/30 text-paper font-inter text-[13px] outline-none focus:border-yellow transition-colors placeholder:text-paper/40"
            />
            <span
              className="bg-yellow text-ink font-inter text-[11px] font-bold uppercase tracking-[0.8px]
                         px-7 h-10 leading-10 text-center cursor-pointer whitespace-nowrap w-full
                         border-2 border-ink shadow-brutalist-dk-sm select-none
                         hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              I'm in →
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
