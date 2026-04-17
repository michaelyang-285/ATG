'use client'
import { useRef, useState } from 'react'
import Nav from '@/components/Nav'
import { Footer } from '@/components/Misc'

const CITIES = ['Lawrenceville', 'Duluth', 'Norcross', 'Buford', 'Snellville', 'Suwanee', 'Lilburn', 'Other']
const CATS   = ['Restaurant', 'Auto', 'Retail', 'Health & Wellness', 'Professional Services', 'Entertainment', 'Other']

export default function SubmitBusinessPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const formRef = useRef<HTMLFormElement | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    try {
      const res = await fetch('/api/submit-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) { setStatus('done'); form.reset() }
      else setStatus('error')
    } catch { setStatus('error') }
  }

  return (
    <main className="w-full">
      <Nav />

      <div className="bg-yellow border-b-2 border-ink w-full">
        <div className="max-w-[760px] mx-auto px-6 py-8">
          <h1 className="font-archivo text-[36px] text-ink tracking-[-1px] leading-none mb-2">Add your business</h1>
          <p className="font-georgia text-[15px] text-ink/60">
            Submit your business to the ATG directory. We review all submissions and publish within 48 hours.
          </p>
        </div>
      </div>

      <div className="bg-paper border-b-2 border-ink w-full">
        <div className="max-w-[760px] mx-auto px-6 py-10">

          {status === 'done' ? (
            <div className="bg-ink text-white p-8 border-2 border-ink shadow-brutalist">
              <p className="font-archivo text-[22px] text-yellow mb-2">Submitted. We'll review it soon.</p>
              <p className="font-georgia text-[15px] text-paper/50">
                We review all submissions within 48 hours. Once approved it'll appear in the directory and on the homepage.
              </p>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* Business name */}
              <div>
                <label className="block font-inter text-[10px] font-bold uppercase tracking-[1px] text-ink mb-2">
                  Business name *
                </label>
                <input name="name" required
                  className="w-full h-11 px-4 border-2 border-ink bg-white font-inter text-[14px]
                             outline-none focus:border-orange transition-colors" />
              </div>

              {/* Category + City row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-inter text-[10px] font-bold uppercase tracking-[1px] text-ink mb-2">
                    Category *
                  </label>
                  <select name="category" required
                    className="w-full h-11 px-4 border-2 border-ink bg-white font-inter text-[14px] outline-none">
                    <option value="">Select...</option>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-inter text-[10px] font-bold uppercase tracking-[1px] text-ink mb-2">
                    City *
                  </label>
                  <select name="city" required
                    className="w-full h-11 px-4 border-2 border-ink bg-white font-inter text-[14px] outline-none">
                    <option value="">Select...</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block font-inter text-[10px] font-bold uppercase tracking-[1px] text-ink mb-2">
                  Street address
                </label>
                <input name="address"
                  className="w-full h-11 px-4 border-2 border-ink bg-white font-inter text-[14px] outline-none focus:border-orange transition-colors" />
              </div>

              {/* Phone + Website */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-inter text-[10px] font-bold uppercase tracking-[1px] text-ink mb-2">Phone</label>
                  <input name="phone" type="tel"
                    className="w-full h-11 px-4 border-2 border-ink bg-white font-inter text-[14px] outline-none focus:border-orange transition-colors" />
                </div>
                <div>
                  <label className="block font-inter text-[10px] font-bold uppercase tracking-[1px] text-ink mb-2">Website</label>
                  <input name="website" type="url" placeholder="https://"
                    className="w-full h-11 px-4 border-2 border-ink bg-white font-inter text-[14px] outline-none focus:border-orange transition-colors" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-inter text-[10px] font-bold uppercase tracking-[1px] text-ink mb-2">
                  Description (1–2 sentences) *
                </label>
                <textarea name="description" required rows={3}
                  className="w-full px-4 py-3 border-2 border-ink bg-white font-inter text-[14px]
                             outline-none focus:border-orange transition-colors resize-none" />
              </div>

              {/* Your email */}
              <div>
                <label className="block font-inter text-[10px] font-bold uppercase tracking-[1px] text-ink mb-2">
                  Your email (for confirmation) *
                </label>
                <input name="email" type="email" required
                  className="w-full h-11 px-4 border-2 border-ink bg-white font-inter text-[14px] outline-none focus:border-orange transition-colors" />
              </div>

              {status === 'error' && (
                <p className="font-inter text-[12px] text-orange">Something went wrong. Try again or email us directly.</p>
              )}

              <span
                role="button"
                tabIndex={0}
                aria-disabled={status === 'sending'}
                onClick={() => {
                  if (status === 'sending') return
                  formRef.current?.requestSubmit()
                }}
                onKeyDown={(e) => {
                  if (status === 'sending') return
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    formRef.current?.requestSubmit()
                  }
                }}
                className="inline-block bg-orange text-white font-inter text-[12px] font-bold
                           uppercase tracking-[1px] px-8 py-4 border-2 border-ink
                           shadow-brutalist cursor-pointer self-start select-none
                           hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
                           transition-all aria-disabled:opacity-50"
              >
                {status === 'sending' ? 'Submitting...' : 'Submit business →'}
              </span>

            </form>
          )}

        </div>
      </div>

      <Footer />
    </main>
  )
}
