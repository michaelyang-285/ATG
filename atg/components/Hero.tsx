import StoryTag from './StoryTag'

type Story = {
  title: string
  deck: string
  slug: { current: string }
  readTime?: number
  publishedAt?: string
  author?: string
  category?: { name: string; color: string }
}

type SidebarStory = {
  title: string
  slug: { current: string }
  publishedAt?: string
  category?: { name: string }
}

export default function Hero({
  heroStory,
  sidebarStories = [],
}: {
  heroStory?: Story
  sidebarStories?: SidebarStory[]
}) {
  // Fallback content when no Sanity data yet
  const story = heroStory ?? {
    title: "Gwinnett approved a $42M development. Here's what's actually going in — not the press release.",
    deck: "We read the permits, called the planning board, and found which restaurant chains already signed leases. You deserve more than a ribbon-cutting photo.",
    slug: { current: 'gwinnett-42m-development' },
    readTime: 4,
    author: 'ATG Staff',
    publishedAt: new Date().toISOString(),
    category: { name: "Today's lead", color: 'orange' },
  }

  const sidebar = sidebarStories.length > 0 ? sidebarStories : [
    { title: 'GCPS overcrowding report drops — three schools flagged, one closure possible', slug: { current: 'gcps-overcrowding' }, publishedAt: '', category: { name: 'Schools' } },
    { title: 'Snellville store robberies: what GPD said (and didn\'t say)', slug: { current: 'snellville-robberies' }, publishedAt: '', category: { name: 'Crime & safety' } },
    { title: 'Wing Chef in Lawrenceville dropped a ghost pepper menu. Send help.', slug: { current: 'wing-chef-ghost-pepper' }, publishedAt: '', category: { name: 'Food & drink' } },
    { title: 'Hmong New Year at Gas South — biggest turnout yet, photos inside', slug: { current: 'hmong-new-year' }, publishedAt: '', category: { name: 'Community' } },
  ]

  return (
    <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] border-b-2 border-ink">

      {/* Main story */}
      <div className="p-8 border-r-2 border-ink">
        <div className="flex items-center gap-[10px] mb-[14px]">
          <span className="font-inter text-[9px] font-bold uppercase tracking-[1.5px] bg-orange text-white px-[10px] py-1">
            Today's lead
          </span>
          <span className="font-inter text-[11px] text-[#888]">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <h1 className="font-archivo text-[34px] leading-[1.05] text-ink tracking-[-1px] mb-[14px]">
          {story.title}
        </h1>

        <p className="font-georgia text-[15px] text-[#444] leading-relaxed mb-5 pl-[14px] border-l-[3px] border-orange">
          {story.deck}
        </p>

        <div className="flex items-center gap-[14px]">
          <a
            href={`/stories/${story.slug.current}`}
            className="inline-block bg-orange text-white font-inter text-[11px] font-bold uppercase tracking-[1px] px-[22px] py-3 border-2 border-ink shadow-brutalist-sm cursor-pointer"
          >
            Read the story →
          </a>
          <span className="font-inter text-[11px] text-[#888]">
            {story.readTime} min read · {story.author ?? 'ATG Staff'}
          </span>
        </div>
      </div>

      {/* Right column */}
      <div className="flex flex-col">
        {/* Stats bar */}
        <div className="bg-orange border-b-2 border-ink grid grid-cols-3">
          {[
            { num: '4K+', lbl: 'Members' },
            { num: '12',  lbl: 'Stories today' },
            { num: '4',   lbl: 'Events this week' },
          ].map(({ num, lbl }) => (
            <div key={lbl} className="text-center py-[14px] px-2 border-r border-white/20 last:border-r-0">
              <span className="font-archivo text-[24px] text-white block leading-none">{num}</span>
              <span className="font-inter text-[8px] font-bold uppercase tracking-[1px] text-white/60 mt-[2px] block">{lbl}</span>
            </div>
          ))}
        </div>

        {/* Sidebar stories */}
        <div className="flex-1">
          {sidebar.map((s) => (
            <a
              key={s.slug.current}
              href={`/stories/${s.slug.current}`}
              className="block px-4 py-[13px] border-b border-[#ddd] last:border-b-0 hover:bg-card group"
            >
              <p className="font-inter text-[8px] font-bold uppercase tracking-[1px] text-[#999] mb-[3px]">
                {s.category?.name}
              </p>
              <p className="font-space text-[13px] font-bold text-ink leading-[1.3] group-hover:underline underline-offset-2">
                {s.title}
              </p>
              <p className="font-inter text-[10px] text-[#aaa] mt-[3px]">
                {s.publishedAt ? new Date(s.publishedAt).toLocaleDateString() : ''}
              </p>
            </a>
          ))}
        </div>
      </div>

    </div>
  )
}
