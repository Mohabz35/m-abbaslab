import { supabase, hasSupabaseKeys } from './supabase'
import { personalConfig } from '@/config/personal'

export async function getLiveConfig() {
  if (!hasSupabaseKeys) {
    return personalConfig
  }

  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('config_data')
      .eq('id', 1)
      .single()

    if (!error && data && data.config_data) {
      return data.config_data
    }
  } catch (e) {
    console.error('Failed to fetch config from Supabase:', e)
  }

  return personalConfig
}

export async function saveLiveConfig(configData: any) {
  if (!hasSupabaseKeys) {
    return false
  }

  try {
    const { error } = await supabase
      .from('site_config')
      .upsert({ id: 1, config_data: configData })

    return !error
  } catch (e) {
    console.error('Failed to save config to Supabase:', e)
    return false
  }
}
