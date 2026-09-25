/**
 * utils/media.ts
 * Global helper functions for media type detection across the application
 */

export function isVideoItem(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false
  const lower = url.toLowerCase().trim()
  return (
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.mov') ||
    lower.endsWith('.mkv') ||
    lower.endsWith('.avi') ||
    lower.startsWith('data:video/') ||
    lower.includes('/video')
  )
}
