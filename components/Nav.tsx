'use client'

import { useEffect, useId, useState } from 'react'
import ATGPin from './ATGPin'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Local Stories', href: '/stories' },
  { label: 'Guides',        href: '/guides' },
  { label: 'Eats',       href: '/eats' },
  { label: 'Events',     href: '/events' },
  { label: 'Businesses', href: '/businesses' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const menuId = useId()

  useEffect(() => {
    // Prevent background horizontal/vertical scroll when menu is open.
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <nav className="bg-ink border-b-2 border-ink w-full relative">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between gap-3 h-[50px]">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 no-underline">
          <ATGPin variant="dark" size={24} />
          <span className="font-archivo text-[13px] sm:text-[15px] text-white tracking-[-0.5px] leading-none whitespace-nowrap">
            <span className="hidden sm:inline">All Things </span>
            <span className="sm:hidden">ATG </span>
            <em className="not-italic text-orange">Gwinnett</em>
          </span>
        </Link>
        <div className="flex items-center flex-1 h-full justify-end min-w-0">
          {/* Desktop nav */}
          <div className="hidden md:flex items-center h-full">
            <div className="w-px h-6 bg-mid flex-shrink-0 mx-2" />
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link relative group">
                {link.label}
                <span className="absolute bottom-0 left-4 h-[2px] bg-yellow w-0 group-hover:w-[calc(100%-32px)] transition-all duration-200" />
              </Link>
            ))}
            <Link
              href="/newsletter"
              className="ml-2 flex-shrink-0 bg-orange text-white font-inter
                         text-[10px] font-semibold uppercase tracking-[0.6px]
                         px-4 py-[7px] leading-none no-underline select-none
                         border-2 border-ink shadow-brutalist-dk-sm
                         hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
                         transition-all"
            >
              Newsletter
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-3 flex-shrink-0">
            <Link
              href="/newsletter"
              className="flex-shrink-0 bg-orange text-white font-inter
                         text-[10px] font-semibold uppercase tracking-[0.6px]
                         px-3 py-[7px] leading-none no-underline select-none
                         border-2 border-ink shadow-brutalist-dk-sm"
            >
              Newsletter
            </Link>
            <span
              role="button"
              tabIndex={0}
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen(v => !v)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setOpen(v => !v)
                }
                if (e.key === 'Escape') setOpen(false)
              }}
              className="inline-flex items-center justify-center w-[42px] h-[34px]
                         border-2 border-mid text-paper/80 select-none cursor-pointer
                         hover:text-yellow transition-colors"
            >
              <svg width="18" height="14" viewBox="0 0 18 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="0" y="0" width="18" height="2" fill="currentColor" />
                <rect x="0" y="6" width="18" height="2" fill="currentColor" />
                <rect x="0" y="12" width="18" height="2" fill="currentColor" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {open && (
        <>
          {/* Backdrop / click outside */}
          <span
            role="button"
            tabIndex={0}
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="md:hidden fixed inset-0 top-[50px] bg-black/20 z-40"
          />
          <div className="md:hidden absolute left-0 right-0 top-[50px] bg-ink border-t-2 border-mid border-b-2 border-ink z-50">
            <div className="max-w-[1200px] mx-auto px-6 py-4">
              <div className="grid grid-cols-2 gap-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block font-inter text-[10px] font-semibold uppercase tracking-[0.6px]
                               px-[14px] py-[10px] border-2 border-mid text-paper/80
                               no-underline hover:text-yellow transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/newsletter"
                  onClick={() => setOpen(false)}
                  className="col-span-2 block bg-orange text-white font-inter text-[11px] font-bold uppercase tracking-[0.8px]
                             px-[14px] py-[12px] border-2 border-ink shadow-brutalist-dk-sm
                             no-underline select-none text-center
                             hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  Join the newsletter →
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
