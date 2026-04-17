import StoryTag from './StoryTag'
import Link from 'next/link'

type Story = {
  title: string; deck: string; slug: { current: string }
  readTime?: number; publishedAt?: string; author?: string
  category?: { name: string; color: string }
}
type SidebarStory = {
  title: string; slug: { current: string }; publishedAt?: string
  category?: { name: string }
}

export default function Hero({ heroStory, sidebarStories = [] }: { heroStory?: Story; sidebarStories?: SidebarStory[] }) {
  const story = heroStory ?? {
    title: "Gwinnett approved a $42M development. Here's what's actually going in — not the press release.",
    deck: "We read the permits, called the planning board, and found which restaurant chains already signed leases. You deserve more than a ribbon-cutting photo.",
    slug: { current: 'gwinnett-42m-development' }, readTime: 4, author: 'ATG Staff',
    publishedAt: new Date().toISOString(), category: { name: "Today's lead", color: 'orange' },
  }
  const sidebar = sidebarStories.length > 0 ? sidebarStories : [
    { title: 'GCPS overcrowding report drops — three schools flagged, one closure possible', slug: { current: 'gcps-overcrowding' }, category: { name: 'Schools' } },
    { title: "Snellville store robberies: what GPD said (and didn't say)", slug: { current: 'snellville-robberies' }, category: { name: 'Crime & safety' } },
    { title: 'Wing Chef in Lawrenceville dropped a ghost pepper menu. Send help.', slug: { current: 'wing-chef-ghost-pepper' }, category: { name: 'Food & drink' } },
    { title: 'Hmong New Year at Gas South — biggest turnout yet, photos inside', slug: { current: 'hmong-new-year' }, category: { name: 'Community' } },
  ]
  return (
    <div className="bg-paper border-b-2 border-ink w-full">
    <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      {/* Left column wrapper keeps the vertical rule aligned to column boundary */}
      <div className="md:border-r-2 md:border-ink">
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-[10px] mb-[14px]">
            <span className="font-inter text-[9px] font-bold uppercase tracking-[1.5px] bg-orange text-white px-[10px] py-1">Today's lead</span>
            <span className="font-inter text-[11px] text-ink/50">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h1 className="font-archivo text-[30px] sm:text-[34px] leading-[1.02] text-ink tracking-[-1px] mb-[14px]">
            {story.title}
          </h1>
          <p className="font-georgia text-[14px] sm:text-[15px] text-ink/70 leading-relaxed mb-5 pl-[14px] border-l-[3px] border-orange">
            {story.deck}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-[14px]">
            <Link
              href={`/stories/${story.slug.current}`}
              className="inline-block bg-orange text-white font-inter text-[11px] font-bold uppercase tracking-[1px]
                         px-[22px] py-3 border-2 border-ink shadow-brutalist-dk-sm cursor-pointer select-none no-underline
                         hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              Read the story →
            </Link>
            <span className="font-inter text-[11px] text-ink/50">{story.readTime} min read · {story.author ?? 'ATG Staff'}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col border-t-2 border-ink md:border-t-0">
        <div className="bg-orange border-b-2 border-ink grid grid-cols-3">
          {[{ num: '4K+', lbl: 'Members' },{ num: '12', lbl: 'Stories today' },{ num: '4', lbl: 'Events this week' }].map(({ num, lbl }) => (
            <div key={lbl} className="text-center py-[14px] px-2 border-r border-white/20 last:border-r-0">
              <span className="font-archivo text-[24px] text-white block leading-none">{num}</span>
              <span className="font-inter text-[8px] font-bold uppercase tracking-[1px] text-white/60 mt-[2px] block">{lbl}</span>
            </div>
          ))}
        </div>
        <div className="flex-1">
          {sidebar.map((s) => (
            <Link key={s.slug.current} href={`/stories/${s.slug.current}`} className="block px-4 py-[13px] border-b border-ink/15 last:border-b-0 hover:bg-card group no-underline">
              <p className="font-inter text-[8px] font-bold uppercase tracking-[1px] text-ink/50 mb-[3px]">{s.category?.name}</p>
              <p className="font-space text-[13px] font-bold text-ink leading-[1.3] group-hover:underline underline-offset-2">{s.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
    </div>
  )
}
