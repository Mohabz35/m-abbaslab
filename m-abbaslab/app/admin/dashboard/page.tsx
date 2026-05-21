// app/admin/dashboard/page.tsx
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
  Trash2
} from 'lucide-react'
import { personalConfig } from '@/config/personal'
import FinanceTracker from '@/components/admin/FinanceTracker'
import ContentScheduler from '@/components/admin/ContentScheduler'
import CommsHub from '@/components/admin/CommsHub'
import WhatsAppBroadcaster from '@/components/admin/WhatsAppBroadcaster'
import ZapierPanel from '@/components/admin/ZapierPanel'
import DisciplineOS from '@/components/admin/DisciplineOS'

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
          setProjects(config.projects || [])
          setArticles(config.articles || [])
          setTitles(config.fashion?.titles || [])
          setAlphas(config.worldQuant?.alphas || [])
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
        console.warn('API load failed, falling back to LocalStorage')
      }

      // Fallback
      const savedProjects = localStorage.getItem('admin_projects')
      const savedArticles = localStorage.getItem('admin_articles')
      const savedTitles = localStorage.getItem('admin_titles')
      const savedAlphas = localStorage.getItem('admin_alphas')
      const savedJarvisTraining = localStorage.getItem('admin_jarvis_training')
      const savedWhatsappBotSchedule = localStorage.getItem('admin_whatsapp_bot_schedule')

      setProjects(savedProjects ? JSON.parse(savedProjects) : personalConfig.projects)
      setArticles(savedArticles ? JSON.parse(savedArticles) : personalConfig.articles)
      setTitles(savedTitles ? JSON.parse(savedTitles) : (personalConfig as any).fashion?.titles || [])
      setAlphas(savedAlphas ? JSON.parse(savedAlphas) : (personalConfig as any).worldQuant?.alphas || [])
      setJarvisTrainingRules(savedJarvisTraining ? JSON.parse(savedJarvisTraining) : (personalConfig as any).jarvisTraining || [])
      setWhatsappBotSchedule(savedWhatsappBotSchedule ? JSON.parse(savedWhatsappBotSchedule) : (personalConfig as any).whatsappBotSchedule || {
        type: 'always',
        workingHoursStart: '08:00',
        workingHoursEnd: '17:00',
        timezone: 'Africa/Nairobi'
      })
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
          ...personalConfig.fashion,
          titles
        },
        worldQuant: {
          ...personalConfig.worldQuant,
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

  // Save to localStorage on changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('admin_projects', JSON.stringify(projects))
      localStorage.setItem('admin_articles', JSON.stringify(articles))
      localStorage.setItem('admin_titles', JSON.stringify(titles))
      localStorage.setItem('admin_alphas', JSON.stringify(alphas))
      localStorage.setItem('admin_jarvis_training', JSON.stringify(jarvisTrainingRules))
      localStorage.setItem('admin_whatsapp_bot_schedule', JSON.stringify(whatsappBotSchedule))
    }
  }, [projects, articles, titles, alphas, jarvisTrainingRules, whatsappBotSchedule, isLoaded])

  // Quant Lab State
  const [alphaExpression, setAlphaExpression] = useState('rank(close_price) / sum(volume, 20)')
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResult, setSimulationResult] = useState<any>(null)

  // Social State
  const [selectedSocialContent, setSelectedSocialContent] = useState<any>(null)
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false)

  // Assistant State
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [assistantMessage, setAssistantMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<any[]>([
    { role: 'assistant', text: 'Welcome Commander Abbas. System diagnostic complete. All modules operational. How can I assist with your mission today?' }
  ])

  // System Integrity State
  const [isScanning, setIsScanning] = useState(false)
  const [integrityScore, setIntegrityScore] = useState(98)
  const [isAutoFixEnabled, setIsAutoFixEnabled] = useState(false)
  const [sentinelLogs, setSentinelLogs] = useState<any[]>([
    { id: 1, type: 'info', msg: 'Sentinel Core initialized.', time: '12:00:00' },
    { id: 2, type: 'success', msg: 'All security certificates valid.', time: '12:00:05' }
  ])

  // Comms Hub State
  const [isTraining, setIsTraining] = useState(false)
  const [isAutoEngaging, setIsAutoEngaging] = useState(false)
  const [personalityProfiles, setPersonalityProfiles] = useState<any[]>([
    { id: 1, name: 'Main Mentor', style: 'Highly Professional & Technical', learnedFrom: 'Mentor_Conv_2024.pdf', active: true },
    { id: 2, name: 'Project Syndicate', style: 'Strategic & Casual', learnedFrom: 'Group_Sync_Jan.pdf', active: true },
    { id: 3, name: 'Brand Outreach', style: 'Enthusiastic & Concise', learnedFrom: 'PR_Campaign_Logs.pdf', active: false }
  ])
  const [socialTrends, setSocialTrends] = useState<any[]>([
    { id: 1, platform: 'tiktok', topic: '#QuantFinance', growth: '+450%', sentiment: 'Positive' },
    { id: 2, platform: 'instagram', topic: 'Fashion AI Runways', growth: '+280%', sentiment: 'Neutral' },
    { id: 3, platform: 'twitter', topic: 'Self-Healing Codebases', growth: '+890%', sentiment: 'Ecstatic' }
  ])
  const [emergencyAlerts, setEmergencyAlerts] = useState<any[]>([])
  const [commsLogs, setCommsLogs] = useState<any[]>([
    { id: 1, type: 'whatsapp', msg: 'Sentinel Core initialized. Secure handshake ready.', time: '12:00:00' }
  ])
  const [connections, setConnections] = useState<any>({
    whatsapp: false,
    instagram: false,
    tiktok: false,
    twitter: false
  })

  // Stats
  const stats = [
    { label: 'Total Projects', value: projects.length, icon: Briefcase, color: 'blue' },
    { label: 'Published Articles', value: articles.filter(a => a.published).length, icon: FileText, color: 'green' },
    { label: 'Modeling Titles', value: titles.length, icon: User, color: 'purple' },
    { label: 'World Quant Alphas', value: (personalConfig as any).worldQuant?.alphas?.length || 0, icon: Brain, color: 'indigo' },
    { label: 'Featured Items', value: [...projects, ...titles].filter(item => item.featured).length, icon: Eye, color: 'amber' }
  ]

  const handleAddProject = () => {
    const newProject = {
      id: `project-${Date.now()}`,
      title: 'New Project',
      description: 'Project description...',
      longDescription: 'Extended project details...',
      technologies: ['Next.js', 'Tailwind'],
      github_url: '#',
      live_url: '#',
      category: 'technology',
      featured: false,
      status: 'In Progress',
      year: new Date().getFullYear().toString()
    }
    setProjects([newProject, ...projects])
  }

  const handleAddArticle = () => {
    const newArticle = {
      id: `article-${Date.now()}`,
      title: 'New Growth Strategy',
      excerpt: 'Exploring new frontiers in AI and finance...',
      publishDate: new Date().toISOString().split('T')[0],
      readTime: '5 min',
      category: 'research',
      published: false,
      tags: ['AI', 'Finance']
    }
    setArticles([newArticle, ...articles])
  }

  const handleAddTitle = () => {
    const newTitle = {
      id: `title-${Date.now()}`,
      title: 'New Achievement',
      year: new Date().getFullYear().toString(),
      description: 'Recognition of excellence in modelling...',
      achievement: 'Winner',
      category: 'fashion',
      featured: false
    }
    setTitles([newTitle, ...titles])
  }

  const handleDeleteItem = (type: 'project' | 'article' | 'title', id: string) => {
    if (confirm('Are you sure you want to delete this mission entry?')) {
      if (type === 'project') setProjects(projects.filter(p => p.id !== id))
      else if (type === 'article') setArticles(articles.filter(a => a.id !== id))
      else if (type === 'title') setTitles(titles.filter(t => t.id !== id))
    }
  }

  const handleUpdateItem = (type: string, id: string, field: string, value: any) => {
    if (type === 'project') {
      setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p))
    } else if (type === 'article') {
      setArticles(articles.map(a => a.id === id ? { ...a, [field]: value } : a))
    } else if (type === 'title') {
      setTitles(titles.map(t => t.id === id ? { ...t, [field]: value } : t))
    }
  }

  const handlePublishToggle = (type: 'project' | 'article' | 'title', id: string) => {
    if (type === 'project') {
      setProjects(projects.map(p =>
        p.id === id ? { ...p, featured: !p.featured } : p
      ))
    } else if (type === 'article') {
      setArticles(articles.map(a =>
        a.id === id ? { ...a, published: !a.published } : a
      ))
    } else {
      setTitles(titles.map(t =>
        t.id === id ? { ...t, featured: !t.featured } : t
      ))
    }
  }

  const handleSimulateAlpha = () => {
    setIsSimulating(true)
    // Simulate backtesting delay
    setTimeout(() => {
      setSimulationResult({
        sharpe: (Math.random() * 2 + 0.5).toFixed(2),
        fitness: (Math.random() * 1.5 + 0.8).toFixed(2),
        returns: (Math.random() * 15 - 2).toFixed(2),
        turnover: (Math.random() * 60 + 10).toFixed(2),
        date: new Date().toLocaleDateString()
      })
      setIsSimulating(false)
    }, 2000)
  }

  const handleTrainAI = () => {
    setIsTraining(true)
    setTimeout(() => {
      setIsTraining(false)
      const newProfile = {
        id: Date.now(),
        name: 'Custom Mentor',
        style: 'Adaptive & Analytical',
        learnedFrom: 'Uploaded_Context.pdf',
        active: true
      }
      setPersonalityProfiles([newProfile, ...personalityProfiles])
      setCommsLogs(prev => [{ id: Date.now(), type: 'system', msg: 'AI Personality "Custom Mentor" successfully trained from PDF.', time: new Date().toLocaleTimeString() }, ...prev])
    }, 3000)
  }

  const handleConnect = (platform: string) => {
    const isConnecting = !connections[platform]
    setConnections({ ...connections, [platform]: isConnecting })
    setCommsLogs(prev => [{
      id: Date.now(),
      type: 'system',
      msg: `${isConnecting ? 'Established secure connection' : 'Disconnected'} from ${platform.toUpperCase()} API gateways.`,
      time: new Date().toLocaleTimeString()
    }, ...prev])
  }

  const handleAlphaSubmit = () => {
    if (!simulationResult) return
    const newAlpha = {
      id: `ALPHA-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `Expression Strategy ${alphas.length + 1}`,
      status: 'Testing',
      sharpe: simulationResult.sharpe,
      fitness: simulationResult.fitness
    }
    setAlphas([newAlpha, ...alphas])
    setSimulationResult(null)
    setAlphaExpression('')
    setSentinelLogs(prev => [{ id: Date.now(), type: 'success', msg: `New Alpha ${newAlpha.id} submitted to pipeline.`, time: new Date().toLocaleTimeString() }, ...prev])
  }

  const handleGenerateSocialContent = (item: any) => {
    setIsGeneratingSocial(true)
    setSelectedSocialContent(item)
    // Simulated AI generation
    setTimeout(() => {
      setIsGeneratingSocial(false)
    }, 1500)
  }

  const handleSocialPost = (platform: string, content: string) => {
    alert(`Published to ${platform}! View mission log for details.`)
    setCommsLogs(prev => [{ id: Date.now(), type: 'social', msg: `Auto-posted to ${platform}: "${content.substring(0, 30)}..."`, time: new Date().toLocaleTimeString() }, ...prev])
  }

  const handleRunSentinelScan = () => {
    setIsScanning(true)
    setSentinelLogs(prev => [{ id: Date.now(), type: 'info', msg: 'Starting full system integrity scan...', time: new Date().toLocaleTimeString() }, ...prev])

    setTimeout(() => {
      const issues = [
        { id: Date.now() + 1, type: 'warning', msg: 'Outdated package: "lucide-react" (v0.344.0 -> v0.400.0)', time: new Date().toLocaleTimeString() },
        { id: Date.now() + 2, type: 'warning', msg: 'Unoptimized image detected: /images/fashion/hero.jpg', time: new Date().toLocaleTimeString() },
        { id: Date.now() + 3, type: 'info', msg: 'Codebase complexity: Optimal (0.82)', time: new Date().toLocaleTimeString() }
      ]
      setSentinelLogs(prev => [...issues, { id: Date.now() + 4, type: 'success', msg: 'Scan complete. 2 warnings found.', time: new Date().toLocaleTimeString() }, ...prev])
      setIntegrityScore(94)
      setIsScanning(false)

      if (isAutoFixEnabled) {
        handleTriggerAutoFix()
      }
    }, 3000)
  }

  const handleTriggerAutoFix = () => {
    setSentinelLogs(prev => [{ id: Date.now(), type: 'fix', msg: 'Autonomous remediation engaged...', time: new Date().toLocaleTimeString() }, ...prev])
    setTimeout(() => {
      setSentinelLogs(prev => [
        { id: Date.now() + 1, type: 'success', msg: 'REFIX: lucide-react updated to v0.400.0', time: new Date().toLocaleTimeString() },
        { id: Date.now() + 2, type: 'success', msg: 'REFIX: Hero image compressed (saved 1.2MB)', time: new Date().toLocaleTimeString() },
        ...prev
      ])
      setIntegrityScore(100)
    }, 2000)
  }

  const [isAssistantTyping, setIsAssistantTyping] = useState(false)

  const handleAssistantSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!assistantMessage.trim() || isAssistantTyping) return

    const userText = assistantMessage
    setAssistantMessage('')

    // Append user message
    const newUserMsg = { role: 'user', text: userText }
    setChatHistory(prev => [...prev, newUserMsg])
    setIsAssistantTyping(true)

    try {
      const statePayload = {
        activeTab,
        projectsCount: projects.length,
        projectsList: projects.map(p => ({ id: p.id, title: p.title, category: p.category, status: p.status })),
        titlesList: titles.map(t => ({ id: t.id, title: t.title, year: t.year, achievement: t.achievement }))
      }

      const res = await fetch('/api/admin/jarvis-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: chatHistory.slice(-10),
          state: statePayload
        })
      })

      if (!res.ok) {
        throw new Error(`Operational gateway offline (${res.status})`)
      }

      const data = await res.json()
      
      // Append Jarvis response text
      if (data.text) {
        setChatHistory(prev => [...prev, { role: 'assistant', text: data.text }])
      }

      // Execute staged dashboard actions
      if (Array.isArray(data.actions)) {
        for (const action of data.actions) {
          console.log('[JARVIS ACTION]', action)
          
          if (action.type === 'NAVIGATE' && action.tab) {
            setActiveTab(action.tab)
          } 
          else if (action.type === 'ADD_PROJECT' && action.project) {
            const newProj = {
              id: `project-${Date.now()}`,
              title: action.project.title || 'Untitled Staged System',
              description: action.project.description || 'System parameters pending documentation...',
              longDescription: action.project.longDescription || 'Staged AI system parameters.',
              technologies: action.project.technologies || ['Next.js', 'AI'],
              github_url: action.project.github_url || '#',
              live_url: action.project.live_url || '#',
              category: action.project.category || 'technology',
              featured: false,
              status: action.project.status || 'In Progress',
              year: action.project.year || new Date().getFullYear().toString()
            }
            setProjects(prev => [newProj, ...prev])
          }
          else if (action.type === 'DELETE_PROJECT' && action.id) {
            setProjects(prev => prev.filter(p => p.id !== action.id))
          }
          else if (action.type === 'ADD_TITLE' && action.title) {
            const newT = {
              id: `title-${Date.now()}`,
              title: action.title.title || 'New Achievement',
              year: action.title.year || new Date().getFullYear().toString(),
              description: action.title.description || 'Recognition of excellence...',
              achievement: action.title.achievement || 'Winner',
              category: action.title.category || 'fashion',
              featured: false
            }
            setTitles(prev => [newT, ...prev])
          }
          else if (action.type === 'TRIGGER_ZAPIER' && action.eventName) {
            // Trigger external automation sequence via endpoint
            fetch('/api/admin/zapier', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ eventName: action.eventName, payload: action.payload || {} })
            }).then(r => console.log('[ZAPIER AUTO-TRIGGER]', r.status))
          }
        }
      }

    } catch (err: any) {
      console.error(err)
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        text: `Commander Abbas, my neural uplink is encountering atmospheric interference: ${err.message || 'Unknown discrepancy'}. Please ensure the OpenRouter API key is stages correctly in production environments.` 
      }])
    } finally {
      setIsAssistantTyping(false)
    }
  }


  const handleSimulateEmergency = () => {
    const alerts = [
      { id: Date.now() + 1, msg: 'Urgent: Financial dispute in Group "Syndicate"', severity: 'high' },
      { id: Date.now() + 2, msg: 'Critical: Brand Mentor requesting immediate call', severity: 'critical' }
    ]
    setEmergencyAlerts(prev => [...alerts, ...prev])
    setCommsLogs(prev => [{ id: Date.now(), type: 'warning', msg: 'Emergency intervention required for 2 threads.', time: new Date().toLocaleTimeString() }, ...prev])
  }

  const handleToggleAutoEngage = (enabled: boolean) => {
    setIsAutoEngaging(enabled)
    const status = enabled ? 'ACTIVATED' : 'DEACTIVATED'
    setCommsLogs(prev => [{ id: Date.now(), type: 'social', msg: `Social Intelligence Auto-Engagement ${status}.`, time: new Date().toLocaleTimeString() }, ...prev])
  }
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'project' | 'article') => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()

      if (data.success) {
        // Construct markdown link (e.g., [document.pdf](/uploads/document.pdf))
        const isImage = file.type.startsWith('image/')
        const markdownLink = `${isImage ? '!' : ''}[${file.name}](${data.url})\n`

        if (targetField === 'project' && selectedEditProject) {
          setSelectedEditProject({
            ...selectedEditProject,
            longDescription: (selectedEditProject.longDescription || '') + '\n' + markdownLink
          })
        } else if (targetField === 'article' && selectedEditArticle) {
          setSelectedEditArticle({
            ...selectedEditArticle,
            content: (selectedEditArticle.content || '') + '\n' + markdownLink
          })
        }
        setSentinelLogs(prev => [{ id: Date.now(), type: 'success', msg: `File ${file.name} uploaded successfully.`, time: new Date().toLocaleTimeString() }, ...prev])
      } else {
        alert('Upload failed: ' + data.error)
      }
    } catch (error) {
      alert('Error uploading file')
    } finally {
      setIsUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your site content and settings
          </p>
        </div>
        <button
          onClick={handleSaveToProject}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${isSaving
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20'
            }`}
        >
          {isSaving ? (
            <RefreshCcw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? 'SYNCING...' : 'COMMIT TO PROJECT'}
        </button>
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
        <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
          {['overview', 'zapier-automations', 'finance-tracker', 'content-scheduler', 'projects', 'articles', 'modeling', 'world-quant', 'social-media', 'comms-hub', 'system-integrity', 'skills', 'settings', 'discipline-os'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
            >
              {tab === 'discipline-os' ? 'Discipline OS' : tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'zapier-automations' && <ZapierPanel />}
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

              <button
                onClick={handleAddArticle}
                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Write Article</h3>
                  <p className="text-sm text-gray-500">Publish new article</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('social-media')
                  setIsAssistantOpen(true)
                }}
                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
                  <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">AI Assistant</h3>
                  <p className="text-sm text-gray-500">Ask Mission Assistant</p>
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

        {activeTab === 'finance-tracker' && (
          <div className="space-y-4">
            <FinanceTracker />
          </div>
        )}

        {activeTab === 'content-scheduler' && (
          <div className="space-y-4">
            <ContentScheduler />
            <WhatsAppBroadcaster />
          </div>
        )}

        {(activeTab === 'comms-hub' || activeTab === 'jarvis-inbox' || activeTab === 'jarvis-brain') && <CommsHub />}

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
                        {editingItem?.id === project.id && editingItem?.field === 'title' ? (
                          <input
                            value={project.title}
                            onChange={(e) => handleUpdateItem('project', project.id, 'title', e.target.value)}
                            onBlur={() => setEditingItem(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingItem(null)}
                            autoFocus
                            className="bg-transparent border-b border-blue-500 outline-none w-full font-medium"
                          />
                        ) : (
                          <div
                            className="font-medium cursor-pointer hover:text-blue-500"
                            onClick={() => setEditingItem({ type: 'project', id: project.id, field: 'title' })}
                          >
                            {project.title}
                          </div>
                        )}
                        {editingItem?.id === project.id && editingItem?.field === 'description' ? (
                          <input
                            value={project.description}
                            onChange={(e) => handleUpdateItem('project', project.id, 'description', e.target.value)}
                            onBlur={() => setEditingItem(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingItem(null)}
                            autoFocus
                            className="bg-transparent border-b border-gray-400 outline-none w-full text-xs text-gray-500"
                          />
                        ) : (
                          <div
                            className="text-xs text-gray-500 cursor-pointer hover:text-gray-700"
                            onClick={() => setEditingItem({ type: 'project', id: project.id, field: 'description' })}
                          >
                            {project.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                          {project.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${project.featured ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          <span>{project.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedEditProject(project)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-500"
                            title="Edit Project & Documentation"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePublishToggle('project', project.id)}
                            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${project.featured ? 'text-amber-500' : 'text-gray-400'}`}
                            title="Toggle Featured"
                          >
                            <Award className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem('project', project.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {activeTab === 'articles' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Articles ({articles.length})</h2>
              <button
                onClick={handleAddArticle}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Plus className="w-4 h-4" />
                Write Article
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
                  {articles.map((article) => (
                    <tr key={article.id}>
                      <td className="px-6 py-4 text-xs">
                        {editingItem?.id === article.id && editingItem?.field === 'title' ? (
                          <input
                            value={article.title}
                            onChange={(e) => handleUpdateItem('article', article.id, 'title', e.target.value)}
                            onBlur={() => setEditingItem(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingItem(null)}
                            autoFocus
                            className="bg-transparent border-b border-green-500 outline-none w-full font-bold"
                          />
                        ) : (
                          <div
                            className="font-bold cursor-pointer hover:text-green-500"
                            onClick={() => setEditingItem({ type: 'article', id: article.id, field: 'title' })}
                          >
                            {article.title}
                          </div>
                        )}
                        {editingItem?.id === article.id && editingItem?.field === 'excerpt' ? (
                          <textarea
                            value={article.excerpt}
                            onChange={(e) => handleUpdateItem('article', article.id, 'excerpt', e.target.value)}
                            onBlur={() => setEditingItem(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingItem(null)}
                            autoFocus
                            className="bg-transparent border border-gray-300 dark:border-gray-600 rounded p-1 outline-none w-full text-xs text-gray-500 mt-1"
                          />
                        ) : (
                          <div
                            className="text-xs text-gray-400 mt-1 cursor-pointer hover:text-gray-300 italic"
                            onClick={() => setEditingItem({ type: 'article', id: article.id, field: 'excerpt' })}
                          >
                            {article.excerpt}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                          {article.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${article.published ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          <span>{article.published ? 'Published' : 'Draft'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedEditArticle(article)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-500"
                            title="Edit Article Content"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePublishToggle('article', article.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-emerald-500"
                            title={article.published ? 'Unpublish' : 'Publish'}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem('article', article.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {activeTab === 'modeling' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Modeling & Media ({titles.length})</h2>
              <button
                onClick={handleAddTitle}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                <Plus className="w-4 h-4" />
                Add Achievement
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Title / Award</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {titles.map((title) => (
                    <tr key={title.id}>
                      <td className="px-6 py-4">
                        {editingItem?.id === title.id && editingItem?.field === 'title' ? (
                          <input
                            value={title.title}
                            onChange={(e) => handleUpdateItem('title', title.id, 'title', e.target.value)}
                            onBlur={() => setEditingItem(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingItem(null)}
                            autoFocus
                            className="bg-transparent border-b border-purple-500 outline-none w-full font-bold text-xs"
                          />
                        ) : (
                          <div
                            className="font-bold text-xs cursor-pointer hover:text-purple-500"
                            onClick={() => setEditingItem({ type: 'title', id: title.id, field: 'title' })}
                          >
                            {title.title}
                          </div>
                        )}
                        {editingItem?.id === title.id && editingItem?.field === 'achievement' ? (
                          <input
                            value={title.achievement}
                            onChange={(e) => handleUpdateItem('title', title.id, 'achievement', e.target.value)}
                            onBlur={() => setEditingItem(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingItem(null)}
                            autoFocus
                            className="bg-transparent border-b border-gray-400 outline-none w-full text-[10px] text-gray-500 mt-1 uppercase"
                          />
                        ) : (
                          <div
                            className="text-[10px] text-gray-500 mt-1 cursor-pointer hover:text-gray-400 uppercase tracking-widest"
                            onClick={() => setEditingItem({ type: 'title', id: title.id, field: 'achievement' })}
                          >
                            {title.achievement}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {title.year}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded capitalize">
                          {title.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingItem({ type: 'title', id: title.id, field: 'title' })}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-500"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePublishToggle('title', title.id)}
                            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${title.featured ? 'text-amber-500' : 'text-gray-400'}`}
                            title="Toggle Featured"
                          >
                            <Award className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem('title', title.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* World Quant Research Lab Tab */}
        {activeTab === 'world-quant' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card & Lab Control */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-xl p-6 text-white shadow-xl border border-indigo-500/30">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-white/10 rounded-lg">
                      <Brain className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">RESEARCH LAB</h3>
                      <p className="text-indigo-200 text-xs">WorldQuant Brain Integration</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <span className="text-indigo-200 italic">Operator</span>
                      <span className="font-mono">{(personalConfig as any).worldQuant?.username}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <span className="text-indigo-200">Clearance</span>
                      <span className="font-medium text-amber-400">{(personalConfig as any).worldQuant?.rank}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-200">Global Ranking</span>
                      <span className="font-mono text-green-400">#{(personalConfig as any).worldQuant?.statistics?.globalRank}</span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <a
                      href="https://worldquantbrain.com"
                      target="_blank"
                      className="w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/50 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      PLATFORM ACCESS <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Live Market Feed
                  </h4>
                  <div className="space-y-3">
                    {[
                      { s: 'AAPL', p: '182.52', c: '+1.2%' },
                      { s: 'BTC/USD', p: '64,231', c: '-0.4%' },
                      { s: 'TSLA', p: '175.40', c: '+2.8%' }
                    ].map(stock => (
                      <div key={stock.s} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                        <span className="font-mono font-bold text-xs">{stock.s}</span>
                        <div className="text-right">
                          <div className="text-xs font-mono">{stock.p}</div>
                          <div className={`text-[10px] ${stock.c.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{stock.c}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Research & Simulation Area */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <FlaskConical className="w-5 h-5 text-indigo-500" />
                      Alpha Expression Tester
                    </h3>
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-mono uppercase">
                      V4.0 SIMULATOR
                    </span>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-10 group-focus-within:opacity-25 transition duration-1000"></div>
                    <textarea
                      value={alphaExpression}
                      onChange={(e) => setAlphaExpression(e.target.value)}
                      className="relative w-full h-32 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                      placeholder="Enter alpha expression (e.g. rank(close) / volume)"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">Load Template</button>
                      <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">Clear</button>
                    </div>
                    <button
                      onClick={handleSimulateAlpha}
                      disabled={isSimulating}
                      className={`flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 ${isSimulating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isSimulating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          RUNNING BACKTEST...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          RUN SIMULATION
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Simulation Result */}
                {simulationResult ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-gray-500 uppercase tracking-widest text-xs">Simulation Statistics ({simulationResult.date})</h3>
                      <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
                        <CheckCircle className="w-4 h-4" />
                        VALID FOR SUBMISSION
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div className="text-[10px] text-gray-500 uppercase mb-1">Sharpe</div>
                        <div className="text-2xl font-mono font-bold text-indigo-500">{simulationResult.sharpe}</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div className="text-[10px] text-gray-500 uppercase mb-1">Fitness</div>
                        <div className="text-2xl font-mono font-bold text-green-500">{simulationResult.fitness}</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div className="text-[10px] text-gray-500 uppercase mb-1">Returns</div>
                        <div className="text-2xl font-mono font-bold text-blue-500">{simulationResult.returns}%</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div className="text-[10px] text-gray-500 uppercase mb-1">Turnover</div>
                        <div className="text-2xl font-mono font-bold text-purple-500">{simulationResult.turnover}%</div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Award className="w-6 h-6 text-indigo-500" />
                        <div>
                          <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Alpha Qualified for Submission</p>
                          <p className="text-xs text-indigo-700 dark:text-indigo-400">This strategy meets the criteria for Researcher evaluation.</p>
                        </div>
                      </div>
                      <button
                        onClick={handleAlphaSubmit}
                        className="px-4 py-2 bg-indigo-600 text-white rounded font-bold text-xs hover:bg-indigo-700"
                      >
                        SUBMIT ALPHA
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 bg-gray-50/50 dark:bg-gray-900/20 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl grayscale opacity-50">
                    <FlaskConical className="w-12 h-12 mb-4" />
                    <p className="text-sm font-medium">Ready for Alpha Simulation</p>
                    <p className="text-xs text-gray-500">Enter a mathematical expression above and run the backtester.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Strategy History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-500" />
                  Alpha Submission Life-Cycle
                </h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-[10px] uppercase text-gray-400">
                  <tr>
                    <th className="px-6 py-3 text-left">Strategy ID</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Sharpe</th>
                    <th className="px-6 py-3 text-left">Fitness</th>
                    <th className="px-6 py-3 text-right">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {alphas.map((alpha: any) => (
                    <tr key={alpha.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs font-bold">{alpha.id}</div>
                        <div className="text-[10px] text-gray-500">{alpha.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${alpha.status === 'Testing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                          alpha.status === 'Development' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' :
                            'bg-gray-100 text-gray-600 dark:bg-gray-800'
                          }`}>
                          {alpha.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">1.52</td>
                      <td className="px-6 py-4 font-mono text-xs">0.95</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full bg-indigo-500 ${alpha.status === 'Testing' ? 'w-3/4' : 'w-1/4'}`} />
                          </div>
                          <button className="text-gray-400 hover:text-blue-500"><Plus className="w-3 h-3" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Social Media Automator Tab */}
        {activeTab === 'social-media' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Content Selector Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Select Source</h3>
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-400 mb-1 uppercase px-2 font-bold">Featured Projects</p>
                    {projects.filter(p => p.featured).map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleGenerateSocialContent(p)}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${selectedSocialContent?.id === p.id ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                      >
                        {p.title}
                      </button>
                    ))}
                    <div className="h-4" />
                    <p className="text-[10px] text-gray-400 mb-1 uppercase px-2 font-bold">Latest Articles</p>
                    {articles.slice(0, 3).map(a => (
                      <button
                        key={a.id}
                        onClick={() => handleGenerateSocialContent(a)}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${selectedSocialContent?.id === a.id ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                      >
                        {a.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-500/30">
                    <Share2 className="w-6 h-6 text-pink-500" />
                  </div>
                  <h4 className="text-sm font-bold mb-1">Growth Engine</h4>
                  <p className="text-[10px] text-gray-500">TikTok algorithm prioritized for cross-platform expansion.</p>
                </div>
              </div>

              {/* Generator Canvas */}
              <div className="lg:col-span-3 space-y-6">
                {selectedSocialContent ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>

                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div>
                        <span className="text-[10px] text-blue-500 dark:text-blue-400 font-bold uppercase tracking-widest">{selectedSocialContent.category || 'Content'}</span>
                        <h2 className="text-2xl font-bold">{selectedSocialContent.title}</h2>
                        <p className="text-sm text-gray-500 mt-1 max-w-xl">{selectedSocialContent.description || selectedSocialContent.excerpt}</p>
                      </div>
                      <button
                        onClick={() => handleGenerateSocialContent(selectedSocialContent)}
                        className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all flex items-center gap-2 ${isGeneratingSocial ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {isGeneratingSocial ? <Activity className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        RE-GENERATE AI CONTENT
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                      {/* TikTok (Main Growth) */}
                      <div className="bg-black text-white p-6 rounded-2xl border border-white/10 shadow-2xl">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                            <span className="font-bold text-xs">t</span>
                          </div>
                          <span className="text-xs font-bold tracking-widest uppercase">TIKTOK (Growth Engine)</span>
                          <span className="ml-auto text-[10px] bg-red-500 px-1 rounded animate-pulse">TRENDING</span>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                          <p className="text-sm italic text-gray-300">"POV: You just unlocked the future of {selectedSocialContent.title}. 🚀 Data doesn't lie. #MAbbasLab #TechTrends #TikTokKenya"</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleSocialPost('TikTok', `POV: You just unlocked the future of ${selectedSocialContent.title}`)}
                            className="text-[10px] font-bold py-1 px-3 bg-white text-black rounded"
                          >
                            Post Now
                          </button>
                        </div>
                      </div>

                      {/* LinkedIn */}
                      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <Linkedin className="w-5 h-5 text-blue-600" />
                          <span className="text-xs font-bold tracking-widest uppercase text-gray-500">LINKEDIN (Professional)</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                          <p className="text-sm font-medium">I'm thrilled to announce the latest iteration of {selectedSocialContent.title}. Bridging the gap between theory and application. #ProfessionalGrowth #Innovation</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleSocialPost('LinkedIn', `I'm thrilled to announce the latest iteration of ${selectedSocialContent.title}`)}
                            className="text-[10px] font-bold py-1 px-3 bg-blue-600 text-white rounded"
                          >
                            Post Now
                          </button>
                        </div>
                      </div>

                      {/* Instagram */}
                      <div className="bg-gradient-to-tr from-yellow-400/5 via-pink-500/5 to-purple-600/5 p-6 rounded-2xl border border-pink-500/10 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <Instagram className="w-5 h-5 text-pink-500" />
                          <span className="text-xs font-bold tracking-widest uppercase text-gray-500">INSTAGRAM (Visual)</span>
                        </div>
                        <div className="bg-white dark:bg-black/20 p-4 rounded-xl border border-pink-500/5">
                          <p className="text-sm">Aesthetics meet Analytics. ✨ High-performance systems for a multidisciplinary future. #MAbbasLab #StyleAndCode</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleSocialPost('Instagram', `Aesthetics meet Analytics. ✨ High-performance systems for a multidisciplinary future.`)}
                            className="text-[10px] font-bold py-1 px-3 bg-pink-600 text-white rounded"
                          >
                            Post Now
                          </button>
                        </div>
                      </div>

                      {/* Twitter / X */}
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <Twitter className="w-5 h-5 text-blue-400" />
                          <span className="text-xs font-bold tracking-widest uppercase text-gray-500">TWITTER/X (Direct)</span>
                        </div>
                        <div className="bg-white dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-gray-800 font-mono">
                          <p className="text-sm">Just deployed {selectedSocialContent.title}. The data pipeline is smooth. Research-driven impact. 🧵👇 #MAbbasLab #Build</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleSocialPost('Twitter/X', `Just deployed ${selectedSocialContent.title}. The data pipeline is smooth.`)}
                            className="text-[10px] font-bold py-1 px-3 bg-black text-white dark:bg-white dark:text-black rounded"
                          >
                            Post Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-24 bg-gray-50/50 dark:bg-gray-900/20 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 border border-gray-200 dark:border-gray-700">
                      <Sparkles className="w-10 h-10 text-gray-300 animate-pulse" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-400">Social Media Automator</h2>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm text-center">Select a project or article from the sidebar to generate AI-tailored content for your social media channels.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* System Integrity (Autonomous Core) Tab */}
        {activeTab === 'system-integrity' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overall Health Card */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center relative overflow-hidden">
                  {/* Background Pulse */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${integrityScore > 90 ? 'from-green-500/5 to-emerald-500/5' : 'from-amber-500/5 to-orange-500/5'} z-0`}></div>

                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-full mb-6 border-4 border-gray-100 dark:border-gray-800">
                      <div className="relative">
                        <ShieldCheck className={`w-16 h-16 ${integrityScore > 90 ? 'text-green-500' : 'text-amber-500'}`} />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
                      </div>
                    </div>
                    <h3 className="text-3xl font-black font-mono">{integrityScore}%</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">System Integrity Index</p>

                    <div className="mt-8 space-y-2">
                      <button
                        onClick={handleRunSentinelScan}
                        disabled={isScanning}
                        className={`w-full py-3 ${isScanning ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' : 'bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02]'} rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2`}
                      >
                        {isScanning ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
                        RUN SENTINEL DIAGNOSTIC
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-500" />
                      <h4 className="text-sm font-bold">Autonomous Core</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAutoFixEnabled}
                        onChange={(e) => setIsAutoFixEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed italic">
                    When enabled, the Sentinel will automatically apply non-breaking fixes for dependency vulnerabilities, unoptimized assets, and syntax minor regressions.
                  </p>
                </div>
              </div>

              {/* Live Logs & Sentinel Feed */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-black/95 text-green-500 rounded-xl border border-gray-200 dark:border-gray-800 p-6 font-mono text-xs h-[400px] flex flex-col shadow-2xl">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
                    <span className="flex items-center gap-2">
                      <Terminal className="w-4 h-4" />
                      SENTINEL_LIVE_FEED v4.2.0
                    </span>
                    <span className="text-[10px] text-gray-600">ENCRYPTION: AES-256</span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                    {sentinelLogs.map(log => (
                      <div key={log.id} className="flex gap-4">
                        <span className="text-gray-700">[{log.time}]</span>
                        <span className={`
                          ${log.type === 'error' ? 'text-red-500' : ''}
                          ${log.type === 'warning' ? 'text-amber-500' : ''}
                          ${log.type === 'success' ? 'text-emerald-500' : ''}
                          ${log.type === 'fix' ? 'text-blue-400 font-bold animate-pulse' : ''}
                          ${log.type === 'info' ? 'text-blue-200' : ''}
                        `}>
                          {log.type === 'fix' ? '>>> ' : ''}{log.msg}
                        </span>
                      </div>
                    ))}
                    {isScanning && (
                      <div className="flex gap-4 animate-pulse">
                        <span className="text-gray-700">[{new Date().toLocaleTimeString()}]</span>
                        <span className="text-blue-400">ANALYZING CODE STRUCTURE...</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Lock className="w-3 h-3" />
                      <span className="text-[10px] uppercase font-bold">Security</span>
                    </div>
                    <div className="text-lg font-bold">Hardened</div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Zap className="w-3 h-3" />
                      <span className="text-[10px] uppercase font-bold">Performance</span>
                    </div>
                    <div className="text-lg font-bold">98/100</div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Activity className="w-3 h-3" />
                      <span className="text-[10px] uppercase font-bold">Uptime</span>
                    </div>
                    <div className="text-lg font-bold text-emerald-500 tracking-widest">99.9%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legacy Communications Hub Tab */}
        {activeTab === 'comms-hub-legacy' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* WhatsApp AI Trainer */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <MessageCircle className="w-5 h-5 text-green-500" />
                    <h3 className="font-bold">WhatsApp AI Trainer</h3>
                  </div>

                  <div className="space-y-4">
                    <div
                      onClick={handleTrainAI}
                      className={`border-2 border-dashed ${isTraining ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700'} rounded-xl p-8 text-center hover:border-green-500/50 transition-colors cursor-pointer group mb-4`}
                    >
                      {isTraining ? (
                        <RefreshCcw className="w-8 h-8 text-green-500 animate-spin mb-2 mx-auto" />
                      ) : (
                        <FileUp className="w-8 h-8 text-gray-400 group-hover:text-green-500 mb-2 mx-auto transition-colors" />
                      )}
                      <p className="text-xs font-medium">{isTraining ? 'PROCESSING PDF CONTEXT...' : 'Drop Chat History PDF'}</p>
                      <p className="text-[10px] text-gray-500 mt-1">Train AI on personal conversation styles</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-3 tracking-widest">Active Personalities</h4>
                      <div className="space-y-3">
                        {personalityProfiles.map(profile => (
                          <div key={profile.id} className="flex items-center justify-between group">
                            <div>
                              <p className="text-xs font-bold">{profile.name}</p>
                              <p className="text-[10px] text-gray-500">{profile.style}</p>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${profile.active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}`}></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" />
                      CREATE NEW PERSONALITY
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-blue-500" />
                      <h4 className="text-sm font-bold">Comms History</h4>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {commsLogs.map(log => (
                      <div key={log.id} className="text-[10px] border-l-2 border-blue-500/30 pl-3 py-1">
                        <span className="text-gray-400 mr-2">[{log.time}]</span>
                        <span className="font-bold text-blue-500 uppercase mr-2">{log.type}:</span>
                        <span className="text-gray-600 dark:text-gray-300">{log.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social Intel & Trending Engine */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-gray-400">AUTO-ENGAGE</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAutoEngaging}
                          onChange={(e) => handleToggleAutoEngage(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
                      </label>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
                    <Hash className="w-5 h-5 text-pink-500" />
                    Social Intel & Trend Analyzer
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {socialTrends.map(trend => (
                      <div key={trend.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-pink-500/30 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            {trend.platform === 'tiktok' && <Share2 className="w-4 h-4 text-black dark:text-white" />}
                            {trend.platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-500" />}
                            {trend.platform === 'twitter' && <Twitter className="w-4 h-4 text-blue-400" />}
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{trend.platform}</span>
                          </div>
                          <span className="text-[10px] font-mono text-green-500 bg-green-500/10 px-2 py-0.5 rounded">{trend.growth}</span>
                        </div>
                        <h4 className="text-sm font-bold mb-1">{trend.topic}</h4>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex gap-2">
                            <button className="p-1.5 hover:bg-pink-500/10 rounded-lg transition-colors">
                              <Heart className="w-3.5 h-3.5 text-gray-400 group-hover:text-pink-500" />
                            </button>
                            <button className="p-1.5 hover:bg-blue-500/10 rounded-lg transition-colors">
                              <MessageSquare className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500" />
                            </button>
                          </div>
                          <span className="text-[9px] text-gray-500">Sentiment: <span className="text-gray-900 dark:text-gray-100 font-bold">{trend.sentiment}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="text-xs font-bold mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Priority Intervention Requests
                    </h4>
                    {emergencyAlerts.length === 0 ? (
                      <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 text-center cursor-pointer" onClick={handleSimulateEmergency}>
                        <p className="text-[10px] text-green-600 dark:text-green-400 italic">No emergencies detected. AI is handling all communications within parameters. (Click to simulate)</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {emergencyAlerts.map((alert, i) => (
                          <div key={i} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between">
                            <p className="text-[10px] font-bold text-amber-600 uppercase">{alert.msg}</p>
                            <button
                              onClick={() => setEmergencyAlerts(prev => prev.filter((_, idx) => idx !== i))}
                              className="px-3 py-1 bg-amber-500 text-white rounded text-[9px] font-bold"
                            >
                              TAKEOVER
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-8 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Headset className="w-24 h-24" />
                  </div>
                  <div className="relative z-10 max-w-md">
                    <h3 className="text-xl font-bold mb-2">Omni-Channel Intelligence</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-6">
                      Your AI is currently monitoring active gateways. It reacts to trends, maintains your professional style, and only interrupts you for true emergencies.
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {['whatsapp', 'instagram', 'tiktok', 'twitter'].map(platform => (
                        <button
                          key={platform}
                          onClick={() => handleConnect(platform)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${connections[platform]
                            ? 'bg-green-500/20 border-green-500/50 text-green-400'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                          <span className="capitalize">{platform}</span>
                          <span>{connections[platform] ? 'Connected' : 'Connect'}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <div className="text-lg font-mono font-bold text-pink-500">124</div>
                        <div className="text-[8px] uppercase tracking-widest text-gray-500">Auto Likes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-mono font-bold text-blue-400">42</div>
                        <div className="text-[8px] uppercase tracking-widest text-gray-500">Responses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-mono font-bold text-green-500">0</div>
                        <div className="text-[8px] uppercase tracking-widest text-gray-500">Emergencies</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skills Evaluation Tab */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries((personalConfig as any).skills).map(([category, items]: [string, any]) => (
                <div key={category} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold capitalize mb-4">{category}</h3>
                  <div className="space-y-3">
                    {items.map((skill: string) => (
                      <div key={skill} className="flex items-center justify-between group">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{skill}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded text-green-600">
                            <CheckCircle className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 py-2 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    + Add Skill
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Site Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold font-mono uppercase tracking-tighter">System Configuration</h2>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Global parameters for the M-AbbasLab ecosystem</p>
            </div>

            <div className="p-6 space-y-8">
              {/* BRANDING & IDENTITY */}
              <div>
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  BRANDING & IDENTITY
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Primary Entity Name</label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Brand Name</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Professional Title</label>
                    <input
                      type="text"
                      value={siteTitle}
                      onChange={(e) => setSiteTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Tagline / Pitch</label>
                    <textarea
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Secure Contact Email</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Google Analytics Measure ID</label>
                    <input
                      type="text"
                      value={googleAnalyticsId}
                      onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* CREDENTIALS */}
              <div>
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-500" />
                  ADMIN CREDENTIALS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Username</label>
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full px-4 py-2 border border-rose-200 dark:border-rose-900/30 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-rose-500 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Password</label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-rose-200 dark:border-rose-900/30 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-rose-500 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* SOCIAL LINKS */}
              <div>
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-500" />
                  SOCIAL MEDIA ECOSYSTEM
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">GitHub URL</label>
                    <input
                      type="text"
                      value={socialGithub}
                      onChange={(e) => setSocialGithub(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">LinkedIn URL</label>
                    <input
                      type="text"
                      value={socialLinkedin}
                      onChange={(e) => setSocialLinkedin(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">X / Twitter URL</label>
                    <input
                      type="text"
                      value={socialTwitter}
                      onChange={(e) => setSocialTwitter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Instagram URL</label>
                    <input
                      type="text"
                      value={socialInstagram}
                      onChange={(e) => setSocialInstagram(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">TikTok URL</label>
                    <input
                      type="text"
                      value={socialTiktok}
                      onChange={(e) => setSocialTiktok(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Facebook URL</label>
                    <input
                      type="text"
                      value={socialFacebook}
                      onChange={(e) => setSocialFacebook(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">YouTube Channel URL</label>
                    <input
                      type="text"
                      value={socialYoutube}
                      onChange={(e) => setSocialYoutube(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">WhatsApp Direct Link</label>
                    <input
                      type="text"
                      value={socialWhatsapp}
                      onChange={(e) => setSocialWhatsapp(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Telegram Username URL</label>
                    <input
                      type="text"
                      value={socialTelegram}
                      onChange={(e) => setSocialTelegram(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* TAXONOMY */}
              <div>
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-500" />
                  PROFESSIONAL TAXONOMY
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Roles (Comma Separated)</label>
                    <input
                      type="text"
                      value={rolesStr}
                      onChange={(e) => setRolesStr(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Research Interests (Comma Separated)</label>
                    <input
                      type="text"
                      value={researchInterestsStr}
                      onChange={(e) => setResearchInterestsStr(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* INTERFACE SWITCHES */}
              <div>
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  INTERFACE MODULES
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-500 transition-all group">
                    <span className="text-xs font-bold uppercase group-hover:text-blue-500">Dark Mode Interface</span>
                    <input
                      type="checkbox"
                      checked={siteFeatures.darkMode}
                      onChange={(e) => setSiteFeatures({ ...siteFeatures, darkMode: e.target.checked })}
                      className="w-5 h-5 rounded-full text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-500 transition-all group">
                    <span className="text-xs font-bold uppercase group-hover:text-blue-500">Kinetic Animations</span>
                    <input
                      type="checkbox"
                      checked={siteFeatures.animations}
                      onChange={(e) => setSiteFeatures({ ...siteFeatures, animations: e.target.checked })}
                      className="w-5 h-5 rounded-full text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-500 transition-all group">
                    <span className="text-xs font-bold uppercase group-hover:text-blue-500">WebGL Energy Matrix</span>
                    <input
                      type="checkbox"
                      checked={siteFeatures.webGLBackground}
                      onChange={(e) => setSiteFeatures({ ...siteFeatures, webGLBackground: e.target.checked })}
                      className="w-5 h-5 rounded-full text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-4 py-2 rounded-full uppercase tracking-tighter shadow-sm">
                  <Award className="w-3 h-3" />
                  Configuration staged in local memory. Commit required for deployment.
                </div>
                <button
                  onClick={handleSaveToProject}
                  disabled={isSaving}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'DEPLOYING...' : 'COMMIT CHANGES'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'discipline-os' && (
          <DisciplineOS />
        )}
      </div>

      {/* Floating Mission Assistant */}
      <div className="fixed bottom-8 right-8 z-50">
        {!isAssistantOpen ? (
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform border-4 border-white dark:border-gray-900"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[500px] animate-in slide-in-from-bottom-4">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                <span className="font-bold text-sm uppercase tracking-wider">Mission Assistant</span>
              </div>
              <button onClick={() => setIsAssistantOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors text-white">
                <Minus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50 min-h-[300px]">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-none shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAssistantTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-2xl text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-none shadow-sm flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-gray-400 italic text-[10px]">Neural uplink active...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={assistantMessage}
                  onChange={(e) => setAssistantMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAssistantSubmit()}
                  placeholder="Type a command..."
                  className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleAssistantSubmit()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Project Edit Modal */}
      {selectedEditProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div>
                <h3 className="text-lg font-bold font-mono uppercase">Edit Project Documentation</h3>
                <p className="text-xs text-gray-500">Configure parameters and developer docs for this system</p>
              </div>
              <button 
                onClick={() => setSelectedEditProject(null)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Title & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Project Title</label>
                  <input
                    type="text"
                    value={selectedEditProject.title}
                    onChange={(e) => setSelectedEditProject({ ...selectedEditProject, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Category</label>
                  <input
                    type="text"
                    value={selectedEditProject.category}
                    onChange={(e) => setSelectedEditProject({ ...selectedEditProject, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-xs uppercase"
                  />
                </div>
              </div>

              {/* Status & Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Development Status</label>
                  <input
                    type="text"
                    value={selectedEditProject.status}
                    onChange={(e) => setSelectedEditProject({ ...selectedEditProject, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Deployment/Launch Year</label>
                  <input
                    type="text"
                    value={selectedEditProject.year}
                    onChange={(e) => setSelectedEditProject({ ...selectedEditProject, year: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>
              </div>

              {/* GitHub & Live URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">GitHub Repository URL</label>
                  <input
                    type="text"
                    value={selectedEditProject.github_url}
                    onChange={(e) => setSelectedEditProject({ ...selectedEditProject, github_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Live Demo / Production URL</label>
                  <input
                    type="text"
                    value={selectedEditProject.live_url}
                    onChange={(e) => setSelectedEditProject({ ...selectedEditProject, live_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Short Description (Intro)</label>
                <input
                  type="text"
                  value={selectedEditProject.description}
                  onChange={(e) => setSelectedEditProject({ ...selectedEditProject, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              {/* Technologies */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Technologies / Skills Fused (Comma separated)</label>
                <input
                  type="text"
                  value={Array.isArray(selectedEditProject.technologies) ? selectedEditProject.technologies.join(', ') : selectedEditProject.technologies || ''}
                  onChange={(e) => setSelectedEditProject({ ...selectedEditProject, technologies: e.target.value.split(',').map((t: string) => t.trim()) })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono"
                  placeholder="React, Next.js, AI, Statistics"
                />
              </div>

              {/* Long Description (Extended Project Documentation) */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Extended Project Documentation / Technical Specs (Markdown Supported)</label>
                  <label className="cursor-pointer px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-bold uppercase hover:bg-blue-200 transition-colors flex items-center gap-1">
                    <FileUp className="w-3 h-3" />
                    {isUploading ? 'UPLOADING...' : 'UPLOAD DOC/MEDIA'}
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'project')} />
                  </label>
                </div>
                <textarea
                  rows={8}
                  value={selectedEditProject.longDescription || ''}
                  onChange={(e) => setSelectedEditProject({ ...selectedEditProject, longDescription: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono resize-y"
                  placeholder="Provide deep technical architecture, files built, expected improvements, hard-coded parameters, and APIs integrated..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 sticky bottom-0 z-10">
              <button
                onClick={() => setSelectedEditProject(null)}
                className="px-5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setProjects(projects.map(p => p.id === selectedEditProject.id ? selectedEditProject : p))
                  setSelectedEditProject(null)
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:shadow-lg transition-all text-sm"
              >
                Apply Updates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article Edit Modal */}
      {selectedEditArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div>
                <h3 className="text-lg font-bold font-mono uppercase">Write & Edit Article</h3>
                <p className="text-xs text-gray-500">Draft rich editorial, technical posts, or mathematical analysis</p>
              </div>
              <button 
                onClick={() => setSelectedEditArticle(null)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Title & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Article Title</label>
                  <input
                    type="text"
                    value={selectedEditArticle.title}
                    onChange={(e) => setSelectedEditArticle({ ...selectedEditArticle, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Category</label>
                  <input
                    type="text"
                    value={selectedEditArticle.category}
                    onChange={(e) => setSelectedEditArticle({ ...selectedEditArticle, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-xs uppercase"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Short Excerpt (Summary)</label>
                <input
                  type="text"
                  value={selectedEditArticle.excerpt}
                  onChange={(e) => setSelectedEditArticle({ ...selectedEditArticle, excerpt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Tags / Hashtags (Comma separated)</label>
                <input
                  type="text"
                  value={Array.isArray(selectedEditArticle.tags) ? selectedEditArticle.tags.join(', ') : selectedEditArticle.tags || ''}
                  onChange={(e) => setSelectedEditArticle({ ...selectedEditArticle, tags: e.target.value.split(',').map((t: string) => t.trim()) })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono"
                  placeholder="Economics, Statistics, AI, Machine Learning"
                />
              </div>

              {/* Article Content */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Complete Article Content (Markdown Supported)</label>
                  <label className="cursor-pointer px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md text-[10px] font-bold uppercase hover:bg-green-200 transition-colors flex items-center gap-1">
                    <FileUp className="w-3 h-3" />
                    {isUploading ? 'UPLOADING...' : 'UPLOAD DOC/MEDIA'}
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'article')} />
                  </label>
                </div>
                <textarea
                  rows={12}
                  value={selectedEditArticle.content || ''}
                  onChange={(e) => setSelectedEditArticle({ ...selectedEditArticle, content: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono resize-y"
                  placeholder="Write your article body here. You can use headings, lists, links, code snippets..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 sticky bottom-0 z-10">
              <button
                onClick={() => setSelectedEditArticle(null)}
                className="px-5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setArticles(articles.map(a => a.id === selectedEditArticle.id ? selectedEditArticle : a))
                  setSelectedEditArticle(null)
                }}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg transition-all text-sm"
              >
                Apply Updates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
