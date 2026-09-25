import os from 'node:os'

export default defineEventHandler((event) => {
  const session = createQrSession()

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
  const qrUrl = `${baseUrl}/qr-auth?token=${session.token}`
  const mobileAccessUrl = `${baseUrl}/login`

  return {
    token: session.token,
    expires_at: session.expiresAt,
    qr_url: qrUrl,
    network_url: baseUrl,
    mobile_access_url: mobileAccessUrl,
    best_ip: bestIp,
    port: parseInt(port, 10) || 3000,
    all_ips: allIps.map(i => ({ name: i.name, ip: i.ip }))
  }
})
