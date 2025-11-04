import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const posts = defineCollection({
  // Load Markdown and MDX files in the `src/content/posts/` directory.
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  // Type-check frontmatter using a schema
  schema: () =>
    z.object({
      title: z.string(),
      // Transform string or Date to Date object, parsing as local date in Mexico timezone (CST/CDT)
      pubDate: z.preprocess((val) => {
        // Handle both string and Date inputs
        if (val instanceof Date) {
          // If already a Date (from YAML parsing), YAML parses dates as UTC
          // Extract UTC components to avoid timezone issues
          const year = val.getUTCFullYear()
          const month = val.getUTCMonth() + 1
          const day = val.getUTCDate()
          // Create date at noon in local timezone to avoid timezone issues
          return new Date(year, month - 1, day, 12, 0, 0)
        }
        // If string, parse it
        const str = String(val)
        const [year, month, day] = str.split('-').map(Number)
        // Create date at noon in local timezone to avoid timezone issues
        return new Date(year, month - 1, day, 12, 0, 0)
      }, z.date()),
      image: z.string().optional()
    })
})

const about = defineCollection({
  // Load Markdown files in the `src/content/about/` directory.
  loader: glob({ base: './src/content/about', pattern: '**/*.md' }),
  // Type-check frontmatter using a schema
  schema: z.object({})
})

export const collections = { posts, about }
