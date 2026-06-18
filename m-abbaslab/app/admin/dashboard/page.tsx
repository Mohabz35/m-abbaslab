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
  Music2,
  Mail,
  Users,
  FileBarChart,
  Shield,
  Database
} from 'lucide-react'
import { personalConfig } from '@/config/personal'
import FinanceTracker from '@/components/admin/FinanceTracker'
import ContentScheduler from '@/components/admin/ContentScheduler'
import CommsHub from '@/components/admin/CommsHub'
import WhatsAppBroadcaster from '@/components/admin/WhatsAppBroadcaster'
import ZapierPanel from '@/components/admin/ZapierPanel'
import DisciplineOS from '@/components/admin/DisciplineOS'
import WhatsAppConnectionPanel from '@/components/admin/WhatsAppConnectionPanel'
import WorldQuantLab from '@/components/admin/WorldQuantLab'
import ProjectsManager from '@/components/admin/ProjectsManager'
import ArticlesManager from '@/components/admin/ArticlesManager'
import OverviewDashboard from '@/components/admin/OverviewDashboard'
import JarvisHub from '@/components/admin/JarvisHub'
import FashionManager from '@/components/admin/FashionManager'
import RunwayJourneyManager from '@/components/admin/RunwayJourneyManager'
import SettingsHub from '@/components/admin/SettingsHub'
import AdvancedAnalytics from '@/components/admin/AdvancedAnalytics'
import ContactSubmissionsManager from '@/app/admin/messages/page'
import SubscribersManager from '@/app/admin/subscribers/page'
import AnalyticsDashboard from '@/app/admin/analytics/page'
import AdvancedReporting from '@/app/admin/reports/page'
import TeamManagement from '@/app/admin/team/page'
import BackupManagement from '@/app/admin/backups/page'
import AuditLogsSecurity from '@/app/admin/audit-logs/page'

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
  const [siteFeatures, setSiteFeatures] = useState((personalConfig as any).site?.features || { fashion: true, research: true, dev: true, about: true, writing: true, finance: true, jarvis: true, worldQuantLab: true })

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
          setSiteFeatures(config.site?.features || (personalConfig as any).site?.features || { fashion: true, research: true, dev: true, about: true, writing: true, finance: true, jarvis: true, worldQuantLab: true })
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
        roles: rolesStr.split(',').map((r: string) => r.trim()).filter(Boolean),
        researchInterests: researchInterestsStr.split(',').map((r: string) => r.trim()).filter(Boolean),
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
          ...(personalConfig as any).site,
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
    { id: 'jarvishub', label: 'JARVIS HUB', icon: Sparkles },
    { id: 'comms', label: 'Comms Hub', icon: MessageSquare },
    { id: 'scheduler', label: 'Content Scheduler', icon: History },
    { id: 'zapier', label: 'Zapier & Automation', icon: Cpu },
    { id: 'discipline', label: 'Discipline OS', icon: ShieldCheck },
    { id: 'finance', label: 'Finance Tracker', icon: BarChart },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'subscribers', label: 'Subscribers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
    { id: 'fashion', label: 'Fashion', icon: Sparkles },
    { id: 'runway', label: 'Runway', icon: Award },
    { id: 'team', label: 'Team', icon: Shield },
    { id: 'backups', label: 'Backups', icon: Database },
    { id: 'audit', label: 'Audit Logs', icon: AlertTriangle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard />
      case 'projects':
        return <ProjectsManager />
      case 'articles':
        return <ArticlesManager />
      case 'alphas':
        return <WorldQuantLab />
      case 'jarvishub':
        return <JarvisHub />
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
      case 'analytics':
        return <AnalyticsDashboard />
      case 'reports':
        return <AdvancedReporting />
      case 'messages':
        return <ContactSubmissionsManager />
      case 'subscribers':
        return <SubscribersManager />
      case 'team':
        return <TeamManagement />
      case 'backups':
        return <BackupManagement />
      case 'audit':
        return <AuditLogsSecurity />
      case 'fashion':
        return <FashionManager />
      case 'runway':
        return <RunwayJourneyManager />
      case 'settings':
        return <SettingsHub />
      default:
        return <div className="text-white">Tab under construction</div>
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-blue-500/30">
      
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900/60 backdrop-blur-xl border-r border-slate-800 flex flex-col shrink-0 shadow-2xl z-20">
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-bold text-white text-lg">MA</span>
            </div>
            <div>
              <h1 className="font-bold text-white tracking-wide">Sentinel</h1>
              <p className="text-[10px] text-slate-300 uppercase tracking-widest">Command Center</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Core Systems</div>
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const isJarvis = tab.id === 'jarvishub'
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? isJarvis 
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[inset_0_0_12px_rgba(168,85,247,0.1)]'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[inset_0_0_12px_rgba(59,130,246,0.1)]'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? (isJarvis ? 'text-purple-400' : 'text-blue-400') : 'text-slate-400'}`} />
                {tab.label}
              </button>
            )
          })}
        </div>
        
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/40">
          <button 
            onClick={handleSaveToProject}
            disabled={isSaving}
            aria-label="Commit changes to project"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 text-sm"
          >
            {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'COMMITTING...' : 'COMMIT CHANGES'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto h-screen relative bg-[#0B0F19]">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
        
        <div className="p-8 max-w-7xl mx-auto relative z-10">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
