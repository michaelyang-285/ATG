import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PortableTextRenderer from '@/components/PortableTextRenderer'
import StoryTag from '@/components/StoryTag'
import { client } from '@/lib/sanity'
import { slugHref } from '@/lib/slugHref'
import InlineNewsletter from '@/components/InlineNewsletter'

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
      `*[_type == "story" && slug.current == $slug][0]{ title, deck, seoTitle, seoDescription, ogTitle, ogDescription }`,
      { slug: params.slug }
    )
    const metaTitle = story?.seoTitle || story?.title || 'Story'
    const metaDescription = story?.seoDescription || story?.deck || 'Story — All Things Gwinnett'
    const ogTitle = story?.ogTitle || metaTitle
    const ogDescription = story?.ogDescription || metaDescription
    return {
      title: `${metaTitle} — All Things Gwinnett`,
      description: metaDescription,
      openGraph: {
        title: ogTitle,
        description: ogDescription,
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
      photoCredit,
      "authorProfile": authorProfile->{
        firstName, lastName, bio, businessName,
        website, instagram, facebook, linkedin, x,
        "profileImage": profileImage.asset->url
      },
      body[]{
        ...,
        _type == "image" => {
          ...,
          "imageUrl": asset->url
        }
      },
      "relatedStories": relatedStories[]->{
        title,
        slug,
        publishedAt,
        "thumb": thumbnail.asset->url,
        "category": category->{ name, color }
      }
    }`,
    { slug }
  )
}

function splitBodyAt(value: any[] = [], ratio = 0.6) {
  if (!Array.isArray(value) || value.length === 0) return [[], []] as const
  const midpoint = Math.max(1, Math.floor(value.length * ratio))
  return [value.slice(0, midpoint), value.slice(midpoint)] as const
}

export default async function StoryPage({ params }: { params: { slug: string } }) {
  const story = await getStory(params.slug)
  if (!story) notFound()
  const fullName = [story?.authorProfile?.firstName, story?.authorProfile?.lastName].filter(Boolean).join(' ')
  const displayAuthor = fullName || story.author || 'ATG Staff'
  const [bodyTop, bodyBottom] = splitBodyAt(story.body || [], 0.62)
  const canonicalUrl = `https://allthingsgwinnett.com/stories/${params.slug}`

  return (
    <main className="w-full bg-paper">
      <div className="border-b-2 border-ink">
        <div className="max-w-[1100px] mx-auto px-6 py-8 md:py-10">
          <StoryTag color={story.category?.color} name={story.category?.name ?? ''} />
          <h1 className="font-archivo text-[38px] md:text-[52px] leading-[1.02] tracking-[-1px] text-ink mt-3 mb-4 max-w-[900px]">
            {story.title}
          </h1>
          <p className="font-georgia text-[18px] md:text-[20px] text-[#4a4a4a] leading-relaxed italic border-l-4 border-orange pl-4 max-w-[860px]">
            {story.deck}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2 md:gap-3 font-inter text-[11px] text-[#888]">
            <span className="text-ink">{displayAuthor}</span>
            <span>·</span>
            <span>{story.location || 'Gwinnett County, GA'}</span>
            <span>·</span>
            <span>{story.readTime ?? 5} min read</span>
            {story.publishedAt && (
              <>
                <span>·</span>
                <span>
                  {new Date(story.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {story.thumb && (
        <div className="border-b-2 border-ink bg-card">
          <div className="max-w-[1200px] mx-auto">
            <img
              src={story.thumb}
              alt={story.title}
              className="w-full h-[280px] sm:h-[360px] md:h-[520px] object-cover"
            />
            {story.photoCredit && (
              <p className="px-4 py-2 font-inter text-[10px] text-ink/60 border-t-2 border-ink">
                Photo: {story.photoCredit}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="w-full">
        <div className="max-w-[760px] mx-auto px-6 pt-10 pb-12 md:pt-14 md:pb-14 text-ink">
          {story.body && story.body.length > 0
            ? (
              <>
                <PortableTextRenderer value={bodyTop} />
                {bodyBottom.length > 0 && (
                  <InlineNewsletter />
                )}
                <PortableTextRenderer value={bodyBottom} />
                <div role="separator" aria-label="End of article" className="mt-14 flex items-center justify-center">
                  <span className="flex-1 border-t-2 border-ink" />
                  <span className="mx-4 font-archivo text-[14px] tracking-[2px] text-ink">ATG</span>
                  <span className="flex-1 border-t-2 border-ink" />
                </div>
              </>
            )
            : <p className="text-[#8d8d8d]">Body content coming soon.</p>
          }
        </div>
      </div>

      {story.authorProfile && (
        <section className="w-full border-t-2 border-ink">
          <div className="max-w-[760px] mx-auto px-6 py-8">
            <div className="border-2 border-ink bg-card shadow-brutalist p-5">
              <div className="flex gap-4 items-start">
                <AuthorHeadshot name={displayAuthor} imageUrl={story.authorProfile.profileImage} size={72} />
                <div className="flex-1">
                  <p className="font-inter text-[9px] font-bold uppercase tracking-[1.2px] text-ink/60">Written by</p>
                  <p className="font-archivo text-[24px] tracking-[-0.5px] text-ink leading-none mt-1">{displayAuthor}</p>
                  {story.authorProfile.businessName && (
                    <p className="font-inter text-[11px] text-ink/60 mt-2">{story.authorProfile.businessName}</p>
                  )}
                </div>
              </div>
              {story.authorProfile.bio && (
                <p className="font-georgia text-[15px] leading-relaxed text-[#444] mt-4">{story.authorProfile.bio}</p>
              )}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-ink/10">
                <AuthorSocialLinks profile={story.authorProfile} />
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/stories"
                className="font-inter text-[10px] font-bold uppercase tracking-[0.8px] text-ink hover:text-orange no-underline"
              >
                ← All stories
              </Link>
              <ShareRow title={story.title} url={canonicalUrl} />
            </div>
          </div>
        </section>
      )}

      {Array.isArray(story.relatedStories) && story.relatedStories.length > 0 && (
        <div className="w-full border-t-2 border-ink">
          <div className="max-w-[1100px] mx-auto px-6 py-8">
            <h2 className="font-archivo text-[24px] tracking-[-0.5px] text-ink mb-4">
              Related stories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {story.relatedStories.map((item: any) => {
                const h = slugHref(item?.slug)
                if (!h) return null
                return (
                  <Link
                    key={h}
                    href={`/stories/${h}`}
                    className="block border-2 border-ink no-underline hover:bg-card transition-colors group overflow-hidden"
                  >
                    <div className="h-[150px] bg-card border-b-2 border-ink flex items-center justify-center">
                      {item?.thumb
                        ? <img src={item.thumb} alt={item.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                        : <span className="font-inter text-[10px] text-ink/35">photo</span>}
                    </div>
                    <div className="p-4">
                      <StoryTag color={item?.category?.color ?? ''} name={item?.category?.name ?? ''} />
                      <p className="mt-2 font-space text-[17px] font-bold text-ink leading-tight group-hover:underline underline-offset-2">
                        {item?.title}
                      </p>
                      {item?.publishedAt && (
                        <p className="mt-2 font-inter text-[10px] text-ink/50">
                          {new Date(item.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function AuthorHeadshot({ name, imageUrl, size = 56 }: { name: string; imageUrl?: string; size?: number }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="object-cover border-2 border-ink shadow-brutalist-sm bg-paper flex-shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      aria-label={name}
      className="flex items-center justify-center border-2 border-ink bg-yellow shadow-brutalist-sm font-archivo tracking-[-0.5px] text-ink flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.3 }}
    >
      {name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')}
    </div>
  )
}

function AuthorSocialLinks({ profile }: { profile: any }) {
  const socials = [
    profile?.website ? { label: 'Website', href: profile.website } : null,
    profile?.instagram ? { label: 'Instagram', href: profile.instagram } : null,
    profile?.facebook ? { label: 'Facebook', href: profile.facebook } : null,
    profile?.linkedin ? { label: 'LinkedIn', href: profile.linkedin } : null,
    profile?.x ? { label: 'X', href: profile.x } : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>

  if (socials.length === 0) return <span />

  return (
    <div className="flex flex-wrap items-center gap-2">
      {socials.map((s) => (
        <a
          key={`${s.label}-${s.href}`}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 px-3 items-center justify-center border-2 border-ink bg-paper text-ink shadow-brutalist-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-yellow transition-all font-inter text-[10px] font-bold uppercase tracking-[0.8px] no-underline"
        >
          {s.label}
        </a>
      ))}
    </div>
  )
}

function ShareRow({ title, url }: { title: string; url: string }) {
  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(url)
  const iconCls = 'inline-flex h-9 w-9 items-center justify-center border-2 border-ink bg-paper text-ink shadow-brutalist-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-yellow transition-all'
  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 font-inter text-[9px] font-bold uppercase tracking-[1.2px] text-ink/60">
        Share
      </span>
      <a
        className={iconCls}
        aria-label="Share on X"
        href={`https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        X
      </a>
      <a
        className={iconCls}
        aria-label="Share on Facebook"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        f
      </a>
    </div>
  )
}
