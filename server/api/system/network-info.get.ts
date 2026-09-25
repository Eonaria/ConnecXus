import os from 'node:os'

export default defineEventHandler((event) => {
  const interfaces = os.networkInterfaces()
  const ips: { name: string; ip: string; isLan: boolean }[] = []

  for (const [name, netList] of Object.entries(interfaces)) {
    if (!netList) continue
    for (const net of netList) {
      if (net.family === 'IPv4' && !net.internal) {
        const isLan = net.address.startsWith('192.168.') || 
                      net.address.startsWith('10.') || 
                      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(net.address)
        ips.push({ name, ip: net.address, isLan })
      }
    }
  }

  // Sort LAN IPs (e.g. Wi-Fi / Ethernet) first
  ips.sort((a, b) => (b.isLan ? 1 : 0) - (a.isLan ? 1 : 0))

  const hostHeader = getHeader(event, 'host') || 'localhost:3000'
  const port = hostHeader.includes(':') ? hostHeader.split(':')[1] : '3000'
  const primaryIp = ips[0]?.ip || 'localhost'

  return {
    primary_ip: primaryIp,
    port: parseInt(port, 10) || 3000,
    interfaces: ips,
    network_url: primaryIp !== 'localhost' ? `http://${primaryIp}:${port}` : `http://localhost:${port}`
  }
})
