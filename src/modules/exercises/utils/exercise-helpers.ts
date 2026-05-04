/**
 * Exercise Helpers - Utility functions for exercise management
 *
 * Provides slug generation and string similarity functions
 * for duplicate detection and URL-friendly identifiers.
 */

// =============================================================================
// SLUG GENERATION
// =============================================================================

/**
 * Convert a name to a URL-friendly slug
 * - Converts to lowercase
 * - Normalizes unicode characters (removes accents)
 * - Replaces non-alphanumeric characters with hyphens
 * - Removes leading/trailing hyphens
 *
 * @param name - The name to convert to a slug
 * @returns URL-friendly slug
 */
export function generateSlug(name: string): string {
  return (
    name
      // Convert to lowercase
      .toLowerCase()
      // Normalize unicode characters - decomposes accented characters
      // and removes diacritical marks (accents)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Replace non-alphanumeric characters (except spaces and hyphens) with hyphens
      .replace(/[^a-z0-9\s-]/g, '')
      // Replace spaces and multiple hyphens with single hyphen
      .replace(/[\s-]+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-|-$/g, '')
  )
}

// =============================================================================
// STRING SIMILARITY
// =============================================================================

/**
 * Calculate the Levenshtein distance between two strings
 * This is the minimum number of single-character edits needed
 * to change one string into another.
 *
 * @param s1 - First string
 * @param s2 - Second string
 * @returns Number of edits required (lower = more similar)
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length
  const n = s2.length

  // Create a matrix to store distances
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  // Initialize base cases
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i // Delete all characters to match empty string
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j // Insert all characters to match target
  }

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        // Characters match, no edit needed
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        // Characters differ, take minimum of insert/delete/substitute
        dp[i][j] =
          1 +
          Math.min(
            dp[i - 1][j], // Delete
            dp[i][j - 1], // Insert
            dp[i - 1][j - 1] // Substitute
          )
      }
    }
  }

  return dp[m][n]
}

/**
 * Calculate similarity between two strings as a score from 0 to 1
 * Uses Levenshtein distance normalized by the longer string length.
 *
 * @param s1 - First string
 * @param s2 - Second string
 * @returns Similarity score from 0 (completely different) to 1 (identical)
 */
export function calculateSimilarity(s1: string, s2: string): number {
  // Handle empty strings
  if (!s1 || !s2) {
    return 0
  }

  // Normalize strings for comparison
  const normalizedS1 = s1.toLowerCase().trim()
  const normalizedS2 = s2.toLowerCase().trim()

  // Exact match
  if (normalizedS1 === normalizedS2) {
    return 1
  }

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(normalizedS1, normalizedS2)

  // Normalize by the longer string length
  const maxLength = Math.max(normalizedS1.length, normalizedS2.length)

  // Return similarity score (1 - normalized distance)
  return 1 - distance / maxLength
}

// =============================================================================
// ADDITIONAL HELPERS
// =============================================================================

/**
 * Check if a slug is unique within a given set of existing slugs
 *
 * @param baseSlug - The base slug to check
 * @param existingSlugs - Array of existing slugs to compare against
 * @returns Unique slug (appends -1, -2, etc. if needed)
 */
export function ensureUniqueSlug(
  baseSlug: string,
  existingSlugs: string[]
): string {
  const normalizedExisting = new Set(existingSlugs.map((s) => s.toLowerCase()))

  if (!normalizedExisting.has(baseSlug)) {
    return baseSlug
  }

  // Try appending numbers until we find a unique slug
  let counter = 1
  let newSlug = `${baseSlug}-${counter}`

  while (normalizedExisting.has(newSlug)) {
    counter++
    newSlug = `${baseSlug}-${counter}`
  }

  return newSlug
}

/**
 * Strip parenthetical English terms from exercise names
 * e.g. "Curl de bíceps (Bicep Curl)" → "Curl de bíceps"
 *
 * @param name - The exercise name possibly containing parentheticals
 * @returns Name with parenthetical content removed
 */
export function stripParenthetical(name: string): string {
  return name.replace(/\s*\(.*?\)\s*/g, '').trim()
}

/**
 * Normalize exercise name for comparison
 * - Converts to lowercase
 * - Removes extra whitespace
 * - Removes common variations/typos
 *
 * @param name - The exercise name to normalize
 * @returns Normalized name
 */
export function normalizeExerciseName(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      // Replace multiple spaces with single space
      .replace(/\s+/g, ' ')
      // Remove common word variations (these are often typos or regional differences)
      .replace(/\b(de|del|el|la|las|los)\b/g, '')
      .trim()
  )
}
