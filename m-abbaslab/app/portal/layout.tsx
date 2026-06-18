'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, FileText, Presentation, FolderKanban,
  UserCircle, LogOut, Shield, ChevronRight, Zap
} from 'lucide-react'
import { QISAuthProvider, useQISAuth } from '@/lib/qis-auth'

const navItems = [
  { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portal/doctrine', label: 'Doctrine', icon: FileText },
  { href: '/portal/decks', label: 'Strategy Decks', icon: Presentation },
  { href: '/portal/projects', label: 'Projects', icon: FolderKanban },
  { href: '/portal/profile', label: 'Profile', icon: UserCircle },
]

const roleColors: Record<string, string> = {
  associate: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  core: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  leadership: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  admin: 'text-red-400 bg-red-500/10 border-red-500/20',
}

function PortalSidebar() {
  const pathname = usePathname()
  const { member, signOut } = useQISAuth()

  return (
    <aside className="w-64 min-h-screen border-r border-white/5 bg-black/40 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/portal" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
            <span className="text-lg font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Q</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white">QIS Portal</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Member Access</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'}`} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 text-blue-400" />}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      {member && (
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{member.full_name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{member.full_name}</div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${roleColors[member.role] || 'text-gray-400 bg-white/5 border-white/10'}`}>
                <Shield className="w-2.5 h-2.5 mr-1" />
                {member.role}
              </span>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  )
}

function PortalHeader() {
  const { member } = useQISAuth()
  return (
    <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-sm flex items-center justify-between px-8">
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Zap className="w-3 h-3 text-blue-400" />
        <span>Quantum Impact Syndicate</span>
        <span className="text-gray-700">/</span>
        <span className="text-gray-400">Member Portal</span>
      </div>
      {member && (
        <div className="text-xs text-gray-400">
          {member.email}
        </div>
      )}
    </header>
  )
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <QISAuthProvider>
      <div className="flex min-h-screen bg-[#020108]">
        <PortalSidebar />
        <div className="flex-1 flex flex-col">
          <PortalHeader />
          <main className="flex-1 p-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </QISAuthProvider>
  )
}
