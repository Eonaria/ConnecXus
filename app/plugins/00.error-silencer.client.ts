/**
 * plugins/00.error-silencer.client.ts
 * Suppress browser extension / Chromium soft-navigation tracing errors
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window !== 'undefined') {
    // 0. Safe requestIdleCallback & requestAnimationFrame wrapper
    try {
      if (typeof window.requestIdleCallback === 'function') {
        const originalRIC = window.requestIdleCallback
        window.requestIdleCallback = function (callback, options) {
          return originalRIC.call(
            window,
            (deadline) => {
              try {
                callback(deadline)
              } catch (err: any) {
                if (!err?.message?.includes('startTime') && !err?.message?.includes('reportAllChanges')) {
                  // Ignore
                }
              }
            },
            options
          )
        }
      }
    } catch {}

    // 1. Monkey-patch PerformanceObserver to prevent empty entries from triggering "reading 'startTime' on undefined"
    try {
      if (typeof window.PerformanceObserver !== 'undefined') {
        const OriginalObserver = window.PerformanceObserver
        window.PerformanceObserver = class SafePerformanceObserver extends OriginalObserver {
          constructor(callback: PerformanceObserverCallback) {
            super((entryList, observer) => {
              try {
                const originalGetEntries = entryList.getEntries.bind(entryList)
                const originalGetEntriesByName = entryList.getEntriesByName.bind(entryList)
                const originalGetEntriesByType = entryList.getEntriesByType.bind(entryList)

                const safeWrap = (entries: PerformanceEntryList) => {
                  if (!entries || entries.length === 0) {
                    return [{ startTime: 0, duration: 0, entryType: 'layout-shift', name: '', value: 0, hadRecentInput: false, sources: [], toJSON: () => ({}) }] as any
                  }
                  return entries
                }

                const safeList = {
                  getEntries: () => safeWrap(originalGetEntries()),
                  getEntriesByName: (name: string, type?: string) => safeWrap(originalGetEntriesByName(name, type)),
                  getEntriesByType: (type: string) => safeWrap(originalGetEntriesByType(type))
                } as PerformanceObserverEntryList

                callback(safeList, observer)
              } catch (err: any) {
                if (!err?.message?.includes('startTime') && !err?.message?.includes('reportAllChanges')) {
                  // Ignore
                }
              }
            })
          }
        }
      }
    } catch {}

    // 2. window.onerror — returning true stops Chrome DevTools from displaying the error in red
    const prevOnError = window.onerror
    window.onerror = function (msg, url, lineNo, columnNo, error) {
      const errorStr = String(msg || error?.message || '')
      if (errorStr.includes('startTime') || errorStr.includes('reportAllChanges')) {
        return true
      }
      if (typeof prevOnError === 'function') {
        return prevOnError(msg, url, lineNo, columnNo, error)
      }
      return false
    }

    // 3. window error listener (capture phase)
    window.addEventListener(
      'error',
      (event) => {
        const errorStr = String(event.message || event.error?.message || '')
        if (errorStr.includes('startTime') || errorStr.includes('reportAllChanges')) {
          event.preventDefault()
          event.stopImmediatePropagation()
        }
      },
      true
    )

    // 4. unhandledrejection listener
    window.addEventListener(
      'unhandledrejection',
      (event) => {
        const reasonStr = String(event.reason?.message || event.reason || '')
        if (reasonStr.includes('startTime') || reasonStr.includes('reportAllChanges')) {
          event.preventDefault()
          event.stopImmediatePropagation()
        }
      },
      true
    )

    // 5. console.error filter
    const originalConsoleError = console.error
    console.error = function (...args: any[]) {
      const combined = args
        .map((a) => (typeof a === 'object' ? a?.stack || a?.message || '' : String(a || '')))
        .join(' ')
      if (combined.includes('startTime') || combined.includes('reportAllChanges')) {
        return
      }
      originalConsoleError.apply(console, args)
    }

    // 6. Nuxt vue:error hook
    nuxtApp.hook('vue:error', (error) => {
      const errorStr = String(error?.message || error || '')
      if (errorStr.includes('startTime') || errorStr.includes('reportAllChanges')) {
        return
      }
    })
  }
})
