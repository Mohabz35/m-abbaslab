'use client'

import HeroSection from '@/components/sections/HeroSection'
import StatsSection from '@/components/sections/StatsSection'
import AboutSection from '@/components/sections/AboutSection'
import ServicesSection from '@/components/sections/ServicesSection'
import FeaturedWork from '@/components/sections/FeaturedWork'
import SkillsSection from '@/components/sections/SkillsSection'
import LatestArticles from '@/components/sections/LatestArticles'
import CTASection from '@/components/sections/CTASection'
import BackgroundEffect from '@/components/ui/BackgroundEffect'

export default function Home() {
  return (
    <main className="min-h-screen text-white selection:bg-blue-500/30 relative">
      <BackgroundEffect />
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <ServicesSection />
      <FeaturedWork />
      <SkillsSection />
      <LatestArticles />
      <CTASection />
    </main>
  )
}