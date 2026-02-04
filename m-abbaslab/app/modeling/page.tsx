// app/modeling/page.tsx
import { personalConfig } from '@/config/personal'
import { Crown, Trophy, Award, Star, Camera, Users } from 'lucide-react'
import Link from 'next/link'

export default function ModelingPage() {
  const featuredTitles = personalConfig.modelingTitles.filter(t => t.featured)
  const allTitles = personalConfig.modelingTitles

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black text-white py-20">
        <div className="absolute inset-0 bg-[url('/images/modeling/pattern.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <Crown className="w-12 h-12 text-yellow-400" />
              <h1 className="text-5xl md:text-6xl font-bold">Fashion Modeling</h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Bridging commercial fashion with technology innovation. From runway to research.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-12 bg-gradient-to-b from-blue-500 to-purple-500"></div>
            <h2 className="text-3xl font-bold">Modeling Portfolio</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
            Combining professional modeling with technological innovation. My journey spans traditional runway, 
            commercial campaigns, and experimental fashion technology projects.
          </p>
        </div>

        {/* Featured Titles */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-500" />
              <h2 className="text-2xl font-bold">Featured Titles</h2>
            </div>
            <Link 
              href="/modeling/titles"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
            >
              View all titles
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTitles.map((title) => (
              <div 
                key={title.id}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all"
              >
                {/* Title Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-white/90 text-black rounded-full text-sm font-medium">
                      {title.year}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="w-5 h-5 text-amber-500" />
                    <h3 className="text-xl font-bold">{title.title}</h3>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {title.description}
                  </p>
                  
                  <div className="space-y-2">
                    {title.details.slice(0, 2).map((detail, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-8 h-8 text-blue-500" />
            <h2 className="text-2xl font-bold">Runway Journey</h2>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
            
            <div className="space-y-12">
              {personalConfig.runwayJourney.map((journey, index) => (
                <div 
                  key={journey.id}
                  className={`relative flex ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-8 h-8 bg-white dark:bg-gray-800 border-4 border-blue-500 rounded-full z-10"></div>
                  
                  {/* Content */}
                  <div className={`ml-12 md:ml-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'} md:w-1/2`}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <div className="inline-flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                          {journey.year}
                        </span>
                        <span className="text-sm text-gray-500">{journey.title}</span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {journey.description}
                      </p>
                      
                      <div className="space-y-2">
                        {journey.highlights.map((highlight, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Commercial Modeling</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Professional photoshoots, brand campaigns, and commercial fashion work.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Title Competitions</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Pageantry and title competitions showcasing style, presentation, and leadership.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Fashion Technology</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Experimental projects exploring the intersection of fashion and technology.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Interested in Collaboration?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Whether it's fashion campaigns, technology projects, or creative collaborations, 
            I'm always open to interesting opportunities.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Get in Touch
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
