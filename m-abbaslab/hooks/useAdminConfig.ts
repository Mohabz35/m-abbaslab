'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  fetchSiteConfig,
  saveSiteConfig,
  type SiteConfig,
} from '@/lib/adminConfigClient'
import { personalConfig } from '@/config/personal'

export function useAdminConfig() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSiteConfig()
      setConfig(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load configuration')
      setConfig(personalConfig as SiteConfig)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const save = useCallback(
    async (next: SiteConfig) => {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)
      const result = await saveSiteConfig(next)
      if (!result.ok) {
        setError(result.message || 'Save failed')
        setSaving(false)
        return false
      }
      setConfig(next)
      setSuccessMessage(result.message || 'Saved successfully')
      setSaving(false)
      return true
    },
    [],
  )

  const updateConfig = useCallback(
    async (updater: (current: SiteConfig) => SiteConfig) => {
      const base = config ?? (personalConfig as SiteConfig)
      const next = updater(base)
      return save(next)
    },
    [config, save],
  )

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccessMessage(null)
  }, [])

  return {
    config,
    loading,
    saving,
    error,
    successMessage,
    reload,
    save,
    updateConfig,
    clearMessages,
  }
}
