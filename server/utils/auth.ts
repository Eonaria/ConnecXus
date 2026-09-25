/**
 * server/utils/auth.ts
 * JWT helpers using `jose` (ESM-compatible, works with Nitro)
 */
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import type { H3Event } from 'h3'

/** Get secret key as Uint8Array */
function getSecret(): Uint8Array {
  const config = useRuntimeConfig()
  const secret = (config.jwtSecret as string) || 'connecxus-fallback-secret-change-in-production'
  return new TextEncoder().encode(secret)
}

/** Sign a JWT token */
export async function signToken(
  payload: Record<string, unknown>,
  expiresIn: string = '7d',
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret())
}

/** Verify a JWT token and return its payload */
export async function verifyToken(token: string): Promise<JWTPayload & Record<string, unknown>> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as JWTPayload & Record<string, unknown>
}

/** Extract the current user from the request's auth_token cookie or Bearer header */
export async function getRequestUser(event: H3Event) {
  let token = getCookie(event, 'auth_token')
  if (!token) {
    const authHeader = getHeader(event, 'authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }
  if (!token) return null

  try {
    const payload = await verifyToken(token)
    if (payload) {
      const currentUserId = Number(payload.userId || payload.id)
      if (currentUserId) {
        payload.userId = currentUserId
        try {
          const db = getDb()
          const [rows] = await db.query('SELECT id, username, display_name, role FROM users WHERE id = ? LIMIT 1', [currentUserId])
          const dbUser = (rows as any[])[0]
          if (dbUser) {
            payload.username = dbUser.username
            payload.display_name = dbUser.display_name
            payload.role = dbUser.role
          }
        } catch {}
      }
    }
    return payload
  } catch {
    return null
  }
}

/** Require authentication — throw 401 if not logged in, or 403 if banned */
export async function requireAuth(event: H3Event) {
  const user = await getRequestUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบก่อน' })
  }

  // Fallback for older tokens that might have used 'id' instead of 'userId'
  const currentUserId = user.userId || user.id
  if (!currentUserId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', message: 'Token ไม่สมบูรณ์ กรุณาเข้าสู่ระบบใหม่' })
  }
  user.userId = currentUserId

  // Check ban status and role in DB to ensure real-time enforcement
  const banStatus = await checkAndResolveUserBan(currentUserId)
  if (banStatus.isBanned) {
    throw createError({ 
      statusCode: 403, 
      statusMessage: 'Account Suspended', 
      message: banStatus.banType === 'suspended' ? `บัญชีของคุณถูกระงับการใช้งานชั่วคราว (เหตุผล: ${banStatus.reason})` : 'บัญชีของคุณถูกระงับการใช้งานถาวร'
    })
  }

  const db = getDb()
  const [rows] = await db.query(
    'SELECT role FROM users WHERE id = ? LIMIT 1',
    [currentUserId]
  )
  const dbUser = (rows as any[])[0]
  if (dbUser) {
    user.role = dbUser.role
  }

  return user
}

/** Require admin role */
export async function requireAdmin(event: H3Event) {
  const user = await requireAuth(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden', message: 'ไม่มีสิทธิ์เข้าถึง' })
  }
  return user
}
