'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function Analytics({ gaId }: { gaId: string }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (gaId) {
            // @ts-ignore
            window.gtag('config', gaId, {
                page_path: pathname + searchParams.toString(),
            })
        }
    }, [pathname, searchParams, gaId])

    if (!gaId) return null

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
                id="gtag-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
                }}
            />
        </>
    )
}
