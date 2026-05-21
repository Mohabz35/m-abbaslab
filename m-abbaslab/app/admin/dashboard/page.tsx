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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'articles', label: 'Articles', icon: FileText },
    { id: 'alphas', label: 'Alphas', icon: Zap },
    { id: 'comms', label: 'Comms Hub', icon: MessageSquare },
    { id: 'whatsapp-pairing', label: 'WhatsApp Pairing', icon: Phone },
    { id: 'scheduler', label: 'Content Scheduler', icon: History },
    { id: 'broadcaster', label: 'WhatsApp Broadcaster', icon: Send },
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
                  <span className="text-slate-400">Supabase DB</span>
                  <span className="text-green-500 font-medium">Connected</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">WhatsApp Engine</span>
                  <span className="text-blue-500 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        )
      case 'projects':
        return <div className="text-white">Projects Management coming soon...</div>
      case 'articles':
        return <div className="text-white">Articles CMS coming soon...</div>
      case 'alphas':
        return <div className="text-white">Alpha Signals coming soon...</div>
      case 'comms':
        return <CommsHub />
      case 'whatsapp-pairing':
        return <WhatsAppConnectionPanel />
      case 'scheduler':
        return <ContentScheduler />
      case 'broadcaster':
        return <WhatsAppBroadcaster />
      case 'zapier':
        return <ZapierPanel />
      case 'discipline':
        return <DisciplineOS />
      case 'finance':
        return <FinanceTracker />
      case 'settings':
        return <div className="text-white">Settings coming soon...</div>
      default:
        return <div className="text-white">Select a tab</div>
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen sticky top-0 hidden lg:block">
          <div className="p-6">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-500" />
              M-Abbas Lab
            </h1>
          </div>
          <nav className="px-4 py-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white capitalize">
                {activeTab.replace('-', ' ')}
              </h2>
              <p className="text-slate-400">Welcome back, Mohammed Abbas</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 transition">
                <Plus className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-slate-800" />
            </div>
          </header>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
