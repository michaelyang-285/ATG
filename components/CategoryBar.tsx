'use client'
import { useState } from 'react'

const CATS = ['Everything', 'Food & drink', 'Roads & traffic', 'Development', 'Schools', 'Crime & safety', 'Events', 'New businesses']

export default function CategoryBar() {
  const [active, setActive] = useState('Everything')
  return (
    <div className="bg-paper border-b-2 border-ink w-full">
      <div className="max-w-[1200px] mx-auto px-6 py-[14px] flex gap-2 flex-wrap">
        {CATS.map((cat) => (
          <span key={cat} onClick={() => setActive(cat)}
            className={cat === active ? 'cat-pill-active' : 'cat-pill'}>
            {cat}
          </span>
        ))}
      </div>
    </div>
  )
}
