// components/admin/AdminAuth.tsx
// Thin wrapper — real auth is handled by middleware + httpOnly cookie.
// This component just provides the admin shell (header, layout).

'use client'

import { useRouter } from 'next/navigation'
import { ShieldCheck, LogOut } from 'lucide-react'

export default function AdminAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sm text-gray-900 dark:text-white">M-AbbasLab Admin</h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Mission Control</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-xs text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Authenticated
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
