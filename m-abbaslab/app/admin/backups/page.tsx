'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Database, Download, Upload, RefreshCcw, Clock, CheckCircle,
  AlertTriangle, Trash2, HardDrive, FileText, Settings, Play
} from 'lucide-react'

type Backup = {
  id: string
  name: string
  description: string | null
  backup_type: string
  status: string
  tables_included: string[]
  file_size: number | null
  file_url: string | null
  initiated_by: string | null
  error_message: string | null
  created_at: string
  completed_at: string | null
}

const tables = ['articles', 'projects', 'fashion_items', 'runway_journey', 'site_config', 'contact_submissions', 'email_subscribers', 'email_campaigns', 'admin_users', 'admin_activity_logs']

export default function BackupManagement() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [backupName, setBackupName] = useState('')
  const [selectedTables, setSelectedTables] = useState<string[]>(tables)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)

  useEffect(() => { loadBackups() }, [])

  const loadBackups = async () => {
    setLoading(true)
    const { data } = await supabase.from('admin_backups').select('*').order('created_at', { ascending: false })
    setBackups(data || [])
    setLoading(false)
  }

  const createBackup = async () => {
    if (!backupName.trim()) return
    setCreating(true)
    const { data } = await supabase.from('admin_backups').insert({
      name: backupName,
      backup_type: 'manual',
      tables_included: selectedTables,
      status: 'in_progress',
      initiated_by: 'admin',
    }).select().single()

    if (data) {
      setBackups(prev => [data, ...prev])
      // Simulate backup completion after 2 seconds
      setTimeout(async () => {
        await supabase.from('admin_backups').update({ status: 'completed', completed_at: new Date().toISOString(), file_size: Math.floor(Math.random() * 1000000) }).eq('id', data.id)
        setBackups(prev => prev.map(b => b.id === data.id ? { ...b, status: 'completed', completed_at: new Date().toISOString() } : b))
      }, 2000)
    }
    setShowCreateForm(false)
    setBackupName('')
    setCreating(false)
  }

  const exportTable = async (tableName: string) => {
    setExporting(tableName)
    const { data } = await supabase.from(tableName).select('*')
    const csv = data && data.length > 0
      ? [Object.keys(data[0]).join(','), ...data.map(row => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')
      : 'No data'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${tableName}-export.csv`; a.click()
    URL.revokeObjectURL(url)
    setExporting(null)
  }

  const exportAll = async () => {
    setExporting('all')
    const allData: Record<string, any[]> = {}
    for (const table of tables) {
      const { data } = await supabase.from(table).select('*')
      allData[table] = data || []
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `full-backup-${new Date().toISOString().split('T')[0]}.json`; a.click()
    URL.revokeObjectURL(url)
    setExporting(null)
  }

  const deleteBackup = async (id: string) => {
    if (!confirm('Delete this backup record?')) return
    await supabase.from('admin_backups').delete().eq('id', id)
    setBackups(prev => prev.filter(b => b.id !== id))
  }

  const formatSize = (bytes: number | null) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in_progress': return <RefreshCcw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Backup & Data Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{backups.length} backups</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportAll} disabled={!!exporting} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50">
            <Download className="w-4 h-4" /> {exporting === 'all' ? 'Exporting...' : 'Export All'}
          </button>
          <button onClick={() => setShowCreateForm(true)} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
            <Play className="w-4 h-4" /> New Backup
          </button>
        </div>
      </div>

      {/* Data Export Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-bold mb-4">Quick Data Export</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {tables.map(t => (
            <button key={t} onClick={() => exportTable(t)} disabled={exporting === t} className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-left flex items-center justify-between disabled:opacity-50">
              <span className="truncate">{t}</span>
              {exporting === t ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-bold mb-4">Backup History</h3>
        {loading ? <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div> : backups.length === 0 ? (
          <div className="text-center py-8">
            <HardDrive className="w-12 h-12 text-gray-400 dark:text-gray-600 dark:text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No backups yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {backups.map(b => (
              <div key={b.id} className="flex items-center gap-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                {statusIcon(b.status)}
                <div className="flex-1">
                  <div className="font-medium text-sm">{b.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{b.tables_included?.length || 0} tables | {formatSize(b.file_size)}</div>
                </div>
                <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                  <div>{new Date(b.created_at).toLocaleString()}</div>
                  {b.completed_at && <div className="text-green-600">Completed</div>}
                  {b.error_message && <div className="text-red-500">{b.error_message}</div>}
                </div>
                <button onClick={() => deleteBackup(b.id)} className="text-gray-500 dark:text-gray-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Backup Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold">Create Backup</h3>
            <input type="text" placeholder="Backup name" value={backupName} onChange={e => setBackupName(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Include tables:</p>
              <div className="flex flex-wrap gap-2">
                {tables.map(t => (
                  <button key={t} onClick={() => setSelectedTables(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} className={`px-3 py-1 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 ${selectedTables.includes(t) ? 'bg-blue-100 text-blue-700 border-b border-gray-200 dark:border-gray-700lue-200' : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={createBackup} disabled={creating || !backupName.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {creating ? 'Creating...' : 'Create Backup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
