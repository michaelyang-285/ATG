export default function Ticker({ items = [] }: { items: string[] }) {
  const display = items.length > 0 ? items : [
    'Pleasant Hill groundbreaking: April 18',
    'New birria spot in Norcross — 45-min wait',
    'I-85 closures start Monday near Hamilton Mill',
    'Suwanee concerts return April 19 · Free',
  ]
  // Duplicate for seamless infinite loop
  const doubled = [...display, ...display]

  return (
    /* Full-bleed yellow bar */
    <div className="bg-yellow border-b-2 border-ink h-[34px] flex items-center overflow-hidden w-full">
      {/* Contained inner — badge stays aligned with content */}
      <div className="max-w-[1200px] mx-auto px-0 sm:px-6 flex items-center w-full">
        <div className="flex items-center gap-[5px] bg-ink text-yellow font-archivo text-[9px]
                        px-3 py-1 tracking-[1.5px] whitespace-nowrap flex-shrink-0
                        leading-none border-r-2 border-ink">
          <span className="w-[5px] h-[5px] bg-yellow animate-pulse" />
          Right now
        </div>
        {/* Scroll wrapper — overflow hidden, starts after badge */}
        <div className="flex-1 overflow-hidden pl-4">
          <div className="flex items-center whitespace-nowrap animate-ticker">
            {doubled.map((item, i) => (
              <span key={i} className="flex items-center">
                <span className="font-inter text-[11px] font-semibold text-ink px-5 leading-none">
                  {item}
                </span>
                <span className="text-ink/25 leading-none">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
