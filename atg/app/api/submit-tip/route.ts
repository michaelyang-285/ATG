import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.tip) {
      return Response.json({ error: 'Tip content is required' }, { status: 400 })
    }

    // Option A: Send to email via a transactional email service (Resend, SendGrid, etc.)
    // Swap this section for your provider of choice.
    //
    // Example with Resend:
    // import { Resend } from 'resend'
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'tips@allthingsgwinnett.com',
    //   to: 'editor@allthingsgwinnett.com',
    //   subject: `New tip: ${body.category ?? 'General'} — ${body.location ?? 'Gwinnett'}`,
    //   text: `
    //     Tip: ${body.tip}
    //     Category: ${body.category}
    //     Location: ${body.location}
    //     Submitted by: ${body.email ?? 'Anonymous'}
    //   `,
    // })

    // Option B: Save to Sanity as a draft "tip" document
    // (requires adding a "tip" schema to Sanity)
    //
    // Option C: Save to a Google Sheet via Sheets API
    // (useful for a simple editorial inbox)

    // For now: log and return success
    // Replace with your chosen option above
    console.log('New tip received:', {
      tip:      body.tip,
      category: body.category,
      location: body.location,
      email:    body.email,
    })

    return Response.json({ success: true })
  } catch (err) {
    console.error('Tip submission error:', err)
    return Response.json({ error: 'Submission failed' }, { status: 500 })
  }
}
