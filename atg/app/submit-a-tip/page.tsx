'use client'
import { useState } from 'react'
import Nav from '@/components/Nav'
import { Footer } from '@/components/Misc'

export default function SubmitTipPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const data = Object.fromEntries(new FormData(e.currentTarget))
    try {
      const res = await fetch('/api/submit-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) setStatus('done')
      else setStatus('error')
    } catch { setStatus('error') }
  }

  return (
    <main className="w-full">
      <Nav />

      <div className="bg-orange border-b-2 border-ink w-full">
        <div className="max-w-[760px] mx-auto px-6 py-8">
          <h1 className="font-archivo text-[42px] text-white tracking-[-1px] leading-none mb-2">
            Submit a tip
          </h1>
          <p className="font-georgia text-[15px] text-white/70 italic">
            Know something Gwinnett should know? Tell us. Sources are always protected.
          </p>
        </div>
      </div>

      <div className="bg-paper border-b-2 border-ink w-full">
        <div className="max-w-[760px] mx-auto px-6 py-10">
          {status === 'done' ? (
            <div className="bg-ink p-8 border-2 border-ink shadow-brutalist">
              <p className="font-archivo text-[22px] text-yellow mb-2">Got it. We'll take a look.</p>
              <p className="font-georgia text-[15px] text-[#aaa]">
                We read every tip. If we pursue the story we may reach out — but we'll never share your info without asking first.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              <div>
                <label className="block font-inter text-[10px] font-bold uppercase tracking-[1px] text-ink mb-2">
                  What's the tip? *
                </label>
                <textarea name="tip" required rows={5}
                  placeholder="Tell us what you know. The more specific the better — addresses, names, dates help."
                  className="w-full px-4 py-3 border-2 border-ink bg-white font-georgia text-[15px]
                             outline-none focus:border-orange transition-colors resize-none
                             placeholder:text-[#bbb] placeholder:font-inter placeholder:text-[13px]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-inter text-[10px] font-bold uppercase tracking-[1px] text-ink mb-2">
                    Category
                  </label>
                  <select name="category"
                    className="w-full h-11 px-4 border-2 border-ink bg-white font-inter text-[14px] outline-none">
                    <option value="">Select...</option>
                    {['Crime & safety','Development','Schools','Business','Roads','Local government','Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-inter text-[10px] font-bold uppercase tracking-[1px] text-ink mb-2">
                    City / Neighborhood
                  </label>
                  <input name="location"
                    className="w-full h-11 px-4 border-2 border-ink bg-white font-inter text-[14px] outline-none focus:border-orange transition-colors" />
                </div>
              </div>

              <div>
                <label className="block font-inter text-[10px] font-bold uppercase tracking-[1px] text-ink mb-2">
                  Your email (optional — only if you want us to follow up)
                </label>
                <input name="email" type="email"
                  className="w-full h-11 px-4 border-2 border-ink bg-white font-inter text-[14px] outline-none focus:border-orange transition-colors" />
                <p className="font-inter text-[10px] text-[#999] mt-1">
                  We will never share your email or identify you as a source without your permission.
                </p>
              </div>

              {status === 'error' && (
                <p className="font-inter text-[12px] text-orange">
                  Something went wrong. Email us directly at tips@allthingsgwinnett.com
                </p>
              )}

              <button type="submit" disabled={status === 'sending'}
                className="inline-block bg-ink text-white font-inter text-[12px] font-bold
                           uppercase tracking-[1px] px-8 py-4 border-2 border-ink
                           shadow-brutalist cursor-pointer self-start
                           hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutalist-sm
                           transition-all disabled:opacity-50">
                {status === 'sending' ? 'Sending...' : 'Send tip →'}
              </button>

            </form>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
