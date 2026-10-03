import type { CollectionEntry } from 'astro:content'
import type { ImageMetadata } from 'astro'
import { getImage } from 'astro:assets'
import { statSync } from 'node:fs'
import path from 'node:path'

const imagesGlob = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/posts/_assets/**/*.{jpeg,jpg,png,gif,webp}'
)

// WhatsApp is said to drop preview images past ~300 KB
const OG_MAX_BYTES = 300 * 1024

function resolveLocalImageKey(postId: string, src: string): string | null {
  const postDir = path.posix.dirname(postId)

  if (src.startsWith('./')) {
    return path.posix.join('/src/content/posts', postDir, src.slice(2))
  }

  if (src.startsWith('../')) {
    return path.posix.resolve('/src/content/posts', postDir, src)
  }

  // If someone passes a full key, accept it.
  if (src.startsWith('/src/content/posts/')) {
    return src
  }

  return null
}

async function loadPostImage(post: CollectionEntry<'posts'>) {
  const rawSrc = post.data.image
  if (!rawSrc) return null

  const key = resolveLocalImageKey(post.id, rawSrc)
  if (!key) return null

  const loader = imagesGlob[key]
  if (!loader) return null

  const mod = await loader()
  return { key, image: mod.default }
}

/**
 * Optimize the post's own image (frontmatter `image`)
 * @param post - Post entry
 * @param options - Output format and width
 * @returns - The optimized image, or null if the post has no local image
 */
export async function getPostImage(
  post: CollectionEntry<'posts'>,
  options: { format: 'webp'; width: number }
) {
  const found = await loadPostImage(post)
  if (!found) return null
  return getImage({ src: found.image, ...options })
}

/**
 * The image to share a post with (og:image), or null if the post has no local image.
 * The original file when it is light enough: the dithered PNGs weigh 40–200 KB and
 * resizing only blurs the dither (and makes them heavier). A 600 px JPEG otherwise,
 * which suits the heavy ones (full-color photos).
 * @param post - Post entry
 * @returns - Image URL (relative to the site)
 */
export async function getPostOgImage(post: CollectionEntry<'posts'>) {
  const found = await loadPostImage(post)
  if (!found) return null

  if (statSync(path.join(process.cwd(), found.key)).size <= OG_MAX_BYTES) {
    return found.image.src
  }

  const resized = await getImage({ src: found.image, format: 'jpg', width: 600, quality: 65 })
  return resized.src
}
