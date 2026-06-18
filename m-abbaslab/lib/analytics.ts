'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function useAnalytics() {
  const pathname = usePathname()
  const lastTracked = useRef<string>('')

  useEffect(() => {
    if (!pathname || pathname === lastTracked.current) return
    lastTracked.current = pathname

    const track = async () => {
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: 'pageview',
            page_path: pathname,
            page_title: document.title,
            referrer: document.referrer || '',
          }),
        })
      } catch {}
    }

    track()
  }, [pathname])
}

export function trackEvent(eventType: string, pagePath: string, metadata?: Record<string, unknown>) {
  try {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        page_path: pagePath,
        page_title: document.title,
        referrer: document.referrer || '',
        metadata: metadata || {},
      }),
    })
  } catch {}
}
