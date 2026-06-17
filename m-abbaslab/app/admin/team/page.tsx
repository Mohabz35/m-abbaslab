'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Users, UserPlus, Shield, ShieldCheck, ShieldAlert, Edit, Trash2,
  Save, X, Eye, Clock, Key, Activity, Search, Download
} from 'lucide-react'

type AdminUser = {
  id: string
  username: string
  email: string
  full_name: string | null
  role: string
  permissions: string[]
  avatar_url: string | null
  is_active: boolean
  two_factor_enabled: boolean
  last_login: string | null
  login_count: number
  created_at: string
}

type ActivityLog = {
  id: string
  username: string
  action: string
  resource_type: string | null
  resource_id: string | null
  ip_address: string | null
  created_at: string
}

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 border-red-200',
  editor: 'bg-blue-100 text-blue-700 border-blue-200',
  viewer: 'bg-gray-100 text-gray-600 border-gray-200',
}

const roleIcons: Record<string, typeof Shield> = {
  admin: ShieldAlert,
  editor: ShieldCheck,
  viewer: Eye,
}

export default function TeamManagement() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'users' | 'activity'>('users')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [form, setForm] = useState({ username: '', email: '', full_name: '', role: 'viewer', password: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [usersRes, logsRes] = await Promise.all([
      supabase.from('admin_users').select('*').order('created_at', { ascending: false }),
      supabase.from('admin_activity_logs').select('*').order('created_at', { ascending: false }).limit(100),
    ])
    setUsers(usersRes.data || [])
    setActivityLogs(logsRes.data || [])
    setLoading(false)
  }

  const saveUser = async () => {
    if (!form.username || !form.email) return
    if (editingUser) {
      const { data } = await supabase.from('admin_users').update({
        username: form.username, email: form.email, full_name: form.full_name, role: form.role,
        updated_at: new Date().toISOString()
      }).eq('id', editingUser.id).select().single()
      if (data) setUsers(prev => prev.map(u => u.id === editingUser.id ? data : u))
    } else {
      const { data } = await supabase.from('admin_users').insert({
        username: form.username, email: form.email, full_name: form.full_name, role: form.role,
        password_hash: form.password || 'pending',
      }).select().single()
      if (data) setUsers(prev => [data, ...prev])
    }
    setShowForm(false)
    setEditingUser(null)
    setForm({ username: '', email: '', full_name: '', role: 'viewer', password: '' })
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Remove this user?')) return
    await supabase.from('admin_users').delete().eq('id', id)
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('admin_users').update({ is_active: !current }).eq('id', id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !current } : u))
  }

  const filtered = users.filter(u => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.full_name && u.full_name.toLowerCase().includes(q))
  })

  const exportUsers = () => {
    const headers = ['Username', 'Email', 'Name', 'Role', 'Active', '2FA', 'Last Login', 'Created']
    const rows = filtered.map(u => [u.username, u.email, u.full_name || '', u.role, u.is_active ? 'Yes' : 'No', u.two_factor_enabled ? 'Yes' : 'No', u.last_login || 'Never', new Date(u.created_at).toLocaleDateString()])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'admin-users.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-sm text-gray-500">{users.length} admin users</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportUsers} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => { setShowForm(true); setEditingUser(null); setForm({ username: '', email: '', full_name: '', role: 'viewer', password: '' }) }} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button onClick={() => setView('users')} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
          <Users className="w-4 h-4 inline mr-2" /> Users ({users.length})
        </button>
        <button onClick={() => setView('activity')} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'activity' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
          <Activity className="w-4 h-4 inline mr-2" /> Activity Log ({activityLogs.length})
        </button>
      </div>

      {/* Users View */}
      {view === 'users' && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm" />
          </div>

          {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : filtered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium">User</th>
                    <th className="text-left px-4 py-3 font-medium">Role</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">2FA</th>
                    <th className="text-left px-4 py-3 font-medium">Last Login</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => {
                    const RoleIcon = roleIcons[u.role] || Eye
                    return (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                              {(u.full_name || u.username).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{u.full_name || u.username}</div>
                              <div className="text-xs text-gray-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${roleColors[u.role]}`}>
                            <RoleIcon className="w-3 h-3" /> {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleActive(u.id, u.is_active)} className={`px-2 py-1 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-xs">{u.two_factor_enabled ? <span className="text-green-600">Enabled</span> : <span className="text-gray-400">Disabled</span>}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => { setEditingUser(u); setForm({ username: u.username, email: u.email, full_name: u.full_name || '', role: u.role, password: '' }); setShowForm(true) }} className="text-gray-400 hover:text-blue-600 p-1"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => deleteUser(u.id)} className="text-gray-400 hover:text-red-600 p-1 ml-1"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Activity Log View */}
      {view === 'activity' && (
        <div className="bg-white rounded-xl border p-6">
          {loading ? <div className="text-center py-8 text-gray-500">Loading...</div> : activityLogs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No activity logs yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activityLogs.map(log => (
                <div key={log.id} className="flex items-center gap-3 py-2 border-b last:border-0 text-sm">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">{log.username.charAt(0).toUpperCase()}</div>
                  <div className="flex-1">
                    <span className="font-medium">{log.username}</span>
                    <span className="text-gray-500 mx-1">{log.action}</span>
                    {log.resource_type && <span className="text-blue-600">{log.resource_type}</span>}
                  </div>
                  <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold">{editingUser ? 'Edit User' : 'Add User'}</h3>
            <input type="text" placeholder="Username" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} className="w-full border rounded-lg px-4 py-3 text-sm" />
            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full border rounded-lg px-4 py-3 text-sm" />
            <input type="text" placeholder="Full Name" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} className="w-full border rounded-lg px-4 py-3 text-sm" />
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="w-full border rounded-lg px-4 py-3 text-sm">
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            {!editingUser && <input type="password" placeholder="Password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="w-full border rounded-lg px-4 py-3 text-sm" />}
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowForm(false); setEditingUser(null) }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={saveUser} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
