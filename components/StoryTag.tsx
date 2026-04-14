// Maps Sanity category.color to Tailwind classes
const colorMap: Record<string, string> = {
  orange:  'bg-orange text-white',
  yellow:  'bg-yellow text-ink',
  ink:     'bg-ink text-paper',
  mid:     'bg-mid text-yellow',
  outline: 'border-2 border-ink text-ink bg-transparent',
}

export default function StoryTag({ color = 'outline', name }: { color?: string; name: string }) {
  return (
    <span className={`story-tag ${colorMap[color] ?? colorMap.outline}`}>
      {name}
    </span>
  )
}
