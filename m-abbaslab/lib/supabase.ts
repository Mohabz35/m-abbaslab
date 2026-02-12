// lib/supabase.ts - IMPROVED MOCK VERSION
// This prevents TypeScript errors while we build the static site

// Create a chainable mock query builder
const createMockQuery = () => {
  let data: any[] = []
  let error = null

  const query = {
    select: () => query,
    eq: () => query,
    order: () => query,
    limit: () => query,
    then: (callback: (result: { data: any[]; error: any }) => void) => {
      // Simulate async response
      setTimeout(() => {
        callback({ data, error })
      }, 100)
      return { catch: () => { } }
    },
    catch: () => ({})
  }

  return query
}

export const supabase = {
  from: (table: string) => {
    console.log(`🔧 Mock Supabase: Accessing table "${table}"`)

    // Return different mock data based on table
    if (table === 'articles') {
      const mockArticles = [
        {
          id: '1',
          title: 'Getting Started with Next.js 14',
          slug: 'nextjs-14-guide',
          excerpt: 'Learn how to build modern web applications with Next.js 14',
          content: 'Full article content here...',
          category: 'tutorial',
          read_time: 5,
          published: true,
          published_at: '2024-01-15T10:30:00Z',
          created_at: '2024-01-10T10:30:00Z'
        },
        {
          id: '2',
          title: 'AI in Fashion Technology',
          slug: 'ai-fashion-tech',
          excerpt: 'Exploring how artificial intelligence is transforming the fashion industry',
          content: 'Full article content here...',
          category: 'research',
          read_time: 8,
          published: true,
          published_at: '2024-01-10T10:30:00Z',
          created_at: '2024-01-05T10:30:00Z'
        }
      ]

      const query = createMockQuery()
      query.then = (callback: (result: { data: any[]; error: any }) => void) => {
        setTimeout(() => {
          callback({ data: mockArticles, error: null })
        }, 100)
        return { catch: () => { } }
      }
      return query
    }

    if (table === 'projects') {
      const mockProjects = [
        {
          id: '1',
          title: 'M-AbbasLab Platform',
          description: 'Personal operating platform',
          published: true,
          category: 'software'
        }
      ]

      const query = createMockQuery()
      query.then = (callback: (result: { data: any[]; error: any }) => void) => {
        setTimeout(() => {
          callback({ data: mockProjects, error: null })
        }, 100)
        return { catch: () => { } }
      }
      return query
    }

    // Default empty response
    const query = createMockQuery()
    query.then = (callback: (result: { data: any[]; error: any }) => void) => {
      setTimeout(() => {
        callback({ data: [], error: null })
      }, 100)
      return { catch: () => { } }
    }
    return query
  },

  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    signOut: () => Promise.resolve({ error: null })
  }
}

console.log('🔧 Using improved mock Supabase (static mode)')
