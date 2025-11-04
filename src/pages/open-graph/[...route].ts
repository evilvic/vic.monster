import { getCollection } from 'astro:content'
import { OGImageRoute } from 'astro-og-canvas'
import { themeConfig } from '../../config'
import { getSlugFromId } from '@/utils/slug'

const collectionEntries = await getCollection('posts')

// Map the array of content collection entries to create an object.
// Converts [{ id: '251004_post.md', data: { title: 'Example', pubDate: Date } }]
// to { 'post': { title: 'Example', pubDate: Date } }
const pages = Object.fromEntries(
  collectionEntries.map(({ id, data }) => [getSlugFromId(id), data])
)

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'route',
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: themeConfig.site.title,
    logo: {
      path: 'public/og/og-logo.png',
      size: [80, 80]
    },
    bgGradient: [[255, 255, 255]],
    bgImage: {
      path: 'public/og/og-bg.png',
      fit: 'fill'
    },
    padding: 64,
    font: {
      title: {
        color: [28, 28, 28],
        size: 68,
        weight: 'SemiBold',
        families: ['Urbanist']
      },
      description: {
        color: [180, 180, 180],
        size: 40,
        weight: 'Medium',
        families: ['Urbanist']
      }
    },
    fonts: [
      'https://fonts.bunny.net/css?family=urbanist:400,500,600,700'
    ]
  })
})
