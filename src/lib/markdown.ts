export interface ParsedMarkdown<T = Record<string, unknown>> {
  data: T
  content: string
}

/**
 * Parses Markdown files that embed JSON front matter between --- fences.
 * Example:
 * ---
 * {"title": "Example"}
 * ---
 * # Heading
 */
export const parseMarkdownWithJsonFrontMatter = <T = Record<string, unknown>>(raw: string): ParsedMarkdown<T> => {
  const normalized = raw.replace(/\r\n/g, '\n')
  if (!normalized.startsWith('---')) {
    return { data: {} as T, content: normalized.trim() }
  }

  const closingIndex = normalized.indexOf('\n---', 3)
  if (closingIndex === -1) {
    throw new Error('Unable to locate closing front matter fence (---) in markdown file.')
  }

  const frontMatterBlock = normalized.slice(3, closingIndex).trim()
  let data: T
  try {
    data = JSON.parse(frontMatterBlock) as T
  } catch {
    throw new Error(`Failed to parse JSON front matter. Content received: ${frontMatterBlock}`)
  }

  const contentStart = closingIndex + 4
  const content = normalized.slice(contentStart).replace(/^\s+/, '')

  return { data, content }
}

export const calculateReadTimeMinutes = (markdown: string, wordsPerMinute = 200): number => {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/[#>*_~-]/g, ' ')
  const words = text.match(/\b\w+\b/g)
  const wordCount = words ? words.length : 0
  return Math.max(3, Math.ceil(wordCount / wordsPerMinute))
}

export const deriveExcerpt = (markdown: string, sentences = 2): string => {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[#>*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!plain) return ''

  const sentenceParts = plain.split(/(?<=[.!?])\s+/)
  return sentenceParts.slice(0, sentences).join(' ').trim()
}
