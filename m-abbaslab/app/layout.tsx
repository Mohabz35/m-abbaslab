import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import PWAStatusBar from '@/components/PWAStatusBar'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Scene3D from '@/components/background/Scene3D'
import FloatingJarvisLauncher from '@/components/ui/FloatingJarvisLauncher'
import PageTransition from '@/components/PageTransition'
import ErrorBoundary from '@/components/ErrorBoundary'
import Analytics from '@/components/Analytics'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import { personalConfig } from '@/config/personal'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'Mohammed Abbas | M-AbbasLab | Personal Operating Platform',
    template: '%s | M-AbbasLab',
  },
  description: 'Research · Economics · Technology · Creation - The digital workspace of Mohammed Abbas. Explore innovative solutions at the intersection of economics, technology, and research.',
  keywords: ['economics', 'research', 'technology', 'data science', 'machine learning', 'portfolio', 'Mohammed Abbas', 'Chuka University'],
  authors: [{ name: 'Mohammed Abbas' }],
  creator: 'Mohammed Abbas',
  publisher: 'M-AbbasLab',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AbbasLab',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  metadataBase: new URL('https://www.mohammedabbas.tech'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.mohammedabbas.tech',
    title: 'M-AbbasLab | Personal Operating Platform',
    description: 'Research · Economics · Technology · Creation - The digital workspace of Mohammed Abbas',
    siteName: 'M-AbbasLab',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'M-AbbasLab Cover',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'M-AbbasLab | Personal Operating Platform',
    description: 'Research · Economics · Technology · Creation - The digital workspace of Mohammed Abbas',
    creator: '@m_abbas_official',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Mohammed Abbas',
    url: 'https://www.mohammedabbas.tech',
    image: 'https://www.mohammedabbas.tech/images/hero-3d-avatar.png',
    jobTitle: 'Researcher and Technologist',
    worksFor: {
      '@type': 'Organization',
      name: 'Chuka University',
    },
    sameAs: [
      'https://github.com/Mohabz35',
      'https://linkedin.com/in/mohammed-abbas-490385369',
      'https://x.com/MohabzMabz',
      'https://www.instagram.com/mohammedabbas_ke/',
    ],
  }

  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} text-white bg-[#030014] selection:bg-[#00f0ff]/30 selection:text-[#00f0ff]`}>
        <PWAStatusBar />
        <ServiceWorkerRegistration />
        <a href="#main-content" className="skip-to-content">Skip to content</a>
        <Suspense fallback={null}>
          <Analytics gaId={personalConfig.googleAnalyticsId || ''} />
        </Suspense>
        <ErrorBoundary>
          <Scene3D />
          <FloatingJarvisLauncher />

          <div className="relative min-h-screen flex flex-col z-10">
            <Navbar />

            <main id="main-content" className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-8 md:py-12">
              <PageTransition>
                {children}
              </PageTransition>
            </main>

            <Footer />
          </div>
        </ErrorBoundary>
      </body>
    </html>
  )
}
