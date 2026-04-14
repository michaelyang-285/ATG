import { createClient } from 'next-sanity'
import { NextRequest } from 'next/server'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  token:     process.env.SANITY_WRITE_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Basic validation
    if (!body.name || !body.city || !body.description || !body.email) {
      return Response.json(
        { error: 'Missing required fields: name, city, description, email' },
        { status: 400 }
      )
    }

    // Slug from business name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 96)

    // Create draft in Sanity — won't go live until you publish
    await writeClient.create({
      _type: 'business',
      name:         body.name,
      slug:         { _type: 'slug', current: slug },
      category:     body.category ?? 'Other',
      city:         body.city,
      address:      body.address ?? '',
      phone:        body.phone ?? '',
      website:      body.website ?? '',
      description:  body.description,
      status:       'pending',    // hidden until reviewed
      source:       'user-submitted',
      submittedBy:  body.email,
      submittedAt:  new Date().toISOString(),
    })

    return Response.json({ success: true })
  } catch (err) {
    console.error('Business submission error:', err)
    return Response.json({ error: 'Submission failed' }, { status: 500 })
  }
}
