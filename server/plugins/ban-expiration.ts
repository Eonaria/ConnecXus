/**
 * server/plugins/ban-expiration.ts
 * Background task to scan and auto-unban expired suspensions
 */
import { cleanExpiredBans } from '../utils/banManager'

export default defineNitroPlugin((nitroApp) => {
  // 1. Initial cleanup on server start
  setTimeout(async () => {
    try {
      await cleanExpiredBans()
    } catch {}
  }, 3000)

  // 2. Periodic background check every 15 seconds
  setInterval(async () => {
    try {
      await cleanExpiredBans()
    } catch {}
  }, 15000)
})
