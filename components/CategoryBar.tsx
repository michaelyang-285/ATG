'use client'
import { useState } from 'react'

const CATS = ['Everything', 'Food & drink', 'Roads & traffic', 'Development', 'Schools', 'Crime & safety', 'Events', 'New businesses']

export default function CategoryBar() {
  const [active, setActive] = useState('Everything')
  return (
    <div className="bg-paper border-b-2 border-ink w-full">
      <div className="max-w-[1200px] mx-auto px-0 sm:px-6 py-[14px]">
        <div className="px-4 sm:px-0 flex w-full flex-wrap items-center justify-evenly gap-y-2 gap-x-2 sm:gap-x-3">
          {CATS.map((cat) => (
            <span key={cat} onClick={() => setActive(cat)}
              className={cat === active ? 'cat-pill-active' : 'cat-pill'}>
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
