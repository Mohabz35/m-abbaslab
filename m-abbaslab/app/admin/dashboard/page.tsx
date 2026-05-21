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
