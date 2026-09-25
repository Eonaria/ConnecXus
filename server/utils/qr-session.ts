import crypto from 'node:crypto'

interface QrSession {
  token: string
  type: 'pc_auth' | 'mobile_instant'
  status: 'pending' | 'scanned' | 'confirmed' | 'expired'
  userId?: number
  authToken?: string
  user?: any
  createdAt: number
  expiresAt: number
}

// In-memory QR session store (expires after 5 minutes)
const sessions = new Map<string, QrSession>()

// Cleanup expired sessions every 2 minutes
setInterval(() => {
  const now = Date.now()
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(token)
    }
  }
}, 120000)

export function createQrSession(): QrSession {
  const token = 'qr_' + crypto.randomBytes(16).toString('hex')
  const now = Date.now()
  const session: QrSession = {
    token,
    type: 'pc_auth',
    status: 'pending',
    createdAt: now,
    expiresAt: now + 5 * 60 * 1000 // 5 minutes
  }
  sessions.set(token, session)
  return session
}

export function createMobileInstantQrSession(targetUser: any): QrSession {
  const token = 'mobi_' + crypto.randomBytes(16).toString('hex')
  const now = Date.now()
  const session: QrSession = {
    token,
    type: 'mobile_instant',
    status: 'pending',
    userId: targetUser.id,
    user: targetUser,
    createdAt: now,
    expiresAt: now + 5 * 60 * 1000 // 5 minutes
  }
  sessions.set(token, session)
  return session
}

export function getQrSession(token: string): QrSession | null {
  const session = sessions.get(token)
  if (!session) return null
  if (session.expiresAt < Date.now()) {
    sessions.delete(token)
    return null
  }
  return session
}

export function markQrSessionScanned(token: string): boolean {
  const session = getQrSession(token)
  if (!session || session.status !== 'pending') return false
  session.status = 'scanned'
  return true
}

export function confirmQrSession(token: string, user: any, authToken: string): boolean {
  const session = getQrSession(token)
  if (!session) return false
  session.status = 'confirmed'
  session.userId = user.id
  session.user = user
  session.authToken = authToken
  return true
}
