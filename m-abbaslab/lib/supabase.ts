import { createClient } from '@supabase/supabase-js'

// Check if Supabase keys are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a real client if keys exist, otherwise use a mock for build/dev without keys
// Mock helper to return a chainable object
const createMockChain = () => {
  const chain = {
    select: () => createMockChain(),
    eq: () => createMockChain(),
    order: () => createMockChain(),
    limit: () => createMockChain(),
    range: () => createMockChain(),
    single: () => Promise.resolve({ data: null, error: { message: 'Supabase keys missing' } }),
    maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Supabase keys missing' } }),
    insert: () => Promise.resolve({ data: null, error: { message: 'Supabase keys missing' } }),
    update: () => Promise.resolve({ data: null, error: { message: 'Supabase keys missing' } }),
    delete: () => Promise.resolve({ data: null, error: { message: 'Supabase keys missing' } }),
    then: (cb: any) => cb({ data: [], error: { message: 'Supabase keys missing' } })
  }
  return chain
}

// Create a real client if keys exist, otherwise use a mock for build/dev without keys
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
    from: () => createMockChain(),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
      signOut: () => Promise.resolve({ error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase keys missing' } })
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: { message: 'Supabase keys missing' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    }
  } as any // Cast to any to avoid complex type matching with the mock

