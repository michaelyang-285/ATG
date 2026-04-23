import type { StringInputProps, TextInputProps } from 'sanity'

type CharacterCountOptions = {
  maxLength?: number
  recommendedRange?: string
}

type CharacterCountProps = (StringInputProps | TextInputProps) & {
  schemaType?: {
    options?: CharacterCountOptions
  }
}

export function CharacterCountInput(props: CharacterCountProps) {
  const value = typeof props.value === 'string' ? props.value : ''
  const count = value.length
  const maxLength = props.schemaType?.options?.maxLength
  const recommendedRange = props.schemaType?.options?.recommendedRange

  const overLimit = typeof maxLength === 'number' && count > maxLength
  const tone = overLimit ? 'critical' : 'default'

  const color = tone === 'critical' ? '#d14343' : '#6b7280'

  return (
    <div>
      {props.renderDefault(props)}
      <div
        style={{
          marginTop: 6,
          textAlign: 'right',
          fontSize: 12,
          color,
          lineHeight: 1.4,
        }}
      >
        {count}
        {typeof maxLength === 'number' ? `/${maxLength}` : ''} characters
        {recommendedRange ? ` · recommended ${recommendedRange}` : ''}
      </div>
    </div>
  )
}
