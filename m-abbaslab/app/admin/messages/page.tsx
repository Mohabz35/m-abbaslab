'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Mail, Search, Filter, Eye, Archive, Trash2, CheckCircle,
  Clock, AlertTriangle, MessageSquare, Download, ChevronDown,
  ArrowLeft, Send, User, Calendar, Tag
} from 'lucide-react'

type Submission = {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  inquiry_type: string
  status: string
  internal_notes: string | null
  assigned_to: string | null
  response_sent: boolean
  created_at: string
  updated_at: string
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  read: 'bg-gray-100 text-gray-700 border-gray-200',
  in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
  replied: 'bg-green-100 text-green-700 border-green-200',
  archived: 'bg-gray-100 text-gray-500 border-gray-200',
  spam: 'bg-red-100 text-red-700 border-red-200',
}

const statusLabels: Record<string, string> = {
  new: 'New',
  read: 'Read',
  in_progress: 'In Progress',
  replied: 'Replied',
  archived: 'Archived',
  spam: 'Spam',
}

export default function ContactSubmissionsManager() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })
    setSubmissions(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('contact_submissions').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    if (selectedSubmission?.id === id) {
      setSelectedSubmission(prev => prev ? { ...prev, status } : null)
    }
  }

  const saveNotes = async (id: string) => {
    await supabase.from('contact_submissions').update({ internal_notes: notes, updated_at: new Date().toISOString() }).eq('id', id)
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, internal_notes: notes } : s))
  }

  const deleteSubmission = async (id: string) => {
    if (!confirm('Delete this submission?')) return
    await supabase.from('contact_submissions').delete().eq('id', id)
    setSubmissions(prev => prev.filter(s => s.id !== id))
    if (selectedSubmission?.id === id) setSelectedSubmission(null)
  }

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Subject', 'Type', 'Status', 'Message', 'Date']
    const rows = filtered.map(s => [
      s.name, s.email, s.subject || '', s.inquiry_type, s.status,
      `"${s.message.replace(/"/g, '""')}"`, new Date(s.created_at).toLocaleDateString()
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'contact-submissions.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = submissions.filter(s => {
    const matchesFilter = filter === 'all' || s.status === filter
    const matchesSearch = searchQuery === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.message && s.message.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  const counts = {
    all: submissions.length,
    new: submissions.filter(s => s.status === 'new').length,
    read: submissions.filter(s => s.status === 'read').length,
    in_progress: submissions.filter(s => s.status === 'in_progress').length,
    replied: submissions.filter(s => s.status === 'replied').length,
  }

  if (selectedSubmission) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold">{selectedSubmission.name}</h2>
            <p className="text-sm text-gray-500">{selectedSubmission.email}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <select
              value={selectedSubmission.status}
              onChange={(e) => updateStatus(selectedSubmission.id, e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              {Object.entries(statusLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <a
              href={`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject || 'Your Inquiry'}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" /> Reply
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-bold mb-4">Message</h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedSubmission.message}</div>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-bold mb-4">Internal Notes</h3>
              <textarea
                value={notes || selectedSubmission.internal_notes || ''}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add private notes about this submission..."
                className="w-full border rounded-lg p-3 text-sm resize-none"
              />
              <button
                onClick={() => saveNotes(selectedSubmission.id)}
                className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                Save Notes
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-bold mb-4">Details</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Subject</dt><dd className="font-medium">{selectedSubmission.subject || 'N/A'}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Type</dt><dd className="font-medium capitalize">{selectedSubmission.inquiry_type}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Date</dt><dd className="font-medium">{new Date(selectedSubmission.created_at).toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd><span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[selectedSubmission.status]}`}>{statusLabels[selectedSubmission.status]}</span></dd></div>
              </dl>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-bold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={() => updateStatus(selectedSubmission.id, 'in_progress')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" /> Mark In Progress
                </button>
                <button onClick={() => updateStatus(selectedSubmission.id, 'replied')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Mark Replied
                </button>
                <button onClick={() => updateStatus(selectedSubmission.id, 'archived')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg flex items-center gap-2">
                  <Archive className="w-4 h-4 text-gray-500" /> Archive
                </button>
                <button onClick={() => updateStatus(selectedSubmission.id, 'spam')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Mark Spam
                </button>
                <button onClick={() => deleteSubmission(selectedSubmission.id)} className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contact Submissions</h1>
          <p className="text-sm text-gray-500">{submissions.length} total submissions</p>
        </div>
        <button onClick={exportCSV} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'All', value: counts.all, key: 'all' },
          { label: 'New', value: counts.new, key: 'new' },
          { label: 'Read', value: counts.read, key: 'read' },
          { label: 'In Progress', value: counts.in_progress, key: 'in_progress' },
          { label: 'Replied', value: counts.replied, key: 'replied' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`p-3 rounded-xl border text-center transition-all ${filter === s.key ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 hover:border-gray-300'}`}
          >
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or message..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm"
        />
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No submissions found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => (
            <div
              key={s.id}
              onClick={() => { setSelectedSubmission(s); setNotes(s.internal_notes || '') }}
              className={`bg-white rounded-xl border p-4 cursor-pointer hover:border-blue-200 transition-all flex items-center gap-4 ${s.status === 'new' ? 'border-l-4 border-l-blue-500' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {s.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{s.name}</span>
                  <span className="text-xs text-gray-400">{s.email}</span>
                  {s.status === 'new' && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                </div>
                <p className="text-sm text-gray-600 truncate">{s.message}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-medium border ${statusColors[s.status]}`}>
                  {statusLabels[s.status]}
                </span>
                <div className="text-xs text-gray-400 mt-1">{new Date(s.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
