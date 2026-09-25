import os from 'node:os'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const userId = body?.userId
  const username = body?.username

  const db = getDb()
  let user: any = null

  if (userId) {
    const [rows] = await db.query(
      'SELECT id, username, email, display_name, avatar_url, role FROM users WHERE id = ? AND is_banned = 0 LIMIT 1',
      [userId]
    )
    user = (rows as any[])[0]
  } else if (username) {
    const [rows] = await db.query(
      'SELECT id, username, email, display_name, avatar_url, role FROM users WHERE username = ? AND is_banned = 0 LIMIT 1',
      [username]
    )
    user = (rows as any[])[0]
  } else {
    // If user is currently logged in via token
    const tokenPayload = await getRequestUser(event)
    if (tokenPayload?.userId) {
      const [rows] = await db.query(
        'SELECT id, username, email, display_name, avatar_url, role FROM users WHERE id = ? AND is_banned = 0 LIMIT 1',
        [tokenPayload.userId]
      )
      user = (rows as any[])[0]
    }
  }

  if (!user) {
    // Fallback: Pick the first available active user (e.g. admin or primary user)
    const [rows] = await db.query(
      'SELECT id, username, email, display_name, avatar_url, role FROM users WHERE is_banned = 0 ORDER BY id ASC LIMIT 1'
    )
    user = (rows as any[])[0]
  }

  if (!user) {
    throw createError({ statusCode: 400, message: 'ไม่พบบัญชีผู้ใช้ในระบบ กรุณาสมัครสมาชิกก่อน' })
  }

  const session = createMobileInstantQrSession(user)

  // Detect server LAN IPv4
  const interfaces = os.networkInterfaces()
  const allIps: { name: string; ip: string; priority: number }[] = []

  for (const [name, netList] of Object.entries(interfaces)) {
    if (!netList) continue
    const lowerName = name.toLowerCase()

    for (const net of netList) {
      if (net.family === 'IPv4' && !net.internal) {
        let priority = 1 // default

        // Priority 10: Real Wi-Fi or Ethernet
        if (lowerName.includes('wi-fi') || lowerName.includes('wifi') || lowerName.includes('wlan') || lowerName.includes('ethernet') || lowerName.includes('lan')) {
          priority = 10
        }
        // Priority 8: Standard RFC1918 Private LAN IPs
        else if (net.address.startsWith('192.168.') || net.address.startsWith('10.') || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(net.address)) {
          priority = 8
        }
        // Priority 2: VPNs / Virtual Adapters (Tailscale, Radmin, VirtualBox, WSL)
        else if (lowerName.includes('radmin') || lowerName.includes('tailscale') || lowerName.includes('vbox') || lowerName.includes('wsl') || lowerName.includes('virtual')) {
          priority = 2
        }

        allIps.push({ name, ip: net.address, priority })
      }
    }
  }

  // Sort by priority descending
  allIps.sort((a, b) => b.priority - a.priority)
  const bestIp = allIps[0]?.ip || 'localhost'

  const hostHeader = getHeader(event, 'host') || 'localhost:3000'
  const port = hostHeader.includes(':') ? hostHeader.split(':')[1] : '3000'

  const baseUrl = bestIp !== 'localhost' ? `http://${bestIp}:${port}` : `http://localhost:${port}`
  const qrUrl = `${baseUrl}/api/auth/qr/mobile-login?token=${session.token}`

  return {
    token: session.token,
    expires_at: session.expiresAt,
    qr_url: qrUrl,
    target_user: user,
    best_ip: bestIp,
    port: parseInt(port, 10) || 3000,
    all_ips: allIps.map(i => ({ name: i.name, ip: i.ip }))
  }
})
