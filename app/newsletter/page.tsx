'use client'
import { useState } from 'react'
import Nav from '@/components/Nav'
import { Footer } from '@/components/Misc'
import ATGPin from '@/components/ATGPin'

export default function NewsletterPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [email, setEmail] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      // Wire to your email provider (Mailchimp, Beehiiv, ConvertKit)
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) setStatus('done')
      else setStatus('error')
    } catch { setStatus('error') }
  }

  return (
    <main className="w-full">
      <Nav />

      {/* Hero — full bleed ink */}
      <div className="bg-ink border-b-2 border-ink w-full">
        <div className="max-w-[760px] mx-auto px-6 py-16 text-center">
          <div className="flex justify-center mb-6">
            <ATGPin variant="dark" size={64} />
          </div>
          <h1 className="font-archivo text-[48px] text-yellow tracking-[-2px] leading-none mb-4">
            Gwinnett in 3 minutes.
          </h1>
          <p className="font-archivo text-[32px] text-white tracking-[-1px] leading-tight mb-6">
            Every Thursday morning.
          </p>
          <p className="font-georgia text-[17px] text-[#666] italic leading-relaxed mb-10 max-w-[500px] mx-auto">
            No fluff. No tourism board energy. Just what actually happened in Gwinnett County this week — news, food, events, and community.
          </p>

          {status === 'done' ? (
            <div className="bg-yellow border-2 border-yellow p-8 max-w-[400px] mx-auto">
              <p className="font-archivo text-[24px] text-ink mb-2">You're in.</p>
              <p className="font-inter text-[13px] text-ink/60">
                Check your inbox — first issue lands Thursday.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 max-w-[400px] mx-auto">
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full h-12 px-4 bg-[#1c1c1c] border-2 border-[#444]
                           text-white font-inter text-[14px] outline-none
                           focus:border-yellow transition-colors placeholder:text-[#555]"
              />
              <button type="submit" disabled={status === 'sending'}
                className="w-full bg-orange text-white font-inter text-[13px] font-bold
                           uppercase tracking-[1px] h-12 border-2 border-orange
                           shadow-[4px_4px_0_#7A2800] cursor-pointer
                           hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutalist-sm
                           transition-all disabled:opacity-50">
                {status === 'sending' ? 'Signing you up...' : 'I\'m in →'}
              </button>
              {status === 'error' && (
                <p className="font-inter text-[11px] text-orange">Something went wrong. Try again.</p>
              )}
              <p className="font-inter text-[10px] text-[#555]">
                Free. Unsubscribe any time. No spam.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* What you get */}
      <div className="bg-paper border-b-2 border-ink w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-0 grid grid-cols-3">
          {[
            { label: 'Top story', desc: 'The one thing that actually mattered this week in Gwinnett.' },
            { label: 'New spots', desc: 'Restaurants, businesses, and events worth knowing about.' },
            { label: 'Quick hits', desc: 'Roads, schools, crime, development — the stuff that affects your week.' },
          ].map((item, i) => (
            <div key={i} className={`py-8 ${i < 2 ? 'border-r-2 border-ink pr-8' : ''} ${i > 0 ? 'pl-8' : ''}`}>
              <div className="font-archivo text-[11px] text-orange uppercase tracking-[1.5px] mb-3">
                {String(i + 1).padStart(2, '0')}
              </div>
              <p className="font-space text-[18px] font-bold text-ink mb-2">{item.label}</p>
              <p className="font-georgia text-[14px] text-[#555] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Social proof */}
      <div className="bg-yellow border-b-2 border-ink w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between">
          <p className="font-archivo text-[22px] text-ink tracking-[-0.5px]">
            4,127 Gwinnett locals already subscribed.
          </p>
          <p className="font-inter text-[12px] text-ink/50">Join them.</p>
        </div>
      </div>

      <Footer />
    </main>
  )
}
