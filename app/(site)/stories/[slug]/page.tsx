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
  const story = await client.fetch(
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
        },
        _type == "gallery" => {
          ...,
          "images": images[]{
            ...,
            "imageUrl": asset->url
          }
        },
        _type == "relatedStoryRef" => {
          ...,
          "story": story->{
            title,
            deck,
            slug,
            "thumb": thumbnail.asset->url,
            "category": category->{ name, color }
          }
        },
        _type == "businessRef" => {
          ...,
          "business": business->{
            name,
            businessType,
            description,
            slug,
            "mainImage": mainImage.asset->url,
            address1, city, state
          }
        },
        _type == "eventRef" => {
          ...,
          "event": event->{
            name,
            date,
            location,
            price,
            slug
          }
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

  if (!story) return null

  // Legacy stories may have only the plain author string. In that case,
  // look up the profile by first/last name so both byline sections stay in sync.
  if (!story.authorProfile && typeof story.author === 'string' && story.author.trim()) {
    const parts = story.author.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      const firstName = parts[0]
      const lastName = parts[parts.length - 1]
      const fallbackProfile = await client.fetch(
        `*[_type == "authorProfile" && firstName == $firstName && lastName == $lastName][0]{
          firstName, lastName, bio, businessName,
          website, instagram, facebook, linkedin, x,
          "profileImage": profileImage.asset->url
        }`,
        { firstName, lastName }
      )
      if (fallbackProfile) {
        story.authorProfile = fallbackProfile
      }
    }
  }

  return story
}

function splitBodyAt(value: readonly any[] = [], ratio = 0.6): [readonly any[], readonly any[]] {
  if (!Array.isArray(value) || value.length === 0) return [[], []]
  const midpoint = Math.max(1, Math.floor(value.length * ratio))
  return [value.slice(0, midpoint), value.slice(midpoint)]
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
      <header className="w-full">
        <div className="max-w-[760px] mx-auto px-6 pt-10 pb-6">
          {story.category?.name ? (
            <StoryTag color={story.category?.color} name={story.category.name} />
          ) : null}
          <h1 className="font-archivo text-[40px] leading-[1.05] text-ink tracking-[-1px] mt-3 mb-4">
            {story.title}
          </h1>
          <p className="font-georgia text-[18px] text-[#444] leading-relaxed mb-6 pl-4 border-l-4 border-orange">
            {story.deck}
          </p>

          <div className="flex items-start gap-4 pt-5 border-t-2 border-ink/10">
            <AuthorHeadshot
              name={displayAuthor}
              imageUrl={story.authorProfile?.profileImage}
            />
            <div className="flex-1 min-w-0">
              <p className="font-inter text-[9px] font-bold uppercase tracking-[1.2px] text-ink/60">
                By
              </p>
              <p className="font-archivo text-[16px] tracking-[-0.3px] text-ink">
                {displayAuthor}
              </p>
              {story.authorProfile?.businessName ? (
                <p className="font-inter text-[11px] text-ink/60 leading-tight mt-[1px]">
                  {story.authorProfile.businessName}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-[2px] mt-2 font-inter text-[11px] text-ink/50">
                {story.location ? (
                  <span>Reporting from {story.location}</span>
                ) : null}
                {story.location ? <span aria-hidden>·</span> : null}
                {story.publishedAt ? (
                  <time dateTime={story.publishedAt}>
                    {new Date(story.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                ) : null}
                {story.readTime ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>{story.readTime} min read</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full">
        <div className="max-w-[760px] mx-auto px-6 pt-10 pb-12 md:pt-14 md:pb-14 text-ink">
          {story.thumb && (
            <figure className="mb-10">
              <div className="relative aspect-[16/10] w-full overflow-hidden border-2 border-ink shadow-brutalist-sm bg-ink">
                <img
                  src={story.thumb}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {(story.photoCredit) && (
                <figcaption className="mt-3 font-inter text-[11px] uppercase tracking-[0.8px] text-ink/60">
                  {story.photoCredit}
                </figcaption>
              )}
            </figure>
          )}

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

      <section className="w-full">
        <div className="max-w-[760px] mx-auto px-6 py-8">
          <div className="border-2 border-ink bg-card shadow-brutalist p-5 sm:p-6">
            <div className="flex gap-4 items-start">
              <AuthorHeadshot
                name={displayAuthor}
                imageUrl={story.authorProfile?.profileImage}
                size={72}
              />
              <div className="flex-1">
                <p className="font-inter text-[9px] font-bold uppercase tracking-[1.2px] text-ink/60">Written by</p>
                <p className="font-archivo text-[24px] tracking-[-0.5px] text-ink leading-none mt-1">{displayAuthor}</p>
                {story.authorProfile?.businessName && (
                  <p className="font-inter text-[11px] text-ink/60 mt-2">{story.authorProfile.businessName}</p>
                )}
              </div>
            </div>
            {story.authorProfile?.bio && (
              <p className="font-georgia text-[15px] leading-relaxed text-[#444] mt-5">{story.authorProfile.bio}</p>
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

      {Array.isArray(story.relatedStories) && story.relatedStories.length > 0 && (
        <section aria-labelledby="related-heading" className="w-full border-t-2 border-ink">
          <div className="max-w-[1200px] mx-auto px-6 py-12">
            <div className="flex items-end justify-between gap-4 mb-6">
              <h2 id="related-heading" className="font-archivo text-[26px] sm:text-[32px] leading-[1.05] tracking-[-0.8px] text-ink">
                Keep reading
              </h2>
              <Link href="/stories" className="font-inter text-[10px] font-bold uppercase tracking-[0.8px] text-ink hover:text-orange no-underline">
                All stories →
              </Link>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {story.relatedStories.map((item: any) => {
                const h = slugHref(item?.slug)
                if (!h) return null
                return (
                  <Link
                    key={h}
                    href={`/stories/${h}`}
                    className="group block no-underline text-ink"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden border-2 border-ink shadow-brutalist-sm bg-ink">
                      {item?.thumb
                        ? <img src={item.thumb} alt={item.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                        : <span className="font-inter text-[10px] text-ink/35">photo</span>}
                    </div>
                    <div className="mt-4">
                      <StoryTag color={item?.category?.color ?? ''} name={item?.category?.name ?? ''} />
                      <p className="font-archivo text-[18px] leading-[1.2] tracking-[-0.3px] text-ink group-hover:text-orange transition-colors">
                        {item?.title}
                      </p>
                      {item?.publishedAt && (
                        <p className="font-inter text-[10px] uppercase tracking-[0.8px] text-ink/50 mt-2">
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
        </section>
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
    profile?.website ? { label: 'Website', href: normalizeExternalHref(profile.website) } : null,
    profile?.instagram ? { label: 'Instagram', href: normalizeExternalHref(profile.instagram) } : null,
    profile?.facebook ? { label: 'Facebook', href: normalizeExternalHref(profile.facebook) } : null,
    profile?.linkedin ? { label: 'LinkedIn', href: normalizeExternalHref(profile.linkedin) } : null,
    profile?.x ? { label: 'X', href: normalizeExternalHref(profile.x) } : null,
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

function normalizeExternalHref(value: string) {
  const raw = String(value || '').trim()
  if (!raw) return '#'
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(raw) || raw.startsWith('//')) return raw
  return `https://${raw}`
}
