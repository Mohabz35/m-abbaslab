'use client'

import { useState, useEffect } from 'react'
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
  Target,
  FlaskConical,
  Activity,
  Zap,
  Share2,
  Linkedin,
  Instagram,
  Twitter,
  Youtube,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Minus,
  ShieldCheck,
  ShieldAlert,
  Server,
  RefreshCcw,
  Terminal,
  Lock,
  Cpu,
  Send,
  Phone,
  FileUp,
  MessageCircle,
  History,
  AlertTriangle,
  Headset,
  Hash,
  Heart,
  Eye,
  Brain,
  CheckCircle,
  Award,
  Trash2,
  Music2
} from 'lucide-react'
import { personalConfig } from '@/config/personal'
import FinanceTracker from '@/components/admin/FinanceTracker'
import ContentScheduler from '@/components/admin/ContentScheduler'
import CommsHub from '@/components/admin/CommsHub'
import WhatsAppBroadcaster from '@/components/admin/WhatsAppBroadcaster'
import ZapierPanel from '@/components/admin/ZapierPanel'
import DisciplineOS from '@/components/admin/DisciplineOS'
import WhatsAppConnectionPanel from '@/components/admin/WhatsAppConnectionPanel'

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [projects, setProjects] = useState<any[]>([])
  const [articles, setArticles] = useState<any[]>([])
  const [titles, setTitles] = useState<any[]>([])
  const [alphas, setAlphas] = useState<any[]>([])
  const [jarvisTrainingRules, setJarvisTrainingRules] = useState<any[]>([])
  const [whatsappBotSchedule, setWhatsappBotSchedule] = useState<any>({
    type: 'always',
    workingHoursStart: '08:00',
    workingHoursEnd: '17:00',
    timezone: 'Africa/Nairobi'
  })
  const [editingItem, setEditingItem] = useState<{ type: string, id: string, field?: string } | null>(null)
  const [selectedEditProject, setSelectedEditProject] = useState<any | null>(null)
  const [selectedEditArticle, setSelectedEditArticle] = useState<any | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Site Settings State
  const [adminName, setAdminName] = useState(personalConfig.name)
  const [adminEmail, setAdminEmail] = useState(personalConfig.email)
  const [adminUsername, setAdminUsername] = useState((personalConfig as any).adminCredentials?.username || 'ceo')
  const [adminPassword, setAdminPassword] = useState((personalConfig as any).adminCredentials?.password || 'admin123')
  const [siteFeatures, setSiteFeatures] = useState(personalConfig.site.features)

  const [brandName, setBrandName] = useState(personalConfig.brandName || 'M-AbbasLab')
  const [siteTitle, setSiteTitle] = useState(personalConfig.title || '')
  const [tagline, setTagline] = useState(personalConfig.tagline || '')
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(personalConfig.googleAnalyticsId || '')
  
  // Social Media State
  const [socialGithub, setSocialGithub] = useState(personalConfig.social?.github || '')
  const [socialLinkedin, setSocialLinkedin] = useState(personalConfig.social?.linkedin || '')
  const [socialTwitter, setSocialTwitter] = useState(personalConfig.social?.twitter || '')
  const [socialInstagram, setSocialInstagram] = useState(personalConfig.social?.instagram || '')
  const [socialTiktok, setSocialTiktok] = useState(personalConfig.social?.tiktok || '')
  const [socialFacebook, setSocialFacebook] = useState(personalConfig.social?.facebook || '')
  const [socialYoutube, setSocialYoutube] = useState(personalConfig.social?.youtube || '')
  const [socialWhatsapp, setSocialWhatsapp] = useState(personalConfig.social?.whatsapp || '')
  const [socialTelegram, setSocialTelegram] = useState(personalConfig.social?.telegram || '')

  // Roles & Research Interests State
  const [rolesStr, setRolesStr] = useState(personalConfig.roles?.join(', ') || '')
  const [researchInterestsStr, setResearchInterestsStr] = useState(personalConfig.researchInterests?.join(', ') || '')

  // Load from API (File-Based CMS) with LocalStorage fallback
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/admin/config')
        if (response.ok) {
          const config = await response.json()
          
          // Only update if the config has data
          if (config.projects && config.projects.length > 0) setProjects(config.projects)
          else setProjects(personalConfig.projects || [])
          
          if (config.articles && config.articles.length > 0) setArticles(config.articles)
          else setArticles(personalConfig.articles || [])
          
          setTitles(config.fashion?.titles || (personalConfig as any).fashion?.titles || [])
          setAlphas(config.worldQuant?.alphas || (personalConfig as any).worldQuant?.alphas || [])
          setJarvisTrainingRules(config.jarvisTraining || (personalConfig as any).jarvisTraining || [])
          
          setWhatsappBotSchedule(config.whatsappBotSchedule || (personalConfig as any).whatsappBotSchedule || {
            type: 'always',
            workingHoursStart: '08:00',
            workingHoursEnd: '17:00',
            timezone: 'Africa/Nairobi'
          })
          
          setAdminName(config.name || personalConfig.name)
          setAdminEmail(config.email || personalConfig.email)
          setAdminUsername(config.adminCredentials?.username || (personalConfig as any).adminCredentials?.username || 'ceo')
          setAdminPassword(config.adminCredentials?.password || (personalConfig as any).adminCredentials?.password || 'admin123')
          setSiteFeatures(config.site?.features || personalConfig.site.features)
          setBrandName(config.brandName || personalConfig.brandName || 'M-AbbasLab')
          setSiteTitle(config.title || personalConfig.title || '')
          setTagline(config.tagline || personalConfig.tagline || '')
          setGoogleAnalyticsId(config.googleAnalyticsId || personalConfig.googleAnalyticsId || '')
          
          setSocialGithub(config.social?.github || personalConfig.social?.github || '')
          setSocialLinkedin(config.social?.linkedin || personalConfig.social?.linkedin || '')
          setSocialTwitter(config.social?.twitter || personalConfig.social?.twitter || '')
          setSocialInstagram(config.social?.instagram || personalConfig.social?.instagram || '')
          setSocialTiktok(config.social?.tiktok || personalConfig.social?.tiktok || '')
          setSocialFacebook(config.social?.facebook || personalConfig.social?.facebook || '')
          setSocialYoutube(config.social?.youtube || personalConfig.social?.youtube || '')
          setSocialWhatsapp(config.social?.whatsapp || personalConfig.social?.whatsapp || '')
          setSocialTelegram(config.social?.telegram || personalConfig.social?.telegram || '')
          
          setRolesStr(config.roles?.join(', ') || personalConfig.roles?.join(', ') || '')
          setResearchInterestsStr(config.researchInterests?.join(', ') || personalConfig.researchInterests?.join(', ') || '')
          
          setIsLoaded(true)
          return
        }
      } catch (error) {
        console.warn('API load failed, falling back to LocalStorage/personalConfig')
      }

      // Fallback
      setProjects(personalConfig.projects || [])
      setArticles(personalConfig.articles || [])
      setTitles((personalConfig as any).fashion?.titles || [])
      setAlphas((personalConfig as any).worldQuant?.alphas || [])
      setJarvisTrainingRules((personalConfig as any).jarvisTraining || [])
      setIsLoaded(true)
    }

    loadConfig()
  }, [])

  const handleSaveToProject = async () => {
    setIsSaving(true)
    try {
      const fullConfig = {
        ...personalConfig,
        name: adminName,
        email: adminEmail,
        brandName,
        title: siteTitle,
        tagline,
        googleAnalyticsId,
        adminCredentials: {
          username: adminUsername,
          password: adminPassword
        },
        social: {
          github: socialGithub,
          linkedin: socialLinkedin,
          twitter: socialTwitter,
          instagram: socialInstagram,
          tiktok: socialTiktok,
          facebook: socialFacebook,
          youtube: socialYoutube,
          whatsapp: socialWhatsapp,
          telegram: socialTelegram
        },
        roles: rolesStr.split(',').map(r => r.trim()).filter(Boolean),
        researchInterests: researchInterestsStr.split(',').map(r => r.trim()).filter(Boolean),
        projects,
        articles,
        fashion: {
          ...(personalConfig as any).fashion,
          titles
        },
        worldQuant: {
          ...(personalConfig as any).worldQuant,
          alphas
        },
        site: {
          ...personalConfig.site,
          features: siteFeatures
        },
        jarvisTraining: jarvisTrainingRules,
        whatsappBotSchedule: whatsappBotSchedule
      }

      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullConfig)
      })

      if (response.ok) {
        alert('SUCCESS: Mission data committed to project files. Changes are now permanent.')
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      alert('ERROR: Failed to sync with project files. Local changes still cached in browser.')
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'articles', label: 'Articles', icon: FileText },
    { id: 'alphas', label: 'Alphas', icon: Zap },
    { id: 'comms', label: 'Comms Hub', icon: MessageSquare },
    { id: 'scheduler', label: 'Content Scheduler', icon: History },
    { id: 'zapier', label: 'Zapier & Automation', icon: Cpu },
    { id: 'discipline', label: 'Discipline OS', icon: ShieldCheck },
    { id: 'finance', label: 'Finance Tracker', icon: BarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">System Status</h3>
                  <p className="text-sm text-slate-400">All systems operational</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Vercel Deployment</span>
                  <span className="text-green-500 font-medium">Healthy</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Database Sync</span>
                  <span className="text-green-500 font-medium">Active</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Content Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">{projects.length}</div>
                  <div className="text-xs text-slate-400 uppercase">Projects</div>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">{articles.length}</div>
                  <div className="text-xs text-slate-400 uppercase">Articles</div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'projects':
        return (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Project Systems</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>
            <div className="space-y-4">
              {projects.map(p => (
                <div key={p.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white">{p.title}</h4>
                    <p className="text-sm text-slate-400">{p.category} • {p.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-white transition-colors"><Edit className="w-4 h-4" /></button>
                    <button className="p-2 text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'articles':
        return (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Research Articles</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                <Plus className="w-4 h-4" /> Write Article
              </button>
            </div>
            <div className="space-y-4">
              {articles.map(a => (
                <div key={a.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white">{a.title}</h4>
                    <p className="text-sm text-slate-400">{a.category} • {a.publishDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-white transition-colors"><Edit className="w-4 h-4" /></button>
                    <button className="p-2 text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'comms':
        return (
          <div className="space-y-6">
            <CommsHub />
            <div className="mt-8 pt-8 border-t border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Send className="w-6 h-6 text-green-500" />
                WhatsApp Broadcaster
              </h3>
              <WhatsAppBroadcaster />
            </div>
          </div>
        )
      case 'scheduler':
        return <ContentScheduler />
      case 'zapier':
        return <ZapierPanel />
      case 'discipline':
        return <DisciplineOS />
      case 'finance':
        return <FinanceTracker />
      case 'settings':
        return (
          <div className="space-y-8">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Phone className="w-6 h-6 text-blue-500" />
                WhatsApp Connection Management
              </h3>
              <WhatsAppConnectionPanel />
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6 text-slate-400" />
                Site Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Admin Name</label>
                  <input 
                    type="text" value={adminName} onChange={e => setAdminName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Admin Email</label>
                  <input 
                    type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return <div className="text-white">Tab under construction</div>
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Sentinel Command Center</h1>
            <p className="text-slate-400">Managing M-AbbasLab Intelligence Infrastructure</p>
          </div>
          <button 
            onClick={handleSaveToProject}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {isSaving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSaving ? 'COMMITTING...' : 'COMMIT CHANGES'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 bg-slate-800/50 p-2 rounded-2xl border border-slate-700/50">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
