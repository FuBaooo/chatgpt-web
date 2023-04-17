import { get_encoding } from '@dqbd/tiktoken'

const encoding = get_encoding('cl100k_base')

export function computedUsages(text: string) {
  return encoding.encode(text.replace(/<\|endoftext\|>/g, '')).length
}
