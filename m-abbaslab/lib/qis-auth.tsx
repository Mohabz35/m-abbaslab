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
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const m = await fetchMember(session.user.id)
      setMember(m)
    }
    return {}
  }

  const signUp = async (data: { email: string; password: string; full_name: string; discipline?: string; institution?: string }) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.full_name } },
    })
    if (error) return { error: error.message }

    // Create member profile and application
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await supabase.from('qis_members').insert({
        id: session.user.id,
        full_name: data.full_name,
        email: data.email,
        discipline: data.discipline || null,
        institution: data.institution || null,
        role: 'associate',
        status: 'pending',
      })

      await supabase.from('qis_applications').insert({
        full_name: data.full_name,
        email: data.email,
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
