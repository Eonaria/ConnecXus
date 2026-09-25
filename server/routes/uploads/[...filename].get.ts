import { join } from 'path'
import { createReadStream, existsSync } from 'fs'
import { sendStream, createError, setResponseHeader } from 'h3'

export default defineEventHandler((event) => {
  const filename = getRouterParam(event, 'filename')
  
  // Prevent directory traversal attacks
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  }

  // Point to the root project's public/uploads directory
  const filePath = join(process.cwd(), 'public', 'uploads', filename)

  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'File Not Found' })
  }

  // Set appropriate content type
  const ext = filename.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml'
  }
  const contentType = mimeTypes[ext || ''] || 'application/octet-stream'
  
  setResponseHeader(event, 'Content-Type', contentType)
  // Cache the image for 1 year since filenames are unique (timestamps)
  setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

  // Stream the file back to the client
  return sendStream(event, createReadStream(filePath))
})
