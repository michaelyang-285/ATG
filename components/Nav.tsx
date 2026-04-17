import ATGPin from './ATGPin'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'News',       href: '/news' },
  { label: 'Eats',       href: '/eats' },
  { label: 'Events',     href: '/events' },
  { label: 'Opinions',   href: '/opinions' },
  { label: 'Businesses', href: '/businesses' },
]

export default function Nav() {
  return (
    <nav className="bg-ink border-b-2 border-ink w-full">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center h-[50px]">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 no-underline">
          <ATGPin variant="dark" size={24} />
          <span className="font-archivo text-[15px] text-white tracking-[-0.5px] leading-none whitespace-nowrap">
            All Things <em className="not-italic text-orange">Gwinnett</em>
          </span>
        </Link>
        <div className="w-px h-6 bg-mid flex-shrink-0 mx-2" />
        <div className="flex items-center flex-1 h-full">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}
              className="nav-link relative group">
              {link.label}
              <span className="absolute bottom-0 left-4 h-[2px] bg-yellow w-0 group-hover:w-[calc(100%-32px)] transition-all duration-200" />
            </Link>
          ))}
          <Link href="/newsletter"
            className="ml-2 flex-shrink-0 bg-orange text-white font-inter
                       text-[10px] font-semibold uppercase tracking-[0.6px]
                       px-4 py-[7px] leading-none no-underline select-none
                       border-2 border-ink shadow-brutalist-dk-sm
                       hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
                       transition-all">
            Newsletter
          </Link>
        </div>
      </div>
    </nav>
  )
}
