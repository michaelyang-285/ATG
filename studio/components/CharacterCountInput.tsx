import { Stack, Text } from '@sanity/ui'
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

  return (
    <Stack space={2}>
      {props.renderDefault(props)}
      <Text size={1} align="right" tone={tone}>
        {count}
        {typeof maxLength === 'number' ? `/${maxLength}` : ''} characters
        {recommendedRange ? ` · recommended ${recommendedRange}` : ''}
      </Text>
    </Stack>
  )
}
