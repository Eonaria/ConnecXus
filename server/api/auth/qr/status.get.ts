export default defineEventHandler((event) => {
  const query = getQuery(event)
  const token = query.token as string

  if (!token) {
    throw createError({ statusCode: 400, message: 'Missing token' })
  }

  const session = getQrSession(token)
  if (!session) {
    return { status: 'expired' }
  }

  if (session.status === 'confirmed') {
    if (session.type === 'pc_auth' && session.authToken) {
      // Set authentication cookie for the desktop client
      setCookie(event, 'auth_token', session.authToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })
    }

    return {
      status: 'confirmed',
      type: session.type,
      user: session.user
    }
  }

  return {
    status: session.status,
    type: session.type
  }
})
