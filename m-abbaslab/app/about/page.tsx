// app/about/page.tsx
import type { Metadata } from 'next'
import { personalConfig } from '@/config/personal'
import {
  BookOpen,
  Code,
  BarChart3,
  Users,
  Target,
  Brain,
  GraduationCap,
  Briefcase
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Mohammed Abbas',
  description: 'Learn about Mohammed Abbas - Student, Engineer, Researcher, and Model. Exploring the intersection of economics, technology, and fashion.',
}

export default function AboutPage() {
  const skills = personalConfig.skills
  const education = personalConfig.education
  const experience = personalConfig.experience
  const researchInterests = personalConfig.researchInterests

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About Me
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
            {personalConfig.tagline}
          </p>
        </div>

        {/* Identity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {personalConfig.roles.map((role, index) => {
            const icons = [GraduationCap, Code, BookOpen, Users]
            const Icon = icons[index] || Users
            return (
              <div key={role} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{role}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {index === 0 && "Chuka University • Knowledge Is Wealth"}
                  {index === 1 && "Full-Stack Development • Modern Web"}
                  {index === 2 && "Independent Research • Academic Focus"}
                  {index === 3 && "Commercial • Editorial • Portfolio"}
                </p>
              </div>
            )
          })}
        </div>

        {/* Education & Experience */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Education */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Education</h2>
            </div>

            <div className="space-y-6">
              {education.map((edu, index) => (
                <div key={index} className="relative pl-8">
                  <div className="absolute left-0 top-2 w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="absolute left-[5px] top-5 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                  <h3 className="font-bold text-lg">{edu.degree}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">{edu.institution}</p>
                  <p className="text-gray-500 text-sm mb-2">{edu.period} • {edu.status}</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">{edu.focus}</p>

                  {/* Education achievements block removed as it is not part of the data type */}
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Experience</h2>
            </div>

            <div className="space-y-6">
              {experience.map((exp, index) => (
                <div key={index} className="relative pl-8">
                  <div className="absolute left-0 top-2 w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div className="absolute left-[5px] top-5 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                  <h3 className="font-bold text-lg">{exp.role}</h3>
                  <p className="text-gray-500 text-sm mb-2">{exp.period}</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">{exp.description}</p>

                  {exp.achievements && (
                    <ul className="space-y-2">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills Visualization */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Skills & Expertise</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(skills).map(([category, skillList]) => (
              <div key={category} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-lg mb-4 capitalize text-blue-600 dark:text-blue-400">
                  {category.replace('-', ' ')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[...skillList].map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-full border border-blue-200 dark:border-blue-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Research Interests */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Research Interests</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {researchInterests.map((interest, index) => (
              <div
                key={interest}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <h3 className="font-medium">{interest}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-left">
              <h3 className="text-xl font-bold mb-2">Let's Connect</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Interested in collaboration, research, or just want to chat about technology and fashion?
              </p>
            </div>
            <a
              href="/contact"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
