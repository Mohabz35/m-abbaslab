'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Target, Flame, Brain, DollarSign, Heart, Shield, Zap,
  TrendingUp, BookOpen, Calendar, ChevronDown, ChevronUp,
  CheckSquare, Square, Save, RefreshCcw, Award, Star,
  Clock, Sun, Moon, Coffee, Dumbbell, Laptop, Users,
  AlertCircle, Plus, Trash2, BarChart2, Activity,
  FileDown, Send, CheckCircle2, MessageSquare,
  Droplets, Snowflake, Footprints, FileText, Layers, X
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

type HourCategory = 'sleep' | 'deep-work' | 'shallow-work' | 'learning' | 'exercise' | 'recovery' | 'social' | 'admin' | 'wasted' | 'unset'

interface HourBlock {
  hour: number
  category: HourCategory
  note?: string
}

interface Pillar {
  id: string
  label: string
  icon: any
  color: string
  score: number
  note: string
}

interface Goal {
  id: string
  name: string
  status: 'planning' | 'active' | 'done' | 'paused'
  metric: string
  note: string
}

interface GoalCategory {
  id: string
  label: string
  color: string
  goals: Goal[]
}

interface DayData {
  date: string
  hours: HourBlock[]
  pillars: { [key: string]: { score: number; note: string } }
  wins: string[]
  losses: string[]
  gratitude: string
  tomorrow: string
}

interface Review {
  id: string
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  date: string
  answers: string[]
}

interface WisdomItem {
  id: number
  type: 'alert' | 'insight' | 'action' | 'news'
  message: string
  timestamp: string
}

interface HabitItem {
  name: string
  category: 'morning' | 'hygiene' | 'fitness' | 'mind' | 'evening' | 'daily'
  difficulty: 'simple' | 'medium' | 'hard' | 'extreme'
  completed: boolean
  streak: number
  icon: any
  color: string
  bg: string
  scorecard: 1 | -1 | 0
  cue: string
  stackAfter: string
  twoMinuteRule: boolean
  timeSpent: number
}

interface HabitTemplate {
  name: string
  category: 'morning' | 'hygiene' | 'fitness' | 'mind' | 'evening' | 'daily'
  difficulty: 'simple' | 'medium' | 'hard' | 'extreme'
  icon: any
  color: string
  bg: string
  scorecard: 1 | -1 | 0
  cue: string
  stackAfter: string
  twoMinuteRule: boolean
}

// ── Constants ──────────────────────────────────────────────────────────────────

const HOUR_CATEGORIES: Record<HourCategory, { label: string; color: string; bg: string; icon: any }> = {
  'sleep':        { label: 'Sleep',       color: 'text-indigo-400',  bg: 'bg-indigo-500/30',  icon: Moon },
  'deep-work':    { label: 'Deep Work',   color: 'text-cyan-400',    bg: 'bg-cyan-500/30',    icon: Laptop },
  'shallow-work': { label: 'Shallow',     color: 'text-blue-400',    bg: 'bg-blue-500/30',    icon: Coffee },
  'learning':     { label: 'Learning',    color: 'text-emerald-400', bg: 'bg-emerald-500/30', icon: BookOpen },
  'exercise':     { label: 'Exercise',    color: 'text-orange-400',  bg: 'bg-orange-500/30',  icon: Dumbbell },
  'recovery':     { label: 'Recovery',    color: 'text-purple-400',  bg: 'bg-purple-500/30',  icon: Heart },
  'social':       { label: 'Social',      color: 'text-pink-400',    bg: 'bg-pink-500/30',    icon: Users },
  'admin':        { label: 'Admin',       color: 'text-yellow-400',  bg: 'bg-yellow-500/30',  icon: Calendar },
  'wasted':       { label: 'Wasted',      color: 'text-red-400',     bg: 'bg-red-500/30',     icon: AlertCircle },
  'unset':        { label: 'Unset',       color: 'text-gray-600 dark:text-gray-300',    bg: 'bg-gray-800',       icon: Clock },
}

const CATEGORY_ORDER: HourCategory[] = ['sleep', 'deep-work', 'shallow-work', 'learning', 'exercise', 'recovery', 'social', 'admin', 'wasted', 'unset']

const PILLARS: Omit<Pillar, 'score' | 'note'>[] = [
  { id: 'body',       label: 'Body',         icon: Dumbbell,   color: 'text-orange-400' },
  { id: 'skills',     label: 'Skills',       icon: Brain,      color: 'text-cyan-400' },
  { id: 'mental',     label: 'Mental',       icon: Shield,     color: 'text-purple-400' },
  { id: 'winning',    label: 'Winning',      icon: Award,      color: 'text-yellow-400' },
  { id: 'confidence', label: 'Confidence',   icon: Flame,      color: 'text-red-400' },
  { id: 'financial',  label: 'Financial',    icon: DollarSign, color: 'text-emerald-400' },
  { id: 'work-ethic', label: 'Work Ethic',   icon: Zap,        color: 'text-blue-400' },
]

const GOAL_CATEGORIES: Omit<GoalCategory, 'goals'>[] = [
  { id: 'startups',  label: '12 Startups',      color: 'text-cyan-400' },
  { id: 'companies', label: '12 Companies',      color: 'text-purple-400' },
  { id: 'income',    label: '12 Income Areas',   color: 'text-emerald-400' },
  { id: 'upgrades',  label: '12 Upgrades',       color: 'text-yellow-400' },
]

const STATUS_COLORS: Record<string, string> = {
  'planning': 'bg-gray-700 text-gray-400 dark:text-gray-600 dark:text-gray-300',
  'active':   'bg-cyan-500/20 text-cyan-300 border border-gray-200 dark:border-gray-700 border-cyan-500/40',
  'done':     'bg-emerald-500/20 text-emerald-300 border border-gray-200 dark:border-gray-700 border-emerald-500/40',
  'paused':   'bg-yellow-500/20 text-yellow-300 border border-gray-200 dark:border-gray-700 border-yellow-500/40',
}

const DEBT_RULES = [
  { rule: 'Rule of 20-4-10', title: 'Car Purchase', formula: '20% down · 4yr loan · 10% income max', desc: 'Never buy a car with less than 20% down, longer than 4-year financing, and more than 10% of gross monthly income in payments.', color: 'border-red-500/40 bg-red-500/5' },
  { rule: 'Rule of 2-6-10', title: 'Phone Purchase', formula: '2% of income max · 6-month amortization · 10% on extras', desc: 'Phone payment should never exceed 2% of monthly income. Amortize over max 6 months. Keep extras under 10%.', color: 'border-orange-500/40 bg-orange-500/5' },
  { rule: 'Rule of 3-6-9', title: 'Emergency Fund', formula: '3 months (single) · 6 months (family) · 9 months (entrepreneur)', desc: 'Build 3 months expenses as single, 6 months if you have a family, 9 months if you are an entrepreneur before any investing.', color: 'border-yellow-500/40 bg-yellow-500/5' },
  { rule: 'Rule of 5-15-25', title: 'Personal Loan', formula: '5% down · 15% max DTI · 25% max housing', desc: 'Personal loans require 5% down, debt-to-income ratio must stay below 15%, and housing costs below 25% of gross income.', color: 'border-purple-500/40 bg-purple-500/5' },
  { rule: 'Rule of 72', title: 'Money Doubling', formula: '72 ÷ interest rate = years to double', desc: 'To estimate how many years it takes money to double, divide 72 by the annual interest rate. Applies to both growth and debt.', color: 'border-cyan-500/40 bg-cyan-500/5' },
]

const PASSIVE_INCOME_STREAMS = [
  'Dividend stocks & ETFs',
  'High-Yield Savings Accounts (HYSAs)',
  'House Hacking (rent rooms in primary home)',
  'Short-Term Rentals (STR/Airbnb)',
  'Long-Term Rental Properties',
  'YouTube channel monetization',
  'Affiliate marketing (blog/social)',
  'Digital products (eBooks, templates)',
  'Online courses & cohorts',
  'Royalty income (books, music, patents)',
  'Peer-to-Peer lending',
  'REITs (Real Estate Investment Trusts)',
  'Index fund investing (compounding)',
  'Cryptocurrency staking / yield',
  'Print-on-demand merchandise',
  'Software / SaaS products',
  'Licensing technology or IP',
  'Angel investing (equity stakes)',
  'Vending machine or ATM businesses',
  'Storage unit rentals',
  'Car rental (Turo/Rideshare ownership)',
  'Laundromat or car wash ownership',
  'Niche website / ad revenue',
  'Domain name flipping & resale',
]

const MENTORS = [
  { name: 'David Goggins', title: 'Can\'t Hurt Me', accent: 'text-red-400', rules: ['The Accountability Mirror — write your failures, read them daily', '40% Rule — when your mind says quit, you\'re at 40% capacity', 'Callous your mind with daily discomfort', 'If it doesn\'t suck, it won\'t make you stronger', 'The Cookie Jar — collect wins to draw from in dark times'] },
  { name: 'Alex Hormozi', title: '$100M Offers', accent: 'text-yellow-400', rules: ['Volume cures all uncertainty — do more of what works', 'Speed of implementation beats perfection', 'The market doesn\'t care about your effort, only your output', 'Make offers so good people feel stupid saying no', 'Work on the business, not just in it'] },
  { name: 'Elon Musk', title: 'First Principles', accent: 'text-cyan-400', rules: ['First Principles thinking — question every assumption', 'Time-block ruthlessly: every hour must produce value', 'Feedback loops must be extremely tight', 'If you\'re not failing, you\'re not innovating enough', 'Hire people smarter than you in their domain'] },
  { name: 'Andrew Huberman', title: 'Neural Optimization', accent: 'text-emerald-400', rules: ['Morning sunlight exposure within 30 minutes of waking', 'NSDR (Non-Sleep Deep Rest) = free performance enhancement', 'Exercise 6 days/week for neuroplasticity', 'Delay caffeine 90-120 min after waking for stable energy', 'Cold exposure builds mental resilience and dopamine'] },
  { name: 'James Clear', title: 'Atomic Habits', accent: 'text-purple-400', rules: ['1% better every day = 37x better in a year', 'Systems beat goals every time', 'Never miss twice — one miss is an accident, two is a habit', 'Identity-based habits: be the person who does X', 'Environment design shapes behavior more than willpower'] },
  { name: 'Naval Ravikant', title: 'Almanack', accent: 'text-indigo-400', rules: ['Build specific knowledge you can\'t be trained for', 'Seek leverage: code, media, capital, and labor', 'Productize yourself — create assets that scale without you', 'Reading is the ultimate unfair advantage', 'Accountability builds reputation, reputation creates wealth'] },
]

const ANCIENT_WISDOM = [
  { 
    name: 'Marcus Aurelius', 
    book: 'Meditations', 
    accent: 'text-amber-400',
    keys: [
      'You have power over your mind, not outside events — realize this, and you will find strength.',
      'The impediment to action advances action. What stands in the way becomes the way.',
      'Confine yourself to the present — the past and future are not in your control.',
      'Do not indulge in discussions about other people. Focus only on your own actions.',
      'Perfection of character is this: to live each day as if it were your last, without frenzy, laziness, or any pretending.',
      'When you wake up in the morning, think of what a privilege it is to be alive, to think, to enjoy, to love.',
    ]
  },
  {
    name: 'Niccolò Machiavelli',
    book: 'The Prince',
    accent: 'text-rose-400',
    keys: [
      'It is better to be feared than loved, if you cannot have both.',
      'Never waste the opportunity offered by a good crisis.',
      'The first method for estimating the intelligence of a ruler is to look at the men he has around him.',
      'A prince must be a fox to recognize traps and a lion to frighten wolves.',
      'Men are driven by two principal impulses: love or fear.',
      'It is better to act boldly and lose than to be cautious and win nothing.',
    ]
  }
]

const DEFAULT_HABITS: HabitTemplate[] = [
  { name: 'Brush Teeth (Morning)', category: 'hygiene', difficulty: 'simple', icon: Sun, color: 'text-cyan-400', bg: 'bg-cyan-500/10', scorecard: 1, cue: 'After waking up', stackAfter: '', twoMinuteRule: true },
  { name: 'Brush Teeth (Night)', category: 'hygiene', difficulty: 'simple', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/10', scorecard: 1, cue: 'Before bed', stackAfter: '', twoMinuteRule: true },
  { name: 'Shower', category: 'hygiene', difficulty: 'simple', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/10', scorecard: 1, cue: 'After morning routine', stackAfter: 'Brush Teeth (Morning)', twoMinuteRule: false },
  { name: 'Make Bed', category: 'morning', difficulty: 'simple', icon: Coffee, color: 'text-amber-400', bg: 'bg-amber-500/10', scorecard: 1, cue: 'After getting out of bed', stackAfter: '', twoMinuteRule: true },
  { name: 'Exercise (30 min)', category: 'fitness', difficulty: 'medium', icon: Dumbbell, color: 'text-orange-400', bg: 'bg-orange-500/10', scorecard: 1, cue: 'After making bed', stackAfter: 'Make Bed', twoMinuteRule: false },
  { name: 'Drink 2L Water', category: 'fitness', difficulty: 'simple', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/10', scorecard: 1, cue: 'Throughout the day', stackAfter: '', twoMinuteRule: true },
  { name: 'Read (20 min)', category: 'mind', difficulty: 'medium', icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10', scorecard: 1, cue: 'After lunch', stackAfter: '', twoMinuteRule: false },
  { name: 'Meditate (10 min)', category: 'mind', difficulty: 'medium', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10', scorecard: 1, cue: 'After exercise', stackAfter: 'Exercise (30 min)', twoMinuteRule: false },
  { name: 'No Social Media', category: 'daily', difficulty: 'hard', icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10', scorecard: 1, cue: 'All day', stackAfter: '', twoMinuteRule: false },
  { name: 'Healthy Meal', category: 'fitness', difficulty: 'simple', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10', scorecard: 1, cue: 'At meal times', stackAfter: '', twoMinuteRule: false },
  { name: 'Journal', category: 'evening', difficulty: 'simple', icon: FileText, color: 'text-yellow-400', bg: 'bg-yellow-500/10', scorecard: 1, cue: 'Before bed', stackAfter: 'Brush Teeth (Night)', twoMinuteRule: false },
  { name: 'Sleep by 10pm', category: 'evening', difficulty: 'hard', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/10', scorecard: 1, cue: 'At 9:45pm alarm', stackAfter: '', twoMinuteRule: false },
  { name: 'Cold Shower', category: 'hygiene', difficulty: 'extreme', icon: Snowflake, color: 'text-cyan-400', bg: 'bg-cyan-500/10', scorecard: 1, cue: 'End of shower', stackAfter: 'Shower', twoMinuteRule: false },
  { name: '10K Steps', category: 'fitness', difficulty: 'hard', icon: Footprints, color: 'text-emerald-400', bg: 'bg-emerald-500/10', scorecard: 1, cue: 'Throughout the day', stackAfter: '', twoMinuteRule: false },
  { name: 'No Sugar', category: 'daily', difficulty: 'medium', icon: Shield, color: 'text-amber-400', bg: 'bg-amber-500/10', scorecard: 1, cue: 'At meal times', stackAfter: '', twoMinuteRule: false },
  { name: 'Deep Work (2h+)', category: 'daily', difficulty: 'hard', icon: Laptop, color: 'text-cyan-400', bg: 'bg-cyan-500/10', scorecard: 1, cue: 'Morning block', stackAfter: 'Exercise (30 min)', twoMinuteRule: false },
]

const HABIT_CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  morning: { label: 'Morning', color: 'text-amber-400' },
  hygiene: { label: 'Hygiene', color: 'text-blue-400' },
  fitness: { label: 'Fitness', color: 'text-orange-400' },
  mind: { label: 'Mind', color: 'text-purple-400' },
  evening: { label: 'Evening', color: 'text-indigo-400' },
  daily: { label: 'Daily', color: 'text-emerald-400' },
}

const REVIEW_TEMPLATES: Record<string, { title: string; prompts: string[] }> = {
  daily:     { title: 'Daily Debrief', prompts: ['What were my 3 non-negotiable wins today?', 'Where did I waste time or energy?', 'What am I grateful for right now?', 'What is my single most important task tomorrow?', 'Score the day 1-10 and justify the score.'] },
  weekly:    { title: 'Weekly War Room', prompts: ['Did I execute on my main weekly goal?', 'What patterns hurt my performance this week?', 'What were the 3 biggest lessons?', 'Am I on track with my 90-day targets?', 'What must be different next week?'] },
  monthly:   { title: 'Monthly Reckoning', prompts: ['Did I move the needle on my 12x goals?', 'What financial progress was made this month?', 'What skills did I sharpen?', 'What relationships did I invest in or neglect?', 'Where am I lying to myself?'] },
  quarterly: { title: '90-Day Reset', prompts: ['Did I hit 80%+ of my quarterly milestones?', 'What is the single biggest bottleneck to my goals?', 'How has my financial position changed?', 'What new leverage do I have that I didn\'t have 90 days ago?', 'What must I start, stop, and continue?'] },
  yearly:    { title: 'Annual Sovereignty Review', prompts: ['Did I start and sustain my 12 income areas?', 'What is my net worth change year-over-year?', 'Which pillar improved the most? Which is still broken?', 'What is my single largest unresolved fear holding me back?', 'Am I living the life I designed or the life that happened to me?'] },
}

// ── Default Data Generators ─────────────────────────────────────────────────────

function getDefaultHours(): HourBlock[] {
  return Array.from({ length: 24 }, (_, i) => ({ hour: i, category: 'unset' as HourCategory }))
}

function getDefaultPillars(): Pillar[] {
  return PILLARS.map(p => ({ ...p, score: 5, note: '' }))
}

function getDefaultGoalCategories(): GoalCategory[] {
  return GOAL_CATEGORIES.map(cat => ({
    ...cat,
    goals: Array.from({ length: 12 }, (_, i) => ({
      id: `${cat.id}-${i}`,
      name: '',
      status: 'planning' as const,
      metric: '',
      note: '',
    }))
  }))
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function apiHeaders() { return { 'Content-Type': 'application/json' } }

// ── Sub-Components ──────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle, accent = 'text-cyan-400' }: { icon: any; title: string; subtitle?: string; accent?: string }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className={`mt-0.5 p-2 rounded-lg bg-white dark:bg-gray-800/5 border border-gray-200 dark:border-gray-700 border-white/10`}>
        <Icon className={`w-5 h-5 ${accent}`} />
      </div>
      <div>
        <h3 className={`text-lg font-bold tracking-tight ${accent}`}>{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

function GlassPanel({ children, className = '', id }: { children: React.ReactNode; className?: string, id?: string }) {
  return (
    <div id={id} className={`bg-white dark:bg-gray-800/[0.03] border border-gray-200 dark:border-gray-700 border-white/10 rounded-2xl p-6 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  )
}

function ScoreSlider({ value, onChange, color = 'cyan' }: { value: number; onChange: (v: number) => void; color?: string }) {
  const colorMap: Record<string, string> = {
    orange: 'accent-orange-400', cyan: 'accent-cyan-400', purple: 'accent-purple-400',
    yellow: 'accent-yellow-400', red: 'accent-red-400', emerald: 'accent-emerald-400', blue: 'accent-blue-400',
  }
  const scoreColor = value >= 8 ? 'text-emerald-400' : value >= 5 ? 'text-yellow-400' : 'text-red-400'
  return (
    <div className="flex items-center gap-3">
      <input
        type="range" min={1} max={10} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={`flex-1 h-2 rounded-full bg-white dark:bg-gray-800/10 ${colorMap[color] || 'accent-cyan-400'}`}
      />
      <span className={`text-xl font-black w-8 text-center ${scoreColor}`}>{value}</span>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────────

export default function DisciplineOS() {
  const [activeSection, setActiveSection] = useState<'day' | 'habits' | 'ai-coach' | 'diary' | 'goals' | 'reviews' | 'mentors' | 'finance'>('day')
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [hours, setHours] = useState<HourBlock[]>(getDefaultHours())
  const [pillars, setPillars] = useState<Pillar[]>(getDefaultPillars())
  const [wins, setWins] = useState(['', '', ''])
  const [losses, setLosses] = useState(['', '', ''])
  const [gratitude, setGratitude] = useState('')
  const [tomorrow, setTomorrow] = useState('')
  const [selectedHourCat, setSelectedHourCat] = useState<HourCategory>('deep-work')
  const [goalCategories, setGoalCategories] = useState<GoalCategory[]>(getDefaultGoalCategories())
  const [reviewType, setReviewType] = useState<keyof typeof REVIEW_TEMPLATES>('weekly')
  const [reviewAnswers, setReviewAnswers] = useState<string[]>([])
  const [passiveChecked, setPassiveChecked] = useState<boolean[]>(Array(PASSIVE_INCOME_STREAMS.length).fill(false))
  const [expandedMentor, setExpandedMentor] = useState<string | null>(null)
  const [expandedWisdom, setExpandedWisdom] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // New State for Advanced Features
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [isZapping, setIsZapping] = useState(false)
  const [wisdomFeed, setWisdomFeed] = useState<WisdomItem[]>([])
  const [loadingWisdom, setLoadingWisdom] = useState(false)

  // Habit Tracker State
  const [habits, setHabits] = useState<HabitItem[]>(DEFAULT_HABITS.map(h => ({
    ...h, completed: false, streak: 0, timeSpent: 0
  })))
  
  // Atomic Habits State
  const [showScorecard, setShowScorecard] = useState(false)
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitCategory, setNewHabitCategory] = useState<HabitItem['category']>('daily')
  const [newHabitDifficulty, setNewHabitDifficulty] = useState<HabitItem['difficulty']>('simple')
  const [newHabitCue, setNewHabitCue] = useState('')
  const [newHabitStackAfter, setNewHabitStackAfter] = useState('')
  const [newHabitTwoMinute, setNewHabitTwoMinute] = useState(false)

  // AI Coaching State
  const [aiCoaching, setAiCoaching] = useState<string>('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMode, setAiMode] = useState<'daily-review' | 'habit-coaching' | 'weekly-summary'>('daily-review')

  // Diary State
  const [diaryTitle, setDiaryTitle] = useState('')
  const [diaryContent, setDiaryContent] = useState('')
  const [diaryMood, setDiaryMood] = useState<string>('neutral')
  const [diaryTags, setDiaryTags] = useState<string[]>([])
  const [diaryTagInput, setDiaryTagInput] = useState('')
  const [diarySuggestion, setDiarySuggestion] = useState('')
  const [diaryLoading, setDiaryLoading] = useState(false)
  const [savedDiary, setSavedDiary] = useState<any>(null)

  // Auto-save state
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Load from API ──
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/discipline?date=${selectedDate}&section=all`, { headers: apiHeaders() })
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()

        // Load day data
        const todayData = data.days?.find((d: any) => d.date === selectedDate)
        if (todayData) {
          if (todayData.hours) setHours(todayData.hours)
          if (todayData.pillars) {
            setPillars(getDefaultPillars().map(p => ({
              ...p,
              score: todayData.pillars[p.id]?.score ?? 5,
              note: todayData.pillars[p.id]?.note ?? '',
            })))
          }
          if (todayData.wins) setWins(todayData.wins)
          if (todayData.losses) setLosses(todayData.losses)
          if (todayData.gratitude) setGratitude(todayData.gratitude)
          if (todayData.tomorrow) setTomorrow(todayData.tomorrow)
        }

        // Load goals from Supabase
        if (data.goals && data.goals.length > 0) {
          const categories: Record<string, GoalCategory> = {}
          for (const g of data.goals) {
            const catId = g.category_id || g.categoryId || 'uncategorized'
            if (!categories[catId]) {
              categories[catId] = {
                id: catId,
                label: g.category_label || g.categoryLabel || catId,
                color: g.category_color || g.categoryColor || 'text-gray-500 dark:text-gray-400',
                goals: []
              }
            }
            categories[catId].goals.push({
              id: g.goal_id || g.goalId || g.id,
              name: g.name || '',
              status: g.status || 'planning',
              metric: g.metric || '',
              note: g.note || '',
            })
          }
          if (Object.keys(categories).length > 0) {
            setGoalCategories(Object.values(categories))
          }
        }

        // Load habits from Supabase
        if (data.habits && data.habits.length > 0) {
          const loadedHabits = DEFAULT_HABITS.map(template => {
            const db = data.habits.find((h: any) => h.habit_name === template.name)
            return {
              ...template,
              completed: db?.completed || false,
              streak: db?.streak || 0,
              scorecard: db?.scorecard ?? template.scorecard,
              cue: db?.cue ?? template.cue,
              stackAfter: db?.stack_after ?? template.stackAfter,
              twoMinuteRule: db?.two_minute_rule ?? template.twoMinuteRule,
              timeSpent: db?.time_spent || 0,
            }
          })
          setHabits(loadedHabits)
        }

        // Load diary from Supabase
        if (data.diary && data.diary.length > 0) {
          const todayDiary = data.diary.find((d: any) => d.date === selectedDate)
          if (todayDiary) {
            setDiaryTitle(todayDiary.title || '')
            setDiaryContent(todayDiary.content || '')
            setDiaryMood(todayDiary.mood || 'neutral')
            setDiaryTags(todayDiary.tags || [])
            setDiarySuggestion(todayDiary.ai_suggestion || '')
            setSavedDiary(todayDiary)
          } else {
            setDiaryTitle('')
            setDiaryContent('')
            setDiaryMood('neutral')
            setDiaryTags([])
            setDiarySuggestion('')
            setSavedDiary(null)
          }
        } else {
          setDiaryTitle('')
          setDiaryContent('')
          setDiaryMood('neutral')
          setDiaryTags([])
          setDiarySuggestion('')
          setSavedDiary(null)
        }
      } catch (e) {
        // Fallback to localStorage
        try {
          const cached = localStorage.getItem(`discipline_day_${selectedDate}`)
          if (cached) {
            const d = JSON.parse(cached)
            if (d.hours) setHours(d.hours)
            if (d.pillars) setPillars(d.pillars)
            if (d.wins) setWins(d.wins)
            if (d.losses) setLosses(d.losses)
            if (d.gratitude) setGratitude(d.gratitude)
            if (d.tomorrow) setTomorrow(d.tomorrow)
          }
          const cachedGoals = localStorage.getItem('discipline_goals')
          if (cachedGoals) setGoalCategories(JSON.parse(cachedGoals))
          const cachedHabits = localStorage.getItem(`discipline_habits_${selectedDate}`)
          if (cachedHabits) setHabits(JSON.parse(cachedHabits))
        } catch {}
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [selectedDate])

  // Load Wisdom Feed
  useEffect(() => {
    if (activeSection === 'mentors') {
      const fetchWisdom = async () => {
        setLoadingWisdom(true)
        try {
          const res = await fetch('/api/admin/wisdom', { headers: apiHeaders() })
          const data = await res.json()
          if (data.success) setWisdomFeed(data.feed)
        } catch (e) {
          console.error('Failed to load wisdom feed')
        } finally {
          setLoadingWisdom(false)
        }
      }
      fetchWisdom()
    }
  }, [activeSection])

  // ── Review answers reset on type change ──
  useEffect(() => {
    const template = REVIEW_TEMPLATES[reviewType]
    setReviewAnswers(Array(template.prompts.length).fill(''))
  }, [reviewType])

  // ── Hour block click ──
  const handleHourClick = (hour: number) => {
    setHours(prev => prev.map(h => h.hour === hour ? { ...h, category: selectedHourCat } : h))
  }

  // ── Save Functions ──
  const handleSaveDay = async () => {
    setIsSaving(true)
    const dayData = {
      hours,
      pillars: Object.fromEntries(pillars.map(p => [p.id, { score: p.score, note: p.note }])),
      wins, losses, gratitude, tomorrow,
      deepWorkHours,
      sleepHours,
      wastedHours,
      overallScore: parseFloat(avgPillarScore),
    }
    localStorage.setItem(`discipline_day_${selectedDate}`, JSON.stringify(dayData))
    try {
      const res = await fetch('/api/admin/discipline', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ type: 'day', date: selectedDate, data: dayData })
      })
      const result = await res.json()
      setSaveStatus(result.message || 'Saved')
    } catch {
      setSaveStatus('Saved locally')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  const handleSaveGoals = async () => {
    setIsSaving(true)
    localStorage.setItem('discipline_goals', JSON.stringify(goalCategories))
    try {
      const goalsPayload = goalCategories.flatMap(cat =>
        cat.goals.map(g => ({
          id: g.id,
          categoryId: cat.id,
          categoryLabel: cat.label,
          categoryColor: cat.color,
          goalId: g.id,
          name: g.name,
          status: g.status,
          metric: g.metric,
          note: g.note,
        }))
      )
      const res = await fetch('/api/admin/discipline', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ type: 'goals', goals: goalsPayload })
      })
      const result = await res.json()
      setSaveStatus(result.message || 'Goals saved')
    } catch {
      setSaveStatus('Saved locally')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  const handleSaveReview = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/discipline', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ type: 'review', reviewType, date: selectedDate, answers: reviewAnswers })
      })
      const result = await res.json()
      setSaveStatus(result.message || 'Review saved')
    } catch {
      setSaveStatus('Saved locally')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  // ── Habit Tracker Functions ──
  const toggleHabit = async (index: number) => {
    const habit = habits[index]
    const newCompleted = !habit.completed
    const updatedHabits = habits.map((h, i) => i === index ? { ...h, completed: newCompleted } : h)
    setHabits(updatedHabits)
    localStorage.setItem(`discipline_habits_${selectedDate}`, JSON.stringify(updatedHabits))
    try {
      await fetch('/api/admin/discipline', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({
          type: 'habit-toggle',
          date: selectedDate,
          habitName: habit.name,
          habitCategory: habit.category,
          completed: newCompleted,
          difficulty: habit.difficulty,
          streak: newCompleted ? habit.streak + 1 : 0,
          scorecard: habit.scorecard,
          cue: habit.cue,
          stackAfter: habit.stackAfter,
          twoMinuteRule: habit.twoMinuteRule,
          timeSpent: habit.timeSpent,
        })
      })
    } catch {}
  }

  const habitsCompleted = habits.filter(h => h.completed).length
  const habitCompletionRate = habits.length > 0 ? Math.round((habitsCompleted / habits.length) * 100) : 0
  const habitCategories = Array.from(new Set(habits.map(h => h.category)))
  
  // Atomic Habits helpers
  const scorecardPlus = habits.filter(h => h.scorecard === 1).length
  const scorecardMinus = habits.filter(h => h.scorecard === -1).length
  const scorecardNeutral = habits.filter(h => h.scorecard === 0).length
  const habitScore = scorecardPlus - scorecardMinus

  const toggleScorecard = (index: number) => {
    setHabits(prev => prev.map((h, i) => {
      if (i !== index) return h
      const next: 1 | -1 | 0 = h.scorecard === 0 ? 1 : h.scorecard === 1 ? -1 : 0
      return { ...h, scorecard: next }
    }))
  }

  const addCustomHabit = () => {
    if (!newHabitName.trim()) return
    const iconMap: Record<string, any> = { morning: Sun, hygiene: Droplets, fitness: Dumbbell, mind: Brain, evening: Moon, daily: Shield }
    const colorMap: Record<string, string> = { morning: 'text-amber-400', hygiene: 'text-blue-400', fitness: 'text-orange-400', mind: 'text-purple-400', evening: 'text-indigo-400', daily: 'text-emerald-400' }
    const bgMap: Record<string, string> = { morning: 'bg-amber-500/10', hygiene: 'bg-blue-500/10', fitness: 'bg-orange-500/10', mind: 'bg-purple-500/10', evening: 'bg-indigo-500/10', daily: 'bg-emerald-500/10' }
    const newHabit: HabitItem = {
      name: newHabitName.trim(),
      category: newHabitCategory,
      difficulty: newHabitDifficulty,
      icon: iconMap[newHabitCategory] || Shield,
      color: colorMap[newHabitCategory] || 'text-gray-500 dark:text-gray-400',
      bg: bgMap[newHabitCategory] || 'bg-gray-50 dark:bg-gray-800/500/10',
      completed: false,
      streak: 0,
      scorecard: 0,
      cue: newHabitCue,
      stackAfter: newHabitStackAfter,
      twoMinuteRule: newHabitTwoMinute,
      timeSpent: 0,
    }
    setHabits(prev => [...prev, newHabit])
    setNewHabitName('')
    setNewHabitCue('')
    setNewHabitStackAfter('')
    setNewHabitTwoMinute(false)
    setShowAddHabit(false)
  }

  const removeHabit = (index: number) => {
    setHabits(prev => prev.filter((_, i) => i !== index))
  }

  // ── Auto-Save (debounced 1.5s) ──
  const autoSave = useCallback(async () => {
    setIsAutoSaving(true)
    try {
      await fetch('/api/admin/discipline', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({
          type: 'day',
          date: selectedDate,
          hours, pillars, wins, losses, gratitude, tomorrow,
        })
      })
      // Also save habits
      await fetch('/api/admin/discipline', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({
          type: 'habits-bulk',
          date: selectedDate,
          habits: habits.map(h => ({
            name: h.name, category: h.category, completed: h.completed,
            difficulty: h.difficulty, streak: h.streak, scorecard: h.scorecard,
            cue: h.cue, stackAfter: h.stackAfter, twoMinuteRule: h.twoMinuteRule, timeSpent: h.timeSpent,
          }))
        })
      })
      const now = new Date()
      setLastSaved(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    } catch {
      // silent fail for auto-save
    } finally {
      setIsAutoSaving(false)
    }
  }, [selectedDate, hours, pillars, wins, losses, gratitude, tomorrow, habits])

  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => autoSave(), 1500)
  }, [autoSave])

  // Auto-save on state changes (debounced)
  useEffect(() => {
    if (!isLoading) triggerAutoSave()
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [hours, pillars, wins, losses, gratitude, tomorrow, habits, isLoading, triggerAutoSave])

  // ── Advanced Automation ──
  
  const generatePDFReport = async () => {
    setIsExportingPDF(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const element = document.getElementById('review-export-container')
      if (!element) return
      
      const opt = {
        margin: 10,
        filename: `DisciplineOS_${reviewType}_${selectedDate}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#030712' },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      }
      
      await html2pdf().set(opt).from(element).save()
      setSaveStatus('PDF Exported Successfully')
    } catch (err) {
      console.error(err)
      setSaveStatus('PDF Export Failed')
    } finally {
      setIsExportingPDF(false)
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  const sendToZapier = async () => {
    setIsZapping(true)
    try {
      // Structure the payload for the webhook
      const payload = {
        report_type: reviewType,
        date: selectedDate,
        deep_work_hours: deepWorkHours,
        average_pillar_score: avgPillarScore,
        answers: REVIEW_TEMPLATES[reviewType].prompts.map((p, i) => ({
          question: p,
          answer: reviewAnswers[i] || 'N/A'
        }))
      }

      const res = await fetch('/api/admin/zapier', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({
          eventName: 'discipline_report',
          payload
        })
      })

      const result = await res.json()
      if (res.ok && result.success) {
        setSaveStatus('Report sent to Zapier (Email/WhatsApp Triggered)')
      } else {
        setSaveStatus('Zapier integration failed. Check ZapierPanel config.')
      }
    } catch (err) {
      setSaveStatus('Zapier Request Failed')
    } finally {
      setIsZapping(false)
      setTimeout(() => setSaveStatus(null), 4000)
    }
  }

  // ── AI Coaching ──
  const requestAiCoaching = async (mode: 'daily-review' | 'habit-coaching' | 'weekly-summary') => {
    setAiLoading(true)
    setAiCoaching('')
    try {
      const context = mode === 'habit-coaching'
        ? {
            completed: habits.filter(h => h.completed).length,
            total: habits.length,
            habits: habits.map(h => ({ name: h.name, completed: h.completed, difficulty: h.difficulty, streak: h.streak })),
            date: selectedDate,
          }
        : mode === 'daily-review'
        ? {
            date: selectedDate,
            overallScore: parseFloat(avgPillarScore),
            deepWorkHours,
            sleepHours,
            wastedHours,
            pillars: pillars.map(p => ({ label: p.label, score: p.score, note: p.note })),
            wins: wins.filter(Boolean),
            losses: losses.filter(Boolean),
            gratitude,
            tomorrowPlan: tomorrow,
          }
        : {
            recentDays: 7,
            avgPillarScore,
            goalsCompleted,
            totalGoals: 48,
          }

      const res = await fetch('/api/admin/discipline/coaching', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ mode, context }),
      })
      const data = await res.json()
      setAiCoaching(data.response || 'No response generated.')
    } catch {
      setAiCoaching('AI coaching unavailable. Check your OpenRouter API key in environment variables.')
    } finally {
      setAiLoading(false)
    }
  }

  // ── Helpers ──
  const updatePillar = (id: string, field: 'score' | 'note', value: any) => {
    setPillars(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const updateGoal = (catId: string, goalId: string, field: keyof Goal, value: string) => {
    setGoalCategories(prev => prev.map(cat =>
      cat.id === catId
        ? { ...cat, goals: cat.goals.map(g => g.id === goalId ? { ...g, [field]: value } : g) }
        : cat
    ))
  }

  const deepWorkHours = hours.filter(h => h.category === 'deep-work').length
  const sleepHours = hours.filter(h => h.category === 'sleep').length
  const wastedHours = hours.filter(h => h.category === 'wasted').length
  const avgPillarScore = (pillars.reduce((a, b) => a + b.score, 0) / pillars.length).toFixed(1)
  const goalsCompleted = goalCategories.flatMap(c => c.goals).filter(g => g.status === 'done').length
  const passiveCompleted = passiveChecked.filter(Boolean).length

  const NAV_TABS = [
    { id: 'day',       label: 'Today',        icon: Sun },
    { id: 'habits',    label: 'Habits',       icon: CheckCircle2 },
    { id: 'diary',     label: 'Diary',        icon: FileText },
    { id: 'ai-coach',  label: 'AI Coach',     icon: Brain },
    { id: 'goals',     label: '12× Goals',    icon: Target },
    { id: 'reviews',   label: 'Reviews',      icon: Calendar },
    { id: 'mentors',   label: 'Wisdom',       icon: BookOpen },
    { id: 'finance',   label: 'Finance Laws', icon: DollarSign },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm tracking-widest uppercase">Loading System 12×</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Header Bar ── */}
      <div className="border-b border-gray-200 dark:border-gray-700 border-white/10 bg-black/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight">DISCIPLINE OS</h2>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest">System 12×</p>
              </div>
            </div>

            {/* ── Quick Stats ── */}
            <div className="hidden md:flex items-center gap-4 ml-6 pl-6 border-l border-white/10">
              <div className="flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-400">{deepWorkHours}h</span>
                <span className="text-[10px] text-gray-600 dark:text-gray-300">deep work</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-bold text-purple-400">{avgPillarScore}</span>
                <span className="text-[10px] text-gray-600 dark:text-gray-300">avg score</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">{goalsCompleted}/48</span>
                <span className="text-[10px] text-gray-600 dark:text-gray-300">goals done</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-gray-800/5 border border-gray-200 dark:border-gray-700 border-white/10 rounded-lg text-xs text-gray-400 dark:text-gray-600 dark:text-gray-300 focus:border-cyan-500/50 outline-none"
            />
            {saveStatus && (
              <span className="text-xs text-emerald-400 font-medium animate-pulse px-3 py-1 bg-emerald-500/10 rounded-full border border-gray-200 dark:border-gray-700 border-emerald-500/20">
                {saveStatus}
              </span>
            )}
          </div>
        </div>

        {/* ── Section Nav ── */}
        <div className="flex gap-1 px-6 pb-0 overflow-x-auto">
          {NAV_TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeSection === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-wide border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-400 dark:text-gray-600 dark:text-gray-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* SECTION: TODAY */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'day' && (
          <div className="space-y-6">
            {/* 24-Hour Grid */}
            <GlassPanel>
              <SectionHeader icon={Clock} title="24-Hour Accountability Grid" subtitle="Click an hour block to assign its category" accent="text-cyan-400" />

              {/* Category Selector */}
              <div className="flex flex-wrap gap-2 mb-5">
                {CATEGORY_ORDER.map(cat => {
                  const info = HOUR_CATEGORIES[cat]
                  const Icon = info.icon
                  const isSelected = selectedHourCat === cat
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedHourCat(cat)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 transition-all ${
                        isSelected ? `${info.bg} ${info.color} border-current scale-105` : 'bg-white dark:bg-gray-800/5 text-gray-500 dark:text-gray-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {info.label}
                    </button>
                  )
                })}
              </div>

              {/* Hour Blocks */}
              <div className="grid grid-cols-6 md:grid-cols-12 gap-1.5">
                {hours.map(block => {
                  const info = HOUR_CATEGORIES[block.category]
                  const Icon = info.icon
                  const isAM = block.hour < 12
                  const displayHour = block.hour === 0 ? '12' : block.hour > 12 ? String(block.hour - 12) : String(block.hour)
                  return (
                    <button
                      key={block.hour}
                      onClick={() => handleHourClick(block.hour)}
                      title={`${displayHour}${isAM ? 'am' : 'pm'} — ${info.label}`}
                      className={`group relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border border-gray-200 dark:border-gray-700 transition-all hover:scale-105 ${info.bg} ${block.category !== 'unset' ? 'border-current/30' : 'border-white/5 hover:border-white/20'}`}
                    >
                      <Icon className={`w-3 h-3 ${info.color}`} />
                      <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">{displayHour}{isAM ? 'a' : 'p'}</span>
                    </button>
                  )
                })}
              </div>

              {/* Summary Bar */}
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-cyan-400">{deepWorkHours}h</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest">Deep Work</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-indigo-400">{sleepHours}h</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest">Sleep</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-black ${wastedHours > 2 ? 'text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>{wastedHours}h</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest">Wasted</p>
                </div>
              </div>
            </GlassPanel>

            {/* 7-Pillar Assessment */}
            <GlassPanel>
              <SectionHeader icon={Activity} title="7-Pillar Daily Assessment" subtitle="Rate each pillar 1–10 with radical honesty" accent="text-purple-400" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pillars.map(pillar => {
                  const Icon = pillar.icon
                  const colorKey = pillar.color.replace('text-', '').replace('-400', '')
                  return (
                    <div key={pillar.id} className="bg-white dark:bg-gray-800/[0.02] rounded-xl p-4 border border-gray-200 dark:border-gray-700 border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className={`w-4 h-4 ${pillar.color}`} />
                        <span className="text-sm font-bold">{pillar.label}</span>
                      </div>
                      <ScoreSlider value={pillar.score} onChange={v => updatePillar(pillar.id, 'score', v)} color={colorKey} />
                      <input
                        type="text"
                        placeholder="One-line note..."
                        value={pillar.note}
                        onChange={e => updatePillar(pillar.id, 'note', e.target.value)}
                        className="mt-2 w-full text-xs bg-transparent border-b border-gray-200 dark:border-gray-700 border-white/10 pb-1 outline-none text-gray-500 dark:text-gray-400 placeholder-gray-700 focus:border-white/20"
                      />
                    </div>
                  )
                })}
              </div>
            </GlassPanel>

            {/* Daily Debrief */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassPanel>
                <SectionHeader icon={Star} title="3 Wins Today" accent="text-emerald-400" />
                {wins.map((win, i) => (
                  <div key={i} className="flex items-start gap-2 mb-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-gray-200 dark:border-gray-700 border-emerald-500/40 text-emerald-400 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <input
                      type="text"
                      placeholder={`Win #${i + 1}...`}
                      value={win}
                      onChange={e => setWins(prev => prev.map((w, j) => j === i ? e.target.value : w))}
                      className="w-full text-sm bg-transparent border-b border-gray-200 dark:border-gray-700 border-white/10 pb-1.5 outline-none text-gray-200 placeholder-gray-700 focus:border-emerald-500/30"
                    />
                  </div>
                ))}
              </GlassPanel>

              <GlassPanel>
                <SectionHeader icon={AlertCircle} title="Losses & Lessons" accent="text-red-400" />
                {losses.map((loss, i) => (
                  <div key={i} className="flex items-start gap-2 mb-3">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 border border-gray-200 dark:border-gray-700 border-red-500/40 text-red-400 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <input
                      type="text"
                      placeholder={`Lesson #${i + 1}...`}
                      value={loss}
                      onChange={e => setLosses(prev => prev.map((l, j) => j === i ? e.target.value : l))}
                      className="w-full text-sm bg-transparent border-b border-gray-200 dark:border-gray-700 border-white/10 pb-1.5 outline-none text-gray-200 placeholder-gray-700 focus:border-red-500/30"
                    />
                  </div>
                ))}
              </GlassPanel>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassPanel>
                <SectionHeader icon={Heart} title="Gratitude" accent="text-pink-400" />
                <textarea
                  placeholder="What are you grateful for right now?"
                  value={gratitude}
                  onChange={e => setGratitude(e.target.value)}
                  rows={3}
                  className="w-full text-sm bg-transparent resize-none outline-none text-gray-200 placeholder-gray-700"
                />
              </GlassPanel>
              <GlassPanel>
                <SectionHeader icon={Zap} title="Tomorrow's #1 Priority" accent="text-yellow-400" />
                <textarea
                  placeholder="The single non-negotiable thing you MUST do tomorrow..."
                  value={tomorrow}
                  onChange={e => setTomorrow(e.target.value)}
                  rows={3}
                  className="w-full text-sm bg-transparent resize-none outline-none text-gray-200 placeholder-gray-700"
                />
              </GlassPanel>
            </div>

            <div className="flex justify-end items-center gap-4">
              {(lastSaved || isAutoSaving) && (
                <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  {isAutoSaving ? (
                    <><RefreshCcw className="w-3 h-3 animate-spin" /> Auto-saving...</>
                  ) : (
                    <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Last saved {lastSaved}</>
                  )}
                </span>
              )}
              <button
                onClick={handleSaveDay}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'SYNCING...' : 'COMMIT DAY LOG'}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* SECTION: HABIT TRACKER */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'habits' && (
          <div className="space-y-6">
            {/* Atomic Habits Scorecard Summary */}
            <GlassPanel>
              <SectionHeader icon={CheckCircle2} title="Atomic Habits Scorecard" subtitle="Track your habit score — good (+1), bad (-1), neutral (0)" accent="text-emerald-400" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-emerald-500/10 border border-gray-200 dark:border-gray-700 border-emerald-500/20 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-emerald-400">{habitsCompleted}/{habits.length}</p>
                  <p className="text-[10px] text-emerald-300 font-bold uppercase">Completed</p>
                </div>
                <div className="bg-cyan-500/10 border border-gray-200 dark:border-gray-700 border-cyan-500/20 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-cyan-400">{habitScore > 0 ? '+' : ''}{habitScore}</p>
                  <p className="text-[10px] text-cyan-300 font-bold uppercase">Net Score</p>
                </div>
                <div className="bg-green-500/10 border border-gray-200 dark:border-gray-700 border-green-500/20 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-green-400">{scorecardPlus}</p>
                  <p className="text-[10px] text-green-300 font-bold uppercase">Good Habits</p>
                </div>
                <div className="bg-red-500/10 border border-gray-200 dark:border-gray-700 border-red-500/20 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-red-400">{scorecardMinus}</p>
                  <p className="text-[10px] text-red-300 font-bold uppercase">Bad Habits</p>
                </div>
              </div>
              <div className="w-full h-3 bg-white dark:bg-gray-800/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    habitCompletionRate >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                    habitCompletionRate >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                    'bg-gradient-to-r from-red-500 to-orange-500'
                  }`}
                  style={{ width: `${habitCompletionRate}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">{habitCompletionRate}% completion rate</p>
            </GlassPanel>

            {/* Add Habit / Toggle Scorecard */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddHabit(!showAddHabit)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-gray-200 dark:border-gray-700 border-blue-500/30 rounded-xl text-blue-400 text-xs font-bold hover:bg-blue-600/30 transition-all"
              >
                <Plus className="w-3 h-3" />
                {showAddHabit ? 'CANCEL' : 'ADD HABIT'}
              </button>
              <button
                onClick={() => setShowScorecard(!showScorecard)}
                className={`flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold transition-all ${
                  showScorecard
                    ? 'bg-purple-600/20 border-purple-500/30 text-purple-400 hover:bg-purple-600/30'
                    : 'bg-white dark:bg-gray-800/5 border-white/10 text-gray-500 dark:text-gray-400 hover:bg-white dark:bg-gray-800/10'
                }`}
              >
                <Target className="w-3 h-3" />
                {showScorecard ? 'HIDE SCORECARD' : 'SHOW SCORECARD'}
              </button>
            </div>

            {/* Add Habit Form */}
            {showAddHabit && (
              <GlassPanel className="border-blue-500/20">
                <h3 className="text-sm font-bold text-blue-400 mb-3">Add Custom Habit</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newHabitName}
                    onChange={e => setNewHabitName(e.target.value)}
                    placeholder="Habit name"
                    className="bg-white dark:bg-gray-800/5 border border-gray-200 dark:border-gray-700 border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500/50"
                  />
                  <select
                    value={newHabitCategory}
                    onChange={e => setNewHabitCategory(e.target.value as HabitItem['category'])}
                    className="bg-white dark:bg-gray-800/5 border border-gray-200 dark:border-gray-700 border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  >
                    {Object.keys(HABIT_CATEGORY_LABELS).map(c => (
                      <option key={c} value={c}>{HABIT_CATEGORY_LABELS[c].label}</option>
                    ))}
                  </select>
                  <select
                    value={newHabitDifficulty}
                    onChange={e => setNewHabitDifficulty(e.target.value as HabitItem['difficulty'])}
                    className="bg-white dark:bg-gray-800/5 border border-gray-200 dark:border-gray-700 border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="simple">Simple (2min)</option>
                    <option value="medium">Medium (10min)</option>
                    <option value="hard">Hard (30min)</option>
                    <option value="extreme">Extreme (1h+)</option>
                  </select>
                  <input
                    type="text"
                    value={newHabitCue}
                    onChange={e => setNewHabitCue(e.target.value)}
                    placeholder="Cue (e.g., After waking up)"
                    className="bg-white dark:bg-gray-800/5 border border-gray-200 dark:border-gray-700 border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500/50"
                  />
                  <select
                    value={newHabitStackAfter}
                    onChange={e => setNewHabitStackAfter(e.target.value)}
                    className="bg-white dark:bg-gray-800/5 border border-gray-200 dark:border-gray-700 border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="">No habit stack</option>
                    {habits.map(h => (
                      <option key={h.name} value={h.name}>After: {h.name}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 bg-white dark:bg-gray-800/5 border border-gray-200 dark:border-gray-700 border-white/10 rounded-lg px-3 py-2 text-sm text-gray-400 dark:text-gray-600 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newHabitTwoMinute}
                      onChange={e => setNewHabitTwoMinute(e.target.checked)}
                      className="rounded border-gray-500"
                    />
                    2-Minute Rule
                  </label>
                </div>
                <button
                  onClick={addCustomHabit}
                  disabled={!newHabitName.trim()}
                  className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded-lg text-xs font-bold text-white transition-all"
                >
                  ADD HABIT
                </button>
              </GlassPanel>
            )}

            {/* Habits by Category */}
            {habitCategories.map(cat => {
              const catInfo = HABIT_CATEGORY_LABELS[cat] || { label: cat, color: 'text-gray-500 dark:text-gray-400' }
              const catHabits = habits.map((h, i) => ({ ...h, index: i })).filter(h => h.category === cat)
              return (
                <GlassPanel key={cat}>
                  <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${catInfo.color}`}>
                    {catInfo.label}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {catHabits.map(habit => {
                      const Icon = habit.icon
                      const diffColors: Record<string, string> = {
                        simple: 'text-gray-500 dark:text-gray-400',
                        medium: 'text-amber-400',
                        hard: 'text-orange-400',
                        extreme: 'text-red-400',
                      }
                      const scorecardColors: Record<number, string> = {
                        1: 'border-emerald-500/40 bg-emerald-500/5',
                        '-1': 'border-red-500/40 bg-red-500/5',
                        0: '',
                      }
                      return (
                        <div
                          key={habit.name}
                          className={`flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 transition-all ${
                            habit.completed
                              ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15'
                              : scorecardColors[habit.scorecard] || 'bg-white dark:bg-gray-800/[0.02] border-white/5 hover:border-white/15'
                          }`}
                        >
                          <button
                            onClick={() => toggleHabit(habit.index)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                              habit.completed ? 'bg-emerald-500/20' : habit.bg
                            }`}
                          >
                            {habit.completed
                              ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              : <Icon className={`w-4 h-4 ${habit.color}`} />
                            }
                          </button>
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs font-bold block truncate ${
                              habit.completed ? 'text-emerald-300 line-through opacity-70' : 'text-gray-200'
                            }`}>{habit.name}</span>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className={`text-[10px] font-bold uppercase ${diffColors[habit.difficulty] || 'text-gray-500 dark:text-gray-400'}`}>
                                {habit.difficulty}
                              </span>
                              {habit.streak > 0 && (
                                <span className="text-[10px] font-bold text-orange-400 flex items-center gap-0.5">
                                  <Flame className="w-2.5 h-2.5" />{habit.streak}
                                </span>
                              )}
                              {habit.twoMinuteRule && (
                                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">2m</span>
                              )}
                              {habit.stackAfter && (
                                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded truncate max-w-[120px]" title={`After: ${habit.stackAfter}`}>
                                  → {habit.stackAfter}
                                </span>
                              )}
                            </div>
                            {habit.cue && (
                              <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 truncate">Cue: {habit.cue}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {showScorecard && (
                              <button
                                onClick={() => toggleScorecard(habit.index)}
                                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black transition-all ${
                                  habit.scorecard === 1 ? 'bg-emerald-500/20 text-emerald-400' :
                                  habit.scorecard === -1 ? 'bg-red-500/20 text-red-400' :
                                  'bg-white dark:bg-gray-800/5 text-gray-600 dark:text-gray-400 hover:bg-white dark:bg-gray-800/10'
                                }`}
                                title={habit.scorecard === 1 ? 'Good habit (+1)' : habit.scorecard === -1 ? 'Bad habit (-1)' : 'Neutral (0)'}
                              >
                                {habit.scorecard === 1 ? '+1' : habit.scorecard === -1 ? '-1' : '0'}
                              </button>
                            )}
                            <button
                              onClick={() => removeHabit(habit.index)}
                              className="w-6 h-6 rounded flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              title="Remove habit"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </GlassPanel>
              )
            })}

            {/* Habit Stacking Visualization */}
            <GlassPanel>
              <SectionHeader icon={Layers} title="Habit Stacking Chain" subtitle="Visualize your habit sequences — Atomic Habits method" accent="text-purple-400" />
              <div className="space-y-2">
                {habits.filter(h => h.stackAfter).map(habit => {
                  const parent = habits.find(h => h.name === habit.stackAfter)
                  return (
                    <div key={habit.name} className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded bg-white dark:bg-gray-800/5 ${parent?.completed ? 'text-emerald-400 line-through' : 'text-gray-500 dark:text-gray-400'}`}>
                        {habit.stackAfter}
                      </span>
                      <span className="text-purple-400 font-bold">→</span>
                      <span className={`px-2 py-1 rounded ${habit.completed ? 'bg-emerald-500/10 text-emerald-400 line-through' : 'bg-purple-500/10 text-purple-400'}`}>
                        {habit.name}
                      </span>
                    </div>
                  )
                })}
                {habits.filter(h => h.stackAfter).length === 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">No habit stacks configured. Add habits with "After:" triggers to build chains.</p>
                )}
              </div>
            </GlassPanel>

            <div className="flex justify-end items-center gap-4">
              {(lastSaved || isAutoSaving) && (
                <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  {isAutoSaving ? (
                    <><RefreshCcw className="w-3 h-3 animate-spin" /> Auto-saving...</>
                  ) : (
                    <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Last saved {lastSaved}</>
                  )}
                </span>
              )}
              <button
                onClick={async () => {
                  setIsSaving(true)
                  try {
                    const res = await fetch('/api/admin/discipline', {
                      method: 'POST',
                      headers: apiHeaders(),
                      body: JSON.stringify({
                        type: 'habits-bulk',
                        date: selectedDate,
                        habits: habits.map(h => ({
                          name: h.name,
                          category: h.category,
                          completed: h.completed,
                          difficulty: h.difficulty,
                          streak: h.streak,
                          scorecard: h.scorecard,
                          cue: h.cue,
                          stackAfter: h.stackAfter,
                          twoMinuteRule: h.twoMinuteRule,
                          timeSpent: h.timeSpent,
                        }))
                      })
                    })
                    const result = await res.json()
                    setSaveStatus(result.message || 'Habits synced')
                  } catch {
                    setSaveStatus('Saved locally')
                  } finally {
                    setIsSaving(false)
                    setTimeout(() => setSaveStatus(null), 3000)
                  }
                }}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'SYNCING...' : 'COMMIT HABITS'}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* SECTION: AI COACH */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'ai-coach' && (
          <div className="space-y-6">
            <GlassPanel>
              <SectionHeader icon={Brain} title="JARVIS AI Discipline Coach" subtitle="Powered by OpenRouter — AI-driven habit analysis and daily coaching" accent="text-purple-400" />
              
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { mode: 'daily-review' as const, label: 'Daily Review', desc: 'Analyze today\'s performance', color: 'from-purple-600 to-blue-600' },
                  { mode: 'habit-coaching' as const, label: 'Habit Analysis', desc: 'Get habit improvement tips', color: 'from-emerald-600 to-cyan-600' },
                  { mode: 'weekly-summary' as const, label: 'Weekly Summary', desc: 'Big picture discipline review', color: 'from-amber-600 to-orange-600' },
                ].map(opt => (
                  <button
                    key={opt.mode}
                    onClick={() => { setAiMode(opt.mode); requestAiCoaching(opt.mode) }}
                    disabled={aiLoading}
                    className={`flex-1 min-w-[200px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 transition-all ${
                      aiMode === opt.mode
                        ? `bg-gradient-to-r ${opt.color} border-transparent text-white shadow-lg`
                        : 'bg-white dark:bg-gray-800/[0.02] border-white/10 text-gray-500 dark:text-gray-400 hover:border-white/20'
                    } disabled:opacity-50`}
                  >
                    <div className="text-sm font-bold">{opt.label}</div>
                    <div className="text-[10px] opacity-70 mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>

              {aiLoading ? (
                <div className="flex flex-col items-center py-12 gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">JARVIS is analyzing your discipline data...</p>
                </div>
              ) : aiCoaching ? (
                <div className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-gray-200 dark:border-gray-700 border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-bold text-purple-400">JARVIS Analysis</span>
                    <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 rounded-full text-purple-300">AI-Powered</span>
                  </div>
                  <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{aiCoaching}</div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] text-gray-600 dark:text-gray-300">Model: Meta Llama 3.1 8B (Free) via OpenRouter</span>
                    <button
                      onClick={() => requestAiCoaching(aiMode)}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <RefreshCcw className="w-3 h-3" /> Refresh
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-600 dark:text-gray-300">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">Click a coaching mode above to get AI-powered discipline analysis</p>
                  <p className="text-[10px] mt-2 text-gray-700 dark:text-gray-200">Uses OpenRouter API with free Meta Llama model</p>
                </div>
              )}
            </GlassPanel>

            {/* Quick Stats for Context */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <GlassPanel className="text-center">
                <p className="text-2xl font-black text-cyan-400">{deepWorkHours}h</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Deep Work</p>
              </GlassPanel>
              <GlassPanel className="text-center">
                <p className="text-2xl font-black text-purple-400">{avgPillarScore}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Avg Score</p>
              </GlassPanel>
              <GlassPanel className="text-center">
                <p className="text-2xl font-black text-emerald-400">{habitsCompleted}/{habits.length}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Habits Done</p>
              </GlassPanel>
              <GlassPanel className="text-center">
                <p className="text-2xl font-black text-amber-400">{goalsCompleted}/48</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Goals Done</p>
              </GlassPanel>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* SECTION: DIARY / JOURNAL */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'diary' && (
          <div className="space-y-6">
            <GlassPanel>
              <SectionHeader icon={FileText} title="Daily Diary" subtitle="Write freely — AI helps you reflect. Download anytime." accent="text-amber-400" />

              {/* Mood Selector */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-2 block">How are you feeling?</label>
                <div className="flex gap-2">
                  {[
                    { mood: 'great', emoji: '😄', label: 'Great' },
                    { mood: 'good', emoji: '🙂', label: 'Good' },
                    { mood: 'neutral', emoji: '😐', label: 'Neutral' },
                    { mood: 'tired', emoji: '😴', label: 'Tired' },
                    { mood: 'stressed', emoji: '😰', label: 'Stressed' },
                    { mood: 'sad', emoji: '😢', label: 'Sad' },
                    { mood: 'motivated', emoji: '🔥', label: 'Motivated' },
                  ].map(m => (
                    <button key={m.mood} onClick={() => setDiaryMood(m.mood)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs transition-all ${
                        diaryMood === m.mood
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                          : 'border-white/10 text-gray-500 dark:text-gray-400 hover:border-white/20'
                      }`}>
                      <span className="text-lg">{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-2 block">Title (optional)</label>
                <input type="text" value={diaryTitle} onChange={e => setDiaryTitle(e.target.value)}
                  placeholder="What's on your mind today?"
                  className="w-full bg-white dark:bg-gray-800/5 border border-gray-200 dark:border-gray-700 border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500/50 outline-none placeholder-gray-600" />
              </div>

              {/* Content */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-2 block">Journal Entry</label>
                <textarea value={diaryContent} onChange={e => setDiaryContent(e.target.value)}
                  placeholder="Write about your day, thoughts, goals, challenges, or anything you want to reflect on..."
                  rows={12}
                  className="w-full bg-white dark:bg-gray-800/5 border border-gray-200 dark:border-gray-700 border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500/50 outline-none placeholder-gray-600 resize-none leading-relaxed" />
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 text-right">{diaryContent.split(/\s+/).filter(Boolean).length} words</p>
              </div>

              {/* Tags */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {diaryTags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-amber-500/10 border border-gray-200 dark:border-gray-700 border-amber-500/30 rounded-full text-xs text-amber-400 flex items-center gap-1">
                      #{tag}
                      <button onClick={() => setDiaryTags(diaryTags.filter((_, j) => j !== i))} className="text-amber-600 hover:text-amber-400">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={diaryTagInput} onChange={e => setDiaryTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && diaryTagInput.trim()) { setDiaryTags([...diaryTags, diaryTagInput.trim()]); setDiaryTagInput('') } }}
                    placeholder="Add a tag and press Enter"
                    className="flex-1 bg-white dark:bg-gray-800/5 border border-gray-200 dark:border-gray-700 border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-amber-500/50 outline-none placeholder-gray-600" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button onClick={async () => {
                  if (!diaryContent.trim()) return
                  setDiaryLoading(true)
                  try {
                    const res = await fetch('/api/admin/discipline', {
                      method: 'POST',
                      headers: apiHeaders(),
                      body: JSON.stringify({
                        type: 'diary',
                        date: selectedDate,
                        title: diaryTitle,
                        content: diaryContent,
                        mood: diaryMood,
                        tags: diaryTags,
                        ai_suggestion: diarySuggestion,
                      }),
                    })
                    const data = await res.json()
                    if (data.success) {
                      setSaveStatus('Diary saved ✅')
                      setTimeout(() => setSaveStatus(null), 2000)
                    }
                  } catch { /* silent */ }
                  finally { setDiaryLoading(false) }
                }} disabled={!diaryContent.trim() || diaryLoading}
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {diaryLoading ? 'Saving...' : 'Save Diary'}
                </button>

                <button onClick={async () => {
                  if (!diaryContent.trim()) return
                  setDiaryLoading(true)
                  try {
                    const res = await fetch('/api/admin/discipline/coaching', {
                      method: 'POST',
                      headers: apiHeaders(),
                      body: JSON.stringify({
                        mode: 'diary-reflection',
                        content: diaryContent,
                        mood: diaryMood,
                      }),
                    })
                    const data = await res.json()
                    if (data.success && data.response) {
                      setDiarySuggestion(data.response)
                    }
                  } catch { /* silent */ }
                  finally { setDiaryLoading(false) }
                }} disabled={!diaryContent.trim() || diaryLoading}
                  className="px-6 py-3 bg-white dark:bg-gray-800/5 border border-gray-200 dark:border-gray-700 border-white/10 hover:bg-white dark:bg-gray-800/10 text-gray-400 dark:text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Reflect on this
                </button>

                <button onClick={() => {
                  const today = selectedDate
                  const text = `# Diary — ${today}\n\nMood: ${diaryMood}\n${diaryTitle ? `Title: ${diaryTitle}\n` : ''}\n${diaryContent}\n${diaryTags.length ? `\nTags: ${diaryTags.map(t => '#' + t).join(' ')}` : ''}${diarySuggestion ? `\n\n--- AI Reflection ---\n${diarySuggestion}` : ''}`
                  const blob = new Blob([text], { type: 'text/markdown' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `diary-${today}.md`
                  a.click()
                  URL.revokeObjectURL(url)
                }} disabled={!diaryContent.trim()}
                  className="px-6 py-3 bg-white dark:bg-gray-800/5 border border-gray-200 dark:border-gray-700 border-white/10 hover:bg-white dark:bg-gray-800/10 text-gray-400 dark:text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
                  <FileDown className="w-4 h-4" />
                  Download .md
                </button>
              </div>
            </GlassPanel>

            {/* AI Reflection */}
            {diarySuggestion && (
              <GlassPanel className="border-amber-500/20">
                <SectionHeader icon={Brain} title="AI Reflection" accent="text-amber-400" />
                <p className="text-sm text-gray-400 dark:text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{diarySuggestion}</p>
              </GlassPanel>
            )}

            {/* Past Entries */}
            <GlassPanel>
              <SectionHeader icon={Calendar} title="Past Entries" accent="text-gray-500 dark:text-gray-400" />
              <div className="space-y-3">
                {/* This shows entries from Supabase if loaded */}
                {savedDiary && (
                  <div className="p-4 bg-white dark:bg-gray-800/5 rounded-xl border border-gray-200 dark:border-gray-700 border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{savedDiary.date}</span>
                      <span className="text-xs">{savedDiary.mood}</span>
                    </div>
                    {savedDiary.title && <p className="text-sm font-bold text-white mb-1">{savedDiary.title}</p>}
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">{savedDiary.content}</p>
                  </div>
                )}
                <p className="text-xs text-gray-600 dark:text-gray-300 text-center">Entries are saved to Supabase and loaded on date change.</p>
              </div>
            </GlassPanel>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* SECTION: 12× GOALS */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'goals' && (
          <div className="space-y-6">
            {/* Overall Progress */}
            <GlassPanel>
              <div className="flex items-center justify-between mb-4">
                <SectionHeader icon={Target} title="12× Parallel Goals Tracker" subtitle="Track all 48 targets across your 4 goal categories" accent="text-cyan-400" />
                <div className="text-right">
                  <p className="text-3xl font-black text-cyan-400">{goalsCompleted}/48</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">goals done</p>
                </div>
              </div>
              <div className="w-full h-3 bg-white dark:bg-gray-800/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${(goalsCompleted / 48) * 100}%` }}
                />
              </div>
              <div className="mt-2 text-right text-xs text-gray-500 dark:text-gray-400">{((goalsCompleted / 48) * 100).toFixed(1)}% complete</div>
            </GlassPanel>

            {/* Goal Category Grids */}
            {goalCategories.map(category => {
              const catDone = category.goals.filter(g => g.status === 'done').length
              return (
                <GlassPanel key={category.id}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className={`text-lg font-black tracking-tight ${category.color}`}>{category.label}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{catDone}/12 done</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {category.goals.map((goal, idx) => (
                      <div key={goal.id} className="bg-white dark:bg-gray-800/[0.02] border border-gray-200 dark:border-gray-700 border-white/5 rounded-xl p-3 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-black ${category.color} w-5`}>#{idx + 1}</span>
                          <input
                            type="text"
                            placeholder={`${category.label.replace('12 ', '')} name...`}
                            value={goal.name}
                            onChange={e => updateGoal(category.id, goal.id, 'name', e.target.value)}
                            className="flex-1 text-xs bg-transparent outline-none text-gray-200 placeholder-gray-700 font-medium"
                          />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <select
                            value={goal.status}
                            onChange={e => updateGoal(category.id, goal.id, 'status', e.target.value)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer outline-none ${STATUS_COLORS[goal.status]} bg-transparent`}
                          >
                            <option value="planning">Planning</option>
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="done">Done</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Metric (KSh / %)..."
                            value={goal.metric}
                            onChange={e => updateGoal(category.id, goal.id, 'metric', e.target.value)}
                            className="flex-1 text-[10px] bg-transparent outline-none text-gray-500 dark:text-gray-400 placeholder-gray-700"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Quick note..."
                          value={goal.note}
                          onChange={e => updateGoal(category.id, goal.id, 'note', e.target.value)}
                          className="w-full text-[10px] bg-transparent border-b border-gray-200 dark:border-gray-700 border-white/5 pb-0.5 outline-none text-gray-600 dark:text-gray-300 placeholder-gray-800 focus:border-white/10"
                        />
                      </div>
                    ))}
                  </div>
                </GlassPanel>
              )
            })}

            {/* Passive Income Matrix */}
            <GlassPanel>
              <SectionHeader icon={TrendingUp} title="Passive Income Matrix" subtitle={`${passiveCompleted}/${PASSIVE_INCOME_STREAMS.length} income streams activated`} accent="text-emerald-400" />
              <div className="w-full h-2 bg-white dark:bg-gray-800/5 rounded-full overflow-hidden mb-5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all"
                  style={{ width: `${(passiveCompleted / PASSIVE_INCOME_STREAMS.length) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {PASSIVE_INCOME_STREAMS.map((stream, i) => (
                  <label
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all ${
                      passiveChecked[i]
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-white dark:bg-gray-800/[0.02] border-white/5 text-gray-500 dark:text-gray-400 hover:border-white/10'
                    }`}
                  >
                    {passiveChecked[i]
                      ? <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      : <Square className="w-4 h-4 flex-shrink-0" />
                    }
                    <span className="text-xs font-medium">{stream}</span>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={passiveChecked[i]}
                      onChange={() => setPassiveChecked(prev => prev.map((c, j) => j === i ? !c : c))}
                    />
                  </label>
                ))}
              </div>
            </GlassPanel>

            <div className="flex justify-end">
              <button
                onClick={handleSaveGoals}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'SYNCING...' : 'COMMIT GOALS'}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* SECTION: REVIEWS & REPORTS */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'reviews' && (
          <div className="space-y-6">
            {/* Action Bar for Automations */}
            <div className="flex flex-wrap gap-3 mb-4">
              <button onClick={generatePDFReport} disabled={isExportingPDF}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-gray-200 dark:border-gray-700 border-indigo-500/30 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                {isExportingPDF ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                Export PDF
              </button>
              
              <button onClick={sendToZapier} disabled={isZapping}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-gray-200 dark:border-gray-700 border-amber-500/30 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                {isZapping ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Dispatch via Zapier (Email / WhatsApp)
              </button>
            </div>

            <GlassPanel id="review-export-container">
              <SectionHeader icon={Calendar} title="Structured Assessment Reviews" subtitle="Radical honesty is non-negotiable" accent="text-amber-400" />
              <div className="flex flex-wrap gap-2 mb-6" data-html2canvas-ignore="true">
                {Object.keys(REVIEW_TEMPLATES).map(type => (
                  <button
                    key={type}
                    onClick={() => setReviewType(type as any)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide border border-gray-200 dark:border-gray-700 transition-all ${
                      reviewType === type
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-white dark:bg-gray-800/5 text-gray-500 dark:text-gray-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="mb-8 border-b border-gray-200 dark:border-gray-700 border-white/10 pb-4">
                <h3 className="text-xl font-black text-amber-400 uppercase tracking-widest">{REVIEW_TEMPLATES[reviewType].title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-mono">Date: {selectedDate}</p>
              </div>

              <div className="space-y-6">
                {REVIEW_TEMPLATES[reviewType].prompts.map((prompt, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800/[0.02] border border-gray-200 dark:border-gray-700 border-white/5 rounded-xl p-5">
                    <p className="text-sm text-amber-100 font-bold mb-3">
                      <span className="text-amber-500 font-black mr-2">Q{i + 1}.</span>{prompt}
                    </p>
                    <textarea
                      placeholder="Answer with radical honesty..."
                      value={reviewAnswers[i] || ''}
                      onChange={e => setReviewAnswers(prev => prev.map((a, j) => j === i ? e.target.value : a))}
                      rows={4}
                      className="w-full text-base bg-transparent resize-none outline-none text-white placeholder-gray-700"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end" data-html2canvas-ignore="true">
                <button
                  onClick={handleSaveReview}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl font-black tracking-widest text-sm hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
                >
                  {isSaving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isSaving ? 'SAVING...' : `COMMIT ${reviewType.toUpperCase()} REVIEW`}
                </button>
              </div>
            </GlassPanel>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* SECTION: WISDOM & MENTORS */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'mentors' && (
          <div className="space-y-6">
            
            {/* AI Wisdom Feed */}
            <GlassPanel>
              <SectionHeader icon={Brain} title="JARVIS Intelligence Feed" subtitle="Automated daily insights, alerts, and wisdom" accent="text-blue-400" />
              {loadingWisdom ? (
                <div className="py-10 flex justify-center text-blue-500"><RefreshCcw className="w-6 h-6 animate-spin" /></div>
              ) : wisdomFeed.length > 0 ? (
                <div className="space-y-3">
                  {wisdomFeed.map(item => (
                    <div key={item.id} className="bg-blue-500/5 border border-gray-200 dark:border-gray-700 border-blue-500/20 rounded-xl p-4 flex gap-3">
                      {item.type === 'alert' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
                      {item.type === 'insight' && <Brain className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />}
                      {item.type === 'action' && <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
                      {item.type === 'news' && <MessageSquare className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
                      <div>
                        <p className="text-sm text-gray-200">{item.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">No new intelligence available today.</div>
              )}
            </GlassPanel>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MENTORS.map(mentor => (
                <GlassPanel key={mentor.name} className="cursor-pointer" >
                  <button
                    className="w-full text-left"
                    onClick={() => setExpandedMentor(expandedMentor === mentor.name ? null : mentor.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-black text-base ${mentor.accent}`}>{mentor.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">{mentor.title}</p>
                      </div>
                      {expandedMentor === mentor.name
                        ? <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      }
                    </div>
                  </button>
                  {expandedMentor === mentor.name && (
                    <ul className="mt-4 space-y-2">
                      {mentor.rules.map((rule, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-400 dark:text-gray-600 dark:text-gray-300">
                          <span className={`font-black ${mentor.accent} mt-0.5`}>→</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  )}
                </GlassPanel>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ANCIENT_WISDOM.map(wisdom => (
                <GlassPanel key={wisdom.name}>
                  <button
                    className="w-full text-left"
                    onClick={() => setExpandedWisdom(expandedWisdom === wisdom.name ? null : wisdom.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-black text-base ${wisdom.accent}`}>{wisdom.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{wisdom.book}"</p>
                      </div>
                      {expandedWisdom === wisdom.name
                        ? <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      }
                    </div>
                  </button>
                  {expandedWisdom === wisdom.name && (
                    <ul className="mt-4 space-y-2">
                      {wisdom.keys.map((key, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-400 dark:text-gray-600 dark:text-gray-300 italic">
                          <span className={`font-black not-italic ${wisdom.accent} mt-0.5`}>"</span>
                          {key}
                        </li>
                      ))}
                    </ul>
                  )}
                </GlassPanel>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* SECTION: FINANCE LAWS */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'finance' && (
          <div className="space-y-4">
            <GlassPanel>
              <SectionHeader icon={DollarSign} title="Debt Trap Formulas" subtitle="Never violate these rules. Ever." accent="text-red-400" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {DEBT_RULES.map(rule => (
                  <div key={rule.rule} className={`rounded-xl p-4 border border-gray-200 dark:border-gray-700 ${rule.color}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">{rule.rule}</p>
                    <h4 className="text-sm font-black text-white mb-1">{rule.title}</h4>
                    <p className="text-xs text-cyan-400 font-mono font-bold mb-2">{rule.formula}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{rule.desc}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel>
              <SectionHeader icon={BarChart2} title="Financial Rules Cheat Sheet" accent="text-emerald-400" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: '50/30/20 Budget Rule', desc: '50% needs, 30% wants, 20% savings & debt payoff. Non-negotiable baseline for financial sanity.', color: 'text-emerald-400' },
                  { title: 'Pay Yourself First', desc: 'Automatically transfer 20%+ of every income to savings before touching it. Automate this. No exceptions.', color: 'text-cyan-400' },
                  { title: 'Never Use Credit for Depreciating Assets', desc: 'Credit is only justified for assets that appreciate (real estate, business) or generate cash flow. Cars, phones, and clothes are not investments.', color: 'text-yellow-400' },
                  { title: 'Net Worth Tracking (Monthly)', desc: 'Net Worth = Assets − Liabilities. Track this monthly. It is the only financial metric that truly matters long-term.', color: 'text-purple-400' },
                  { title: 'The Latte Factor', desc: 'KSh 500/day in small purchases = KSh 180,000/year = >1M KSh invested over 5 years at 10% returns. Small habits compound ruthlessly.', color: 'text-amber-400' },
                  { title: 'Never Accept a Single Income Stream', desc: 'The wealthy have 7+ income streams. Your goal is 12. Start with one, build the second while the first runs, repeat.', color: 'text-rose-400' },
                ].map(item => (
                  <div key={item.title} className="bg-white dark:bg-gray-800/[0.02] border border-gray-200 dark:border-gray-700 border-white/5 rounded-xl p-4">
                    <h4 className={`text-sm font-black mb-2 ${item.color}`}>{item.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>
        )}
      </div>
    </div>
  )
}
