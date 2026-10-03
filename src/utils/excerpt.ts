import MarkdownIt from 'markdown-it'
import { parse as htmlParser } from 'node-html-parser'

const markdownParser = new MarkdownIt({ html: true, typographer: true })

// Search engines show ~155 characters of a description
const MAX_LENGTH = 155

// A line of verse is short; prose with hard breaks is not
const VERSE_LINE = 40

function splitLines(html: string): string[] {
  return html
    .split(/<br\s*\/?>/)
    .map((part) => htmlParser(part).textContent.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

/**
 * Plain-text excerpt of a post: its opening words, used as the page description
 * @param body - Raw Markdown/MDX body of the post
 * @returns - Up to ~155 characters, cut at a word boundary, or '' if there is no text
 */
export function getExcerpt(body: string | undefined): string {
  if (!body) return ''

  const markdown = body
    // MDX: imports/exports and components (self-closing or with children) are not text
    .replace(/^(import|export)\s.*$/gm, '')
    .replace(/<([A-Z]\w*)[\s\S]*?(\/>|<\/\1>)/g, '')
    // Footnote definitions and references
    .replace(/^\[\^[^\]]+\]:.*$/gm, '')
    .replace(/\[\^[^\]]+\]/g, '')
    // Images say nothing as text; their alt is a caption, not the opening
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')

  // Verse keeps its shape on one line, as poetry is quoted: ' / ' between lines and
  // ' // ' between stanzas. A paragraph is verse when it has 3+ lines, all short; the
  // hard breaks in prose (long sentences) just run on.
  const blocks = htmlParser(markdownParser.render(markdown))
    .childNodes.map((node) => {
      const lines = splitLines(node.toString())
      const isVerse = lines.length >= 3 && lines.every((line) => line.length <= VERSE_LINE)
      return { text: lines.join(isVerse ? ' / ' : ' '), isVerse }
    })
    .filter((block) => block.text)

  const text = blocks
    .map(
      (block, i) =>
        (i > 0 ? (block.isVerse && blocks[i - 1].isVerse ? ' // ' : ' ') : '') + block.text
    )
    .join('')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= MAX_LENGTH) return text

  const cut = text.slice(0, MAX_LENGTH)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : MAX_LENGTH).replace(/[\s,;:.—–-]+$/, '')}…`
}
