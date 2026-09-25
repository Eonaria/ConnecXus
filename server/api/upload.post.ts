import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const formData = await readMultipartFormData(event)
  
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, message: 'ไม่พบไฟล์' })
  }

  const uploadedFiles = []
  
  // Ensure public/uploads exists
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  try {
    mkdirSync(uploadDir, { recursive: true })
  } catch {}

  for (const field of formData) {
    if (field.filename && field.data) {
      // Create a unique filename
      const ext = field.filename.split('.').pop() || 'png'
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 10000)}.${ext}`
      const filePath = join(uploadDir, uniqueName)
      
      writeFileSync(filePath, field.data)
      
      uploadedFiles.push(`/uploads/${uniqueName}`)
    }
  }

  if (uploadedFiles.length === 0) {
    throw createError({ statusCode: 400, message: 'ไฟล์ไม่ถูกต้อง' })
  }

  return { success: true, url: uploadedFiles[0], urls: uploadedFiles }
})
