import Link from 'next/link'

export default function InlineNewsletter() {
  return (
    <aside
      aria-label="Subscribe to the newsletter"
      className="my-10 border-2 border-ink bg-ink text-paper shadow-brutalist-sm"
    >
      <div className="p-5 sm:p-6">
        <p className="font-inter text-[9px] font-bold uppercase tracking-[1.2px] text-yellow">
          The ATG Newsletter
        </p>
        <p className="font-archivo text-[22px] sm:text-[26px] leading-[1.15] tracking-[-0.5px] mt-2">
          Get the county in your inbox.
        </p>
        <p className="font-georgia text-[15px] leading-relaxed text-paper/70 mt-2">
          One short email, every Thursday — the stories, eats, and events worth knowing this week.
        </p>
        <form
          action="/newsletter"
          method="get"
          className="mt-4 flex flex-col sm:flex-row gap-2"
        >
          <label htmlFor="inline-nl-email" className="sr-only">
            Email address
          </label>
          <input
            id="inline-nl-email"
            type="email"
            name="email"
            required
            placeholder="you@gwinnett.com"
            className="flex-1 bg-paper text-ink placeholder:text-ink/40 font-inter text-[14px] px-4 py-[10px] border-2 border-paper outline-none focus:border-yellow"
          />
          <button
            type="submit"
            className="flex-shrink-0 bg-orange text-white font-inter text-[11px] font-bold uppercase tracking-[0.8px] px-5 py-[10px] border-2 border-paper hover:bg-dk-orange transition-colors"
          >
            Subscribe
          </button>
        </form>
        <p className="font-inter text-[10px] uppercase tracking-[0.8px] text-paper/50 mt-3">
          Want a preview?{' '}
          <Link
            href="/newsletter"
            className="underline underline-offset-2 hover:text-yellow"
          >
            See sample
          </Link>
        </p>
      </div>
    </aside>
  )
}
