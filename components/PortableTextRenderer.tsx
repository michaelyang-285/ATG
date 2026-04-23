import { PortableText, type PortableTextComponents } from '@portabletext/react'

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
  },
}

export default function PortableTextRenderer({ value }: { value: any[] }) {
  return <PortableText value={value} components={components} />
}
