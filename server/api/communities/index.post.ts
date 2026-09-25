import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อชุมชน'),
  slug: z.string().min(1, 'กรุณาระบุ URL สั้น (Slug)'),
  description: z.string().nullish().or(z.literal('')),
  icon: z.string().nullish().or(z.literal('')),
  bg_color: z.string().nullish().or(z.literal('')),
  avatar_url: z.string().nullish().or(z.literal('')),
  banner_url: z.string().nullish().or(z.literal('')),
  banner_position_y: z.coerce.number().optional().default(50),
  banner_pos_y: z.coerce.number().optional(),
  is_private: z.coerce.boolean().optional().default(false)
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const body = await readBody(event)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง'
    throw createError({ statusCode: 400, message: errorMsg })
  }
  const data = parsed.data

  const cleanSlug = data.slug.trim().toLowerCase().replace(/[^a-z0-9ก-๙_-]+/g, '-')

  const db = getDb()
  
  // Check if slug exists
  const [existing] = await db.query('SELECT id FROM communities WHERE slug = ?', [cleanSlug])
  if ((existing as any[]).length > 0) {
    throw createError({ statusCode: 400, message: 'URL สั้น (Slug) นี้มีผู้ใช้งานแล้ว กรุณาเลือกชื่ออื่น' })
  }

  const bannerPosY = data.banner_pos_y !== undefined ? data.banner_pos_y : (data.banner_position_y ?? 50)

  // Insert Community
  const [result] = await db.query(
    `INSERT INTO communities (
      name, slug, description, icon, bg_color, avatar_url, banner_url, banner_position_y, owner_id, is_private
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name.trim(),
      cleanSlug,
      data.description?.trim() || null,
      data.icon || '🚀',
      data.bg_color || '#8b5cf6',
      data.avatar_url?.trim() || null,
      data.banner_url?.trim() || null,
      bannerPosY,
      user.userId,
      data.is_private ? 1 : 0
    ]
  )
  
  const insertId = (result as any).insertId

  // Automatically join the creator to the community
  await db.query(
    `INSERT INTO community_members (user_id, community_id, role, status) VALUES (?, ?, 'owner', 'active')`,
    [user.userId, insertId]
  )

  return { success: true, communityId: insertId, slug: cleanSlug }
})
