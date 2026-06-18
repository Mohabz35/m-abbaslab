'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

type QISMember = {
  id: string
  full_name: string
  email: string
  role: 'associate' | 'core' | 'leadership' | 'admin'
  discipline: string | null
  institution: string | null
  nda_signed: boolean
  status: string
  applied_at: string | null
  approved_at: string | null
  profile_data: Record<string, any>
}

type QISAuthContextType = {
  member: QISMember | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (data: { email: string; password: string; full_name: string; discipline?: string; institution?: string }) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const QISAuthContext = createContext<QISAuthContextType | null>(null)

// Password validation
function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter'
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain a number'
  return null
}

// Email validation
function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Simple rate limiting (client-side, not bulletproof but deters abuse)
const attemptTracker = new Map<string, { count: number; resetAt: number }>()
function checkRateLimit(key: string, maxAttempts = 5, windowMs = 60000): boolean {
  const now = Date.now()
  const record = attemptTracker.get(key)
  if (!record || now > record.resetAt) {
    attemptTracker.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (record.count >= maxAttempts) return false
  record.count++
  return true
}

export function QISAuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<QISMember | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMember = async (userId: string) => {
    const { data } = await supabase
      .from('qis_members')
      .select('*')
      .eq('id', userId)
      .single()
    return data as QISMember | null
  }

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const m = await fetchMember(session.user.id)
        setMember(m)
      }
      setLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const m = await fetchMember(session.user.id)
        setMember(m)
      } else {
        setMember(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    // Rate limit
    if (!checkRateLimit(`signin-${email}`)) {
      return { error: 'Too many attempts. Please wait a minute.' }
    }

    // Validate email format
    if (!validateEmail(email)) {
      return { error: 'Invalid email format' }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      // Don't reveal if email exists or password was wrong
      return { error: 'Invalid email or password' }
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const m = await fetchMember(session.user.id)
      if (m && m.status === 'suspended') {
        await supabase.auth.signOut()
        return { error: 'Account has been suspended. Contact admin.' }
      }
      setMember(m)
    }
    return {}
  }

  const signUp = async (data: { email: string; password: string; full_name: string; discipline?: string; institution?: string }) => {
    // Rate limit
    if (!checkRateLimit(`signup-${data.email}`, 3, 300000)) {
      return { error: 'Too many signup attempts. Please wait 5 minutes.' }
    }

    // Validate email
    if (!validateEmail(data.email)) {
      return { error: 'Invalid email format' }
    }

    // Validate full name
    if (!data.full_name || data.full_name.trim().length < 2) {
      return { error: 'Full name is required' }
    }

    // Validate password
    const pwError = validatePassword(data.password)
    if (pwError) return { error: pwError }

    // Check if email already exists in qis_members
    const { data: existing } = await supabase
      .from('qis_members')
      .select('id')
      .eq('email', data.email)
      .single()

    if (existing) {
      return { error: 'An account with this email already exists' }
    }

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.full_name } },
    })
    if (error) return { error: error.message }

    // Create member profile
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await supabase.from('qis_members').insert({
        id: session.user.id,
        full_name: data.full_name.trim(),
        email: data.email.toLowerCase(),
        discipline: data.discipline || null,
        institution: data.institution || null,
        role: 'associate',
        status: 'pending',
      })

      await supabase.from('qis_applications').insert({
        full_name: data.full_name.trim(),
        email: data.email.toLowerCase(),
        discipline: data.discipline || null,
        institution: data.institution || null,
        accredited: false,
        nda_agreed: false,
      })

      const m = await fetchMember(session.user.id)
      setMember(m)
    }
    return {}
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setMember(null)
  }

  const refresh = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const m = await fetchMember(session.user.id)
      setMember(m)
    }
  }

  return (
    <QISAuthContext.Provider value={{ member, loading, signIn, signUp, signOut, refresh }}>
      {children}
    </QISAuthContext.Provider>
  )
}

export function useQISAuth() {
  const ctx = useContext(QISAuthContext)
  if (!ctx) throw new Error('useQISAuth must be used within QISAuthProvider')
  return ctx
}
