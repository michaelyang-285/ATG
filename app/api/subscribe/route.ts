import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Valid email required' }, { status: 400 })
    }

    // ── WIRE TO YOUR EMAIL PROVIDER ────────────────────────────
    //
    // Option A: Beehiiv (recommended for newsletters)
    // const res = await fetch(`https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUB_ID}/subscriptions`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}` },
    //   body: JSON.stringify({ email, reactivate_existing: true, send_welcome_email: true }),
    // })
    //
    // Option B: Mailchimp
    // const res = await fetch(`https://us1.api.mailchimp.com/3.0/lists/${process.env.MC_LIST_ID}/members`, {
    //   method: 'POST',
    //   headers: {
    //     Authorization: `apikey ${process.env.MC_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ email_address: email, status: 'subscribed' }),
    // })
    //
    // Option C: ConvertKit
    // const res = await fetch(`https://api.convertkit.com/v3/forms/${process.env.CK_FORM_ID}/subscribe`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ api_key: process.env.CK_API_KEY, email }),
    // })
    // ───────────────────────────────────────────────────────────

    // Placeholder until provider is wired
    console.log('Newsletter subscription:', email)

    return Response.json({ success: true })
  } catch (err) {
    console.error('Subscribe error:', err)
    return Response.json({ error: 'Subscription failed' }, { status: 500 })
  }
}
