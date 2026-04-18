import { client } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import Ticker from '@/components/Ticker'
import StoryTag from '@/components/StoryTag'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 60

// Generate static params for all stories at build time (SSG)
export async function generateStaticParams() {
  try {
    const stories = await client.fetch(`*[_type == "story"]{ "slug": slug.current }`)
    return stories.map((s: any) => ({ slug: s.slug }))
  } catch { return [] }
}

// Dynamic SEO metadata per story
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const story = await client.fetch(
      `*[_type == "story" && slug.current == $slug][0]{ title, deck }`,
      { slug: params.slug }
    )
    return {
      title: `${story.title} — All Things Gwinnett`,
      description: story.deck,
      openGraph: {
        title: story.title,
        description: story.deck,
        type: 'article',
      },
    }
  } catch {
    return { title: 'Story — All Things Gwinnett' }
  }
}

async function getStory(slug: string) {
  return client.fetch(
    `*[_type == "story" && slug.current == $slug][0]{
      title, deck, publishedAt, readTime, author, location,
      "category": category->{ name, color },
      "thumb": thumbnail.asset->url,
      body
    }`,
    { slug }
  )
}

export default async function StoryPage({ params }: { params: { slug: string } }) {
  const story = await getStory(params.slug)
  if (!story) notFound()

  return (
    <main className="w-full">
      <Ticker items={[]} />

      {/* Article header */}
      <div className="bg-paper border-b-2 border-ink w-full">
        <div className="max-w-[760px] mx-auto px-6 py-10">
          <StoryTag color={story.category?.color} name={story.category?.name ?? ''} />
          <h1 className="font-archivo text-[40px] leading-[1.05] text-ink tracking-[-1px] mt-3 mb-4">
            {story.title}
          </h1>
          <p className="font-georgia text-[18px] text-[#444] leading-relaxed mb-5
                         pl-4 border-l-4 border-orange">
            {story.deck}
          </p>
          <div className="flex items-center gap-3 font-inter text-[11px] text-[#999]">
            <span>{story.author ?? 'ATG Staff'}</span>
            <span>·</span>
            <span>{story.location}</span>
            <span>·</span>
            <span>{story.readTime} min read</span>
            <span>·</span>
            <span>{new Date(story.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Hero image */}
      {story.thumb && (
        <div className="w-full border-b-2 border-ink">
          <img src={story.thumb} alt={story.title} className="w-full max-h-[500px] object-cover" />
        </div>
      )}

      {/* Article body */}
      <div className="bg-paper w-full">
        <div className="max-w-[760px] mx-auto px-6 py-10 font-georgia text-[17px] text-ink leading-[1.8]
                         prose prose-headings:font-archivo prose-headings:tracking-tight">
          {story.body
            ? <PortableText value={story.body} />
            : <p className="text-[#999]">Body content coming soon.</p>
          }
        </div>
      </div>
    </main>
  )
}
