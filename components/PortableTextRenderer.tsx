import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Link from 'next/link'
import StoryTag from './StoryTag'

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="font-georgia text-[19px] leading-[1.9] text-ink mb-6">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="font-archivo text-[32px] leading-[1.15] tracking-[-0.5px] text-ink mt-10 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-archivo text-[25px] leading-[1.2] tracking-[-0.3px] text-ink mt-8 mb-3">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="font-georgia italic text-[24px] leading-[1.5] text-ink border-l-4 border-orange pl-5 my-8">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-7 my-6 space-y-3 marker:text-orange">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-7 my-6 space-y-3 marker:font-bold marker:text-ink">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="font-georgia text-[18px] leading-[1.85] text-ink">{children}</li>
    ),
    number: ({ children }) => (
      <li className="font-georgia text-[18px] leading-[1.85] text-ink">{children}</li>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold text-ink">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => {
      const href = value?.href || '#'
      const rel = href.startsWith('http') ? 'noreferrer noopener' : undefined
      return (
        <a href={href} rel={rel} target={href.startsWith('http') ? '_blank' : undefined}>
          {children}
        </a>
      )
    },
  },
  types: {
    image: ({ value }: any) => (
      <figure className="my-8">
        <img src={value?.imageUrl} alt={value?.alt || ''} className="w-full h-auto border-2 border-ink" />
        {value?.caption && (
          <figcaption className="mt-2 font-inter text-[11px] text-ink/60 text-center">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
    pullQuote: ({ value }: any) => (
      <blockquote className="my-10 border-l-4 border-orange pl-5 italic">
        <p className="font-archivo text-[28px] leading-[1.25] tracking-[-0.4px] text-ink m-0">
          "{value?.text}"
        </p>
        {value?.attribution && (
          <footer className="mt-3 font-inter text-[11px] not-italic text-ink/60">
            — {value.attribution}
          </footer>
        )}
      </blockquote>
    ),
    divider: ({ value }: any) => {
      const style = value?.style || 'rule'
      if (style === 'dots') {
        return (
          <div role="separator" aria-hidden className="my-10 flex justify-center gap-3 text-ink/40">
            <span className="inline-block h-2 w-2 rounded-full bg-current" />
            <span className="inline-block h-2 w-2 rounded-full bg-current" />
            <span className="inline-block h-2 w-2 rounded-full bg-current" />
          </div>
        )
      }
      if (style === 'atg') {
        return (
          <div role="separator" aria-hidden className="my-12 flex items-center justify-center">
            <span className="flex-1 border-t-2 border-ink" />
            <span className="mx-4 font-archivo text-[14px] tracking-[2px] text-ink">ATG</span>
            <span className="flex-1 border-t-2 border-ink" />
          </div>
        )
      }
      return <hr role="separator" className="my-10 border-0 border-t-2 border-ink" />
    },
    callout: ({ value }: any) => {
      const style = value?.style || 'note'
      const styleMap: Record<string, string> = {
        note: 'bg-card border-ink',
        takeaway: 'bg-yellow border-ink',
        ifYouGo: 'bg-orange text-white border-ink',
        warning: 'bg-paper border-dk-orange',
        editorsNote: 'bg-ink text-paper border-ink',
      }
      const cls = styleMap[style] || styleMap.note
      return (
        <aside className={`my-10 border-2 ${cls} shadow-brutalist-sm p-5`}>
          {value?.heading && (
            <p className="font-inter text-[9px] font-bold uppercase tracking-[1.2px] opacity-80 mb-2">
              {value.heading}
            </p>
          )}
          {Array.isArray(value?.body) && value.body.length > 0 ? (
            <PortableText value={value.body} components={{ block: { normal: ({ children }) => <p className="font-georgia text-[15px] leading-[1.7] mb-3 last:mb-0">{children}</p> } }} />
          ) : null}
        </aside>
      )
    },
    tldr: ({ value }: any) => {
      if (!Array.isArray(value?.points) || value.points.length === 0) return null
      return (
        <section className="my-8 border-2 border-ink bg-yellow shadow-brutalist-sm">
          <div className="border-b-2 border-ink px-4 py-2.5">
            <span className="font-archivo text-xs uppercase tracking-[1.6px] text-ink">
              {value?.heading || 'At a glance'}
            </span>
          </div>
          <ul className="p-5 space-y-3">
            {value.points.map((point: string, i: number) => (
              <li key={`${point}-${i}`} className="flex gap-3 font-inter text-[15px] leading-snug text-ink">
                <span className="font-archivo text-ink/40 flex-shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      )
    },
    faq: ({ value }: any) => {
      if (!Array.isArray(value?.items) || value.items.length === 0) return null
      return (
        <section className="my-12">
          <h2 className="font-archivo text-2xl uppercase tracking-tight text-ink mb-5">
            {value?.heading || 'Frequently asked'}
          </h2>
          <div className="border-2 border-ink bg-paper shadow-brutalist-sm divide-y-2 divide-ink">
            {value.items.map((item: any) => (
              <details key={item?._key || item?.question} className="group">
                <summary className="list-none px-5 py-4 cursor-pointer font-archivo text-[15px] uppercase tracking-wide text-ink hover:bg-card [&::-webkit-details-marker]:hidden">
                  {item?.question}
                </summary>
                <div className="px-5 pb-5 font-georgia text-[16px] leading-[1.7] text-ink/85 border-t-2 border-ink/10 pt-4">
                  <PortableText value={item?.answer || []} />
                </div>
              </details>
            ))}
          </div>
        </section>
      )
    },
    editorsNote: ({ value }: any) => (
      <aside className="my-8 border-2 border-ink bg-ink text-paper shadow-brutalist-sm p-5">
        <p className="font-inter text-[9px] font-bold uppercase tracking-[1.2px] text-yellow mb-2">
          {value?.title || "Editor's note"}
        </p>
        <p className="font-georgia text-[15px] leading-[1.7] text-paper/90">{value?.body}</p>
      </aside>
    ),
    correction: ({ value }: any) => (
      <aside className="my-8 border-2 border-dk-orange bg-paper shadow-brutalist-sm p-5">
        <p className="font-inter text-[9px] font-bold uppercase tracking-[1.2px] text-dk-orange mb-2">
          Correction
        </p>
        {value?.correctedAt && (
          <p className="font-inter text-[10px] text-ink/50 mb-2">
            Updated {new Date(value.correctedAt).toLocaleDateString('en-US')}
          </p>
        )}
        <p className="font-georgia text-[15px] leading-[1.7] text-ink/85">{value?.body}</p>
      </aside>
    ),
    videoEmbed: ({ value }: any) => {
      const embed = toEmbedUrl(value?.url)
      if (!embed) return null
      return (
        <figure className="my-10">
          <div className="relative aspect-video w-full border-2 border-ink shadow-brutalist-sm bg-ink overflow-hidden">
            <iframe
              src={embed}
              title={value?.caption || 'Embedded video'}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          {value?.caption && (
            <figcaption className="mt-3 font-inter text-[11px] uppercase tracking-[0.8px] text-ink/60">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
    socialEmbed: ({ value }: any) => {
      const platform = value?.platform ? String(value.platform).toUpperCase() : 'SOCIAL'
      return (
        <figure className="my-8">
          <div className="border-2 border-ink bg-card shadow-brutalist-sm p-5">
            <p className="font-inter text-[9px] font-bold uppercase tracking-[1.2px] text-orange">{platform}</p>
            {value?.authorName && (
              <p className="mt-1 font-archivo text-[15px] text-ink">
                {value.authorName}{value?.authorHandle ? ` · ${value.authorHandle}` : ''}
              </p>
            )}
            {value?.content && (
              <p className="mt-3 font-georgia text-[17px] leading-[1.6] text-ink whitespace-pre-wrap">
                {value.content}
              </p>
            )}
            {value?.mediaUrl && (
              <img src={value.mediaUrl} alt="Embedded social media content" className="mt-4 w-full border-2 border-ink" />
            )}
            {value?.url && (
              <a
                href={value.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block font-archivo uppercase tracking-wide text-ink hover:text-orange no-underline"
              >
                View post →
              </a>
            )}
          </div>
        </figure>
      )
    },
    mapEmbed: ({ value }: any) => {
      const src = buildMapSrc(value)
      if (!src) return null
      const title = value?.label || value?.address || value?.query || 'Map location'
      const directions = buildDirectionsHref(value)
      return (
        <figure className="my-10">
          <div className="border-2 border-ink shadow-brutalist-sm overflow-hidden bg-card">
            <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-ink px-4 py-2.5">
              <span className="font-archivo text-xs uppercase tracking-[1.2px] text-yellow truncate">{title}</span>
              {directions && (
                <a href={directions} target="_blank" rel="noopener noreferrer" className="font-archivo text-[10px] uppercase tracking-[1px] text-paper hover:text-yellow no-underline">
                  Directions →
                </a>
              )}
            </div>
            <div className="relative aspect-[16/10] bg-mid">
              <iframe
                src={src}
                title={title}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen
              />
            </div>
          </div>
          {(value?.caption || value?.address) && (
            <figcaption className="mt-3 font-inter text-xs text-ink/60 leading-snug">
              {value?.address || ''}{value?.caption ? ` · ${value.caption}` : ''}
            </figcaption>
          )}
        </figure>
      )
    },
    gallery: ({ value }: any) => {
      const images = value?.images || []
      if (!Array.isArray(images) || images.length === 0) return null
      const cols = Number(value?.columns || 2) === 3 ? 'grid grid-cols-2 sm:grid-cols-3 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'
      return (
        <figure className="my-10">
          <ul className={cols}>
            {images.map((img: any, i: number) => (
              <li key={img?._key || i} className="flex flex-col">
                <img src={img?.imageUrl} alt={img?.alt || ''} className="w-full aspect-square object-cover border-2 border-ink shadow-brutalist-sm bg-ink" />
                {(img?.caption || img?.credit) && (
                  <figcaption className="mt-2 font-inter text-[10px] uppercase tracking-[0.8px] text-ink/60 leading-snug">
                    {img?.caption || ''}{img?.credit ? ` · ${img.credit}` : ''}
                  </figcaption>
                )}
              </li>
            ))}
          </ul>
        </figure>
      )
    },
    relatedStoryRef: ({ value }: any) => {
      const s = value?.story
      const h = s?.slug?.current || s?.slug
      if (!h) return null
      return (
        <Link href={`/stories/${h}`} className="group my-8 flex gap-4 border-2 border-ink bg-card shadow-brutalist-sm p-3 no-underline text-ink hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
          {s?.thumb && (
            <img src={s.thumb} alt={s?.title || 'Related story'} className="h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 object-cover border-2 border-ink bg-ink" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-inter text-[9px] font-bold uppercase tracking-[1.2px] text-orange">
              Related · {s?.category?.name ?? 'ATG'}
            </p>
            <h4 className="font-archivo text-[16px] sm:text-[18px] leading-[1.15] tracking-[-0.3px] mt-1 group-hover:text-orange transition-colors">
              {s?.title}
            </h4>
            {s?.deck && (
              <p className="font-georgia text-[13px] text-[#444] leading-snug mt-2 line-clamp-2">
                {s.deck}
              </p>
            )}
          </div>
        </Link>
      )
    },
    businessRef: ({ value }: any) => {
      const b = value?.business
      const h = b?.slug?.current || b?.slug
      if (!h) return null
      return (
        <aside className="my-8 border-2 border-ink bg-paper shadow-brutalist-sm p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-ink text-yellow font-inter text-[9px] font-bold uppercase tracking-[1.2px] px-2 py-[3px]">
              {value?.label || 'The spot'}
            </span>
            {b?.businessType && (
              <span className="font-inter text-[10px] uppercase tracking-[0.8px] text-ink/60">
                · {b.businessType}
              </span>
            )}
          </div>
          <div className="flex gap-4">
            {b?.mainImage && (
              <img src={b.mainImage} alt={b?.name || 'Business'} className="h-20 w-20 flex-shrink-0 object-cover border-2 border-ink bg-ink" />
            )}
            <div className="flex-1 min-w-0">
              <Link href={`/businesses/${h}`} className="font-archivo text-[18px] tracking-[-0.3px] text-ink hover:text-orange no-underline">
                {b?.name}
              </Link>
              {(b?.address1 || b?.city) && (
                <p className="font-inter text-[12px] text-ink/60 mt-1">
                  {[b?.address1, b?.city, b?.state].filter(Boolean).join(', ')}
                </p>
              )}
              {b?.description && (
                <p className="font-georgia text-[14px] text-[#444] mt-2 leading-snug">
                  {b.description}
                </p>
              )}
            </div>
          </div>
        </aside>
      )
    },
    eventRef: ({ value }: any) => {
      const e = value?.event
      const h = e?.slug?.current || e?.slug
      if (!h) return null
      const d = e?.date ? new Date(e.date) : null
      return (
        <aside className="my-8 border-2 border-ink bg-yellow shadow-brutalist-sm p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-ink text-yellow font-inter text-[9px] font-bold uppercase tracking-[1.2px] px-2 py-[3px]">
              {value?.label || 'If you go'}
            </span>
          </div>
          <div className="flex gap-4">
            {d && (
              <div className="flex flex-col items-center justify-center bg-paper border-2 border-ink h-20 w-20 flex-shrink-0">
                <span className="font-inter text-[9px] font-bold uppercase tracking-[1.2px] text-ink/60">
                  {d.toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span className="font-archivo text-[28px] leading-none text-ink tracking-[-1px] mt-1">
                  {d.getDate()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <Link href={`/events/${h}`} className="font-archivo text-[18px] tracking-[-0.3px] text-ink hover:text-dk-orange no-underline">
                {e?.name}
              </Link>
              <p className="font-inter text-[12px] text-ink/80 mt-1">
                {[e?.location, e?.price].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
        </aside>
      )
    },
  },
}

export default function PortableTextRenderer({ value }: { value: readonly any[] }) {
  return <PortableText value={value} components={components} />
}

function toEmbedUrl(raw: string) {
  if (!raw) return null
  try {
    const u = new URL(raw)
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = u.searchParams.get('v')
      if (id) return `https://www.youtube.com/embed/${id}`
    }
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1)
      if (id) return `https://www.youtube.com/embed/${id}`
    }
    if (host === 'vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean)[0]
      if (id) return `https://player.vimeo.com/video/${id}`
    }
    return null
  } catch {
    return null
  }
}

function buildMapSrc(v: any) {
  const z = v?.zoom ?? 15
  if (typeof v?.lat === 'number' && typeof v?.lng === 'number') {
    return `https://www.google.com/maps?q=${v.lat},${v.lng}&z=${z}&output=embed`
  }
  const q = v?.query || v?.address
  if (!q) return null
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=${z}&output=embed`
}

function buildDirectionsHref(v: any) {
  if (typeof v?.lat === 'number' && typeof v?.lng === 'number') {
    return `https://www.google.com/maps?q=${v.lat},${v.lng}`
  }
  const q = v?.query || v?.address
  if (!q) return null
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}`
}
