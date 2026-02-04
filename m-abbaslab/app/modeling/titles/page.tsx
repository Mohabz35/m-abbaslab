// app/modeling/titles/page.tsx
import { personalConfig } from '@/config/personal'
import { Crown, Trophy, Award, Calendar, MapPin, Star } from 'lucide-react'

export default function TitlesPage() {
  const titles = personalConfig.modelingTitles

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <Crown className="w-12 h-12 text-amber-500" />
            <h1 className="text-4xl font-bold">Modeling Titles & Achievements</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
            Recognition and awards earned through modeling competitions, pageantry, and fashion events.
          </p>
        </div>

        {/* Titles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {titles.map((title) => (
            <div 
              key={title.id}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Featured Badge */}
              {title.featured && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-xs font-medium">
                    <Star className="w-3 h-3 fill-white" />
                    Featured
                  </div>
                </div>
              )}

              {/* Title Card */}
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-2">{title.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {title.year}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        {title.category}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {title.description}
                </p>

                {/* Details */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Achievements:</h4>
                  <ul className="space-y-2">
                    {title.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Category Tag */}
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    title.category === 'leadership' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : title.category === 'beauty-fashion'
                      ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                      : title.category === 'fashion'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {title.category.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {titles.length}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Total Titles</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {titles.filter(t => t.featured).length}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Featured Titles</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              2021-2024
            </div>
            <div className="text-gray-600 dark:text-gray-300">Active Period</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              5+
            </div>
            <div className="text-gray-600 dark:text-gray-300">Categories</div>
          </div>
        </div>
      </div>
    </div>
  )
}
