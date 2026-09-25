export default defineNitroPlugin((nitroApp) => {
  const isNetworkReset = (err: any) => {
    const code = err?.code || err?.cause?.code || ''
    const msg = String(err?.message || err || '')
    return (
      ['ECONNRESET', 'ECONNABORTED', 'EPIPE', 'ERR_STREAM_DESTROYED', 'ETIMEDOUT'].includes(code) ||
      msg.includes('ECONNRESET') ||
      msg.includes('read ECONNRESET') ||
      msg.includes('write EPIPE') ||
      msg.includes('ERR_STREAM_DESTROYED')
    )
  }

  process.on('unhandledRejection', (reason: any) => {
    if (isNetworkReset(reason)) return
    console.error('[Server] Unhandled Rejection:', reason)
  })

  process.on('uncaughtException', (err: any) => {
    if (isNetworkReset(err)) return
    console.error('[Server] Uncaught Exception:', err)
  })

  nitroApp.hooks.hook('error', (error) => {
    if (isNetworkReset(error)) return
  })
})
