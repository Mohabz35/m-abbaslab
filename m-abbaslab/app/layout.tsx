import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Scene3D from '@/components/background/Scene3D'
import PageTransition from '@/components/PageTransition'
import ErrorBoundary from '@/components/ErrorBoundary'
import Analytics from '@/components/Analytics'
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
    default: 'M-AbbasLab | Personal Operating Platform',
    template: '%s | M-AbbasLab',
  },
  description: 'Mohammed Abbas — Founder of SkillFinch and Asia Connect. Research Scientist and Fashion Technologist building the future of African digital economies.',
  keywords: ['Founder', 'Research Scientist', 'Fashion Technology', 'Economics', 'Digital Economy', 'Africa', 'SkillFinch', 'Mohammed Abbas', 'M-AbbasLab'],
  authors: [{ name: 'Mohammed Abbas' }],
  creator: 'Mohammed Abbas',
  publisher: 'Mohammed Abbas Digital Ecosystem',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://m-abbaslab.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://m-abbaslab.com',
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
    url: 'https://m-abbaslab.com',
    image: 'https://m-abbaslab.com/images/hero-3d-avatar.png',
    jobTitle: 'Researcher and Technologist',
    worksFor: {
      '@type': 'Organization',
      name: 'Chuka University',
    },
    sameAs: [
      'https://github.com/Mohabz35',
      'https://linkedin.com/in/mohammed-abbas-490385369',
      'https://x.com/MohabzMabz',
      'https://www.instagram.com/mohabmabz/',
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
        <Suspense fallback={null}>
          <Analytics gaId={personalConfig.googleAnalyticsId || ''} />
        </Suspense>
        <ErrorBoundary>
          <Scene3D />

          <div className="relative min-h-screen flex flex-col z-10">
            <Navbar />

            <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-8 md:py-12">
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
