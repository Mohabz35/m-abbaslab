import { supabase, hasSupabaseKeys } from './supabase'
import { personalConfig } from '@/config/personal'

export async function getLiveConfig() {
  if (!hasSupabaseKeys) {
    return personalConfig
  }

  try {
    // Fetch individual data tables in parallel
    const [siteConfigRes, projectsRes, articlesRes, fashionRes, runwayRes] = await Promise.all([
      supabase.from('site_config').select('*'),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('articles').select('*').order('created_at', { ascending: false }),
      supabase.from('fashion_items').select('*').order('created_at', { ascending: false }),
      supabase.from('runway_journey').select('*').order('year', { ascending: false }),
    ])

    const config: any = { ...personalConfig }

    // Merge site_config key/value pairs
    if (!siteConfigRes.error && siteConfigRes.data) {
      for (const row of siteConfigRes.data) {
        if (row.key && row.value !== undefined) {
          config[row.key] = row.value
        }
      }
    }

    // Override with data from individual tables if they exist
    if (!projectsRes.error && projectsRes.data && projectsRes.data.length > 0) {
      config.projects = projectsRes.data
    }
    if (!articlesRes.error && articlesRes.data && articlesRes.data.length > 0) {
      config.articles = articlesRes.data
    }
    if (!fashionRes.error && fashionRes.data && fashionRes.data.length > 0) {
      config.fashionItems = fashionRes.data
      // Build fashion sub-object from fashion_items
      const categories = new Set(fashionRes.data.map((f: any) => f.collection || f.category).filter(Boolean))
      config.fashion = {
        ...config.fashion,
        categories: Array.from(categories).map((c: any) => ({ id: c, name: c, count: fashionRes.data.filter((f: any) => (f.collection || f.category) === c).length })),
        titles: fashionRes.data.map((f: any) => ({
          id: f.id,
          image: f.image_url || '',
          title: f.title,
          category: f.collection || f.category,
          description: f.description || '',
          location: f.location || '',
        })),
      }
    }
    if (!runwayRes.error && runwayRes.data && runwayRes.data.length > 0) {
      config.runwayJourney = runwayRes.data
    }

    return config
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
    // Save config keys individually
    for (const [key, value] of Object.entries(configData)) {
      if (['projects', 'articles', 'fashionItems', 'runwayJourney'].includes(key)) continue
      const { error } = await supabase
        .from('site_config')
        .upsert({ key, value }, { onConflict: 'key' })
      if (error) throw error
    }
    return true
  } catch (e) {
    console.error('Failed to save config to Supabase:', e)
    return false
  }
}
