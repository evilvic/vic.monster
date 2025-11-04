/**
 * Extract slug from post ID by removing date prefix (YYMMDD_) and file extension
 * @param id - Post ID (e.g., "251004_arreglalo.md" or "arreglalo.md")
 * @returns - Slug without date prefix and extension (e.g., "arreglalo")
 */
export function getSlugFromId(id: string): string {
  // Remove file extension (.md, .mdx, etc.)
  const withoutExt = id.replace(/\.[^/.]+$/, '')
  
  // Remove date prefix if present (YYMMDD_)
  // Matches 6 digits followed by underscore at the start
  const slug = withoutExt.replace(/^\d{6}_/, '')
  
  return slug
}

