// ATG location pin mark — single unified SVG shape
// fill and shadow color change based on surface

type PinVariant = 'paper' | 'dark' | 'orange' | 'yellow' | 'mid'

const variants: Record<PinVariant, { fill: string; shadow: string; text: string }> = {
  paper:  { fill: '#F2E93E', shadow: '#111111', text: '#111111' },
  dark:   { fill: '#FF6B35', shadow: '#7A2800', text: '#ffffff' },
  orange: { fill: '#ffffff', shadow: '#7A2800', text: '#FF6B35' },
  yellow: { fill: '#FF6B35', shadow: '#7A2800', text: '#ffffff' },
  mid:    { fill: '#FF6B35', shadow: '#6B1A00', text: '#ffffff' },
}

export default function ATGPin({
  variant = 'dark',
  size = 28,
}: {
  variant?: PinVariant
  size?: number
}) {
  const { fill, shadow, text } = variants[variant]
  const showBorder = variant === 'paper' || variant === 'yellow'

  return (
    <svg
      width={size}
      viewBox="-7 -7 78 98"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', overflow: 'visible', flexShrink: 0 }}
    >
      {/* shadow */}
      <polygon
        fill={shadow}
        points="0,0 64,0 64,52 42,52 32,80 22,52 0,52"
        transform="translate(5,5)"
      />
      {/* fill */}
      <polygon fill={fill} points="0,0 64,0 64,52 42,52 32,80 22,52 0,52" />
      {/* border — only on light surfaces */}
      {showBorder && (
        <polygon
          fill="none"
          stroke="#111111"
          strokeWidth="3"
          strokeLinejoin="miter"
          points="0,0 64,0 64,52 42,52 32,80 22,52 0,52"
        />
      )}
      {/* ATG text */}
      <text
        fill={text}
        x="32"
        y="30"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Archivo Black', sans-serif"
        fontSize="22"
        letterSpacing="-1"
      >
        ATG
      </text>
    </svg>
  )
}
