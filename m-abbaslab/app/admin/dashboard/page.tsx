// app/admin/dashboard/page.tsx
'use client'

import { useState } from 'react'
import {
  FileText,
  Briefcase,
  User,
  Settings,
  Plus,
  Edit,
  Image,
  BarChart,
  Upload,
  Save,
  Eye
} from 'lucide-react'
import { personalConfig } from '@/config/personal'

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [projects, setProjects] = useState<any[]>(personalConfig.projects as any[])
  const [articles, setArticles] = useState<any[]>(personalConfig.articles as any[])
  const [titles, setTitles] = useState<any[]>(personalConfig.modelingTitles as any[])

  // Stats
  const stats = [
    { label: 'Total Projects', value: projects.length, icon: Briefcase, color: 'blue' },
    { label: 'Published Articles', value: articles.filter(a => a.published).length, icon: FileText, color: 'green' },
    { label: 'Modeling Titles', value: titles.length, icon: User, color: 'purple' },
    { label: 'Featured Items', value: [...projects, ...titles].filter(item => item.featured).length, icon: Eye, color: 'amber' }
  ]

  const handleAddProject = () => {
    const newProject = {
      id: `project-${Date.now()}`,
      title: 'New Project',
      description: 'Project description...',
      longDescription: 'Extended project details...',
      technologies: ['Technology'],
      github_url: '#',
      live_url: '#',
      category: 'technology',
      featured: false,
      status: 'Planning Phase',
      year: '2024'
    }
    setProjects([...projects, newProject])
  }

  const handlePublishToggle = (type: 'project' | 'article', id: string) => {
    if (type === 'project') {
      setProjects(projects.map(p =>
        p.id === id ? { ...p, featured: !p.featured } : p
      ))
    } else {
      setArticles(articles.map(a =>
        a.id === id ? { ...a, published: !a.published } : a
      ))
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your site content and settings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-8 h-8 text-${stat.color}-500`} />
                <BarChart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex space-x-4">
          {['overview', 'projects', 'articles', 'modeling', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize border-b-2 transition-colors ${activeTab === tab
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleAddProject}
                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Add Project</h3>
                  <p className="text-sm text-gray-500">Create new project entry</p>
                </div>
              </button>

              <button className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Write Article</h3>
                  <p className="text-sm text-gray-500">Publish new article</p>
                </div>
              </button>

              <button className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Image className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Upload Media</h3>
                  <p className="text-sm text-gray-500">Add photos/videos</p>
                </div>
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <h3 className="font-medium">{project.title}</h3>
                      <p className="text-sm text-gray-500">{project.status} • {project.year}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePublishToggle('project', project.id)}
                        className={`px-3 py-1 text-sm rounded ${project.featured
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                      >
                        {project.featured ? 'Featured' : 'Feature'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Projects ({projects.length})</h2>
              <button
                onClick={handleAddProject}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" />
                Add Project
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td className="px-6 py-4">
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-gray-500">{project.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                          {project.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${project.featured ? 'bg-green-500' : 'bg-gray-300'
                            }`}></span>
                          <span>{project.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePublishToggle('project', project.id)}
                            className={`px-3 py-1 text-sm rounded ${project.featured
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                          >
                            {project.featured ? 'Featured' : 'Feature'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-6">Site Settings</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">General Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Site Title</label>
                    <input
                      type="text"
                      defaultValue="M-AbbasLab"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Admin Email</label>
                    <input
                      type="email"
                      defaultValue="mohammedabbasofficial100@gmail.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Features</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span>Enable Dark Mode</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span>Enable Animations</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span>Enable WebGL Background</span>
                  </label>
                </div>
              </div>

              <div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  <Save className="w-4 h-4" />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
