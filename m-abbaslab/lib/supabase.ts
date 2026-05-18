import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// We create the client only if the keys are provided.
// If they are empty, this will throw an error when used, which is handled gracefully in components.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

export const hasSupabaseKeys = Boolean(supabaseUrl && supabaseAnonKey)
