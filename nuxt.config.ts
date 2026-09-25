process.on('unhandledRejection', (reason: any) => {
  const code = reason?.code || reason?.cause?.code || ''
  if (['ECONNRESET', 'ECONNABORTED', 'EPIPE', 'ERR_STREAM_DESTROYED', 'ETIMEDOUT'].includes(code) || String(reason).includes('ECONNRESET')) return
})
process.on('uncaughtException', (err: any) => {
  const code = err?.code || err?.cause?.code || ''
  if (['ECONNRESET', 'ECONNABORTED', 'EPIPE', 'ERR_STREAM_DESTROYED', 'ETIMEDOUT'].includes(code) || String(err).includes('ECONNRESET')) return
})


// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#7b6cf6' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Inter:wght@300;400;500;600;700&display=swap' },
      ],
      script: [
        {
          innerHTML: `(function(){
  try {
    if (typeof window.requestIdleCallback === 'function') {
      var origRIC = window.requestIdleCallback;
      window.requestIdleCallback = function(cb, opts) {
        return origRIC.call(window, function(deadline) {
          try { cb(deadline); } catch(err) {}
        }, opts);
      };
    }
    if (typeof window.requestAnimationFrame === 'function') {
      var origRAF = window.requestAnimationFrame;
      window.requestAnimationFrame = function(cb) {
        return origRAF.call(window, function(time) {
          try { cb(time); } catch(err) {}
        });
      };
    }
  } catch(e) {}
  window.addEventListener('error', function(e) {
    var msg = (e && (e.message || (e.error && e.error.message))) || '';
    if (msg.indexOf('startTime') !== -1 || msg.indexOf('reportAllChanges') !== -1) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return true;
    }
  }, true);
  window.addEventListener('unhandledrejection', function(e) {
    var r = e.reason ? (e.reason.message || String(e.reason)) : '';
    if (r.indexOf('startTime') !== -1 || r.indexOf('reportAllChanges') !== -1) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);
})();`,
          type: 'text/javascript'
        }
      ]
    },
  },

  runtimeConfig: {
    // Private (server-only)
    jwtSecret: process.env.JWT_SECRET || 'connecxus-jwt-secret-2026-dev',
    dbHost: process.env.DB_HOST || 'localhost',
    dbPort: process.env.DB_PORT || '3306',
    dbUser: process.env.DB_USER || 'root',
    dbPassword: process.env.DB_PASSWORD || '',
    dbName: process.env.DB_NAME || 'connecxus_db',
    // Public (exposed to client)
    public: {
      appName: 'ConnecXus',
    },
  },

  nitro: {
    compressPublicAssets: true,
    experimental: {
      websocket: true,
    },
  },

  routeRules: {
    '/auth/login': { redirect: '/login' },
    '/icons/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },
})