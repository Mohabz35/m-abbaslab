'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Users, Search, Mail, UserPlus, Download, Trash2, Filter,
  ChevronDown, CheckCircle, XCircle, BarChart, Send, Tag,
  ArrowLeft, Calendar, Eye, Zap
} from 'lucide-react'

type Subscriber = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  segments: string[]
  source: string
  engagement_score: number
  status: string
  subscribed_at: string
  last_opened: string | null
  created_at: string
}

type Campaign = {
  id: string
  title: string
  subject: string
  html_content: string | null
  segments: string[]
  status: string
  total_sent: number
  open_rate: number
  click_rate: number
  scheduled_at: string | null
  sent_at: string | null
  created_at: string
}

const segmentOptions = ['general', 'projects', 'articles', 'consulting', 'hackathons', 'fashion', 'quantum']

export default function SubscribersManager() {
  const [view, setView] = useState<'subscribers' | 'campaigns'>('subscribers')
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selected, setSelected] = useState<Subscriber | null>(null)

  // Campaign form
  const [showCampaignForm, setShowCampaignForm] = useState(false)
  const [campaignForm, setCampaignForm] = useState({ title: '', subject: '', html_content: '', segments: [] as string[] })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [subRes, campRes] = await Promise.all([
      supabase.from('email_subscribers').select('*').order('created_at', { ascending: false }),
      supabase.from('email_campaigns').select('*').order('created_at', { ascending: false }),
    ])
    setSubscribers(subRes.data || [])
    setCampaigns(campRes.data || [])
    setLoading(false)
  }

  const updateSubscriberStatus = async (id: string, status: string) => {
    await supabase.from('email_subscribers').update({ status }).eq('id', id)
    setSubscribers(prev => prev.map(s => s.id === id ? { ...s, status } : s))
  }

  const deleteSubscriber = async (id: string) => {
    if (!confirm('Remove this subscriber?')) return
    await supabase.from('email_subscribers').delete().eq('id', id)
    setSubscribers(prev => prev.filter(s => s.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const exportCSV = () => {
    const headers = ['Email', 'First Name', 'Last Name', 'Segments', 'Source', 'Status', 'Engagement', 'Subscribed']
    const rows = filtered.map(s => [
      s.email, s.first_name || '', s.last_name || '', (s.segments || []).join(';'),
      s.source, s.status, s.engagement_score, new Date(s.subscribed_at).toLocaleDateString()
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'email-subscribers.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const saveCampaign = async () => {
    if (!campaignForm.title || !campaignForm.subject) return
    const { data } = await supabase.from('email_campaigns').insert({
      title: campaignForm.title,
      subject: campaignForm.subject,
      html_content: campaignForm.html_content,
      segments: campaignForm.segments,
      status: 'draft',
    }).select().single()
    if (data) setCampaigns(prev => [data, ...prev])
    setShowCampaignForm(false)
    setCampaignForm({ title: '', subject: '', html_content: '', segments: [] })
  }

  const deleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign?')) return
    await supabase.from('email_campaigns').delete().eq('id', id)
    setCampaigns(prev => prev.filter(c => c.id !== id))
  }

  const filtered = subscribers.filter(s => {
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus
    const matchesSearch = searchQuery === '' ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.first_name && s.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.last_name && s.last_name.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  const stats = {
    total: subscribers.length,
    active: subscribers.filter(s => s.status === 'active').length,
    unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
    avgEngagement: subscribers.length > 0
      ? Math.round(subscribers.reduce((sum, s) => sum + s.engagement_score, 0) / subscribers.length)
      : 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email & Subscribers</h1>
          <p className="text-sm text-gray-400">{stats.active} active subscribers</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          {view === 'campaigns' && (
            <button onClick={() => setShowCampaignForm(true)} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Campaign
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Users, color: 'blue' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'green' },
          { label: 'Unsubscribed', value: stats.unsubscribed, icon: XCircle, color: 'gray' },
          { label: 'Avg Engagement', value: stats.avgEngagement, icon: Zap, color: 'amber' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-${s.color}-50 flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 text-${s.color}-500`} />
              </div>
              <div>
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('subscribers')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'subscribers' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          <Users className="w-4 h-4 inline mr-2" /> Subscribers ({subscribers.length})
        </button>
        <button
          onClick={() => setView('campaigns')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'campaigns' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          <Send className="w-4 h-4 inline mr-2" /> Campaigns ({campaigns.length})
        </button>
      </div>

      {/* SUBSCRIBERS VIEW */}
      {view === 'subscribers' && (
        <>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search subscribers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border rounded-xl text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
              <option value="bounced">Bounced</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">No subscribers found</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium">Subscriber</th>
                    <th className="text-left px-4 py-3 font-medium">Segments</th>
                    <th className="text-left px-4 py-3 font-medium">Source</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Engagement</th>
                    <th className="text-left px-4 py-3 font-medium">Subscribed</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{s.email}</div>
                        <div className="text-xs text-gray-400">{[s.first_name, s.last_name].filter(Boolean).join(' ') || 'No name'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(s.segments || []).slice(0, 2).map(seg => (
                            <span key={seg} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px]">{seg}</span>
                          ))}
                          {(s.segments || []).length > 2 && <span className="text-[10px] text-gray-400">+{(s.segments || []).length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 capitalize">{s.source}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(s.engagement_score, 100)}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(s.subscribed_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => updateSubscriberStatus(s.id, s.status === 'active' ? 'unsubscribed' : 'active')} className="text-gray-400 hover:text-blue-600 p-1" title="Toggle status">
                          {s.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button onClick={() => deleteSubscriber(s.id)} className="text-gray-400 hover:text-red-600 p-1 ml-1" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* CAMPAIGNS VIEW */}
      {view === 'campaigns' && (
        <>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <Send className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">No campaigns yet</p>
              <button onClick={() => setShowCampaignForm(true)} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                Create Campaign
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map(c => (
                <div key={c.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Send className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{c.title}</div>
                    <div className="text-xs text-gray-400">{c.subject}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'sent' ? 'bg-green-100 text-green-700' : c.status === 'draft' ? 'bg-gray-100 text-gray-400' : 'bg-amber-100 text-amber-700'}`}>
                    {c.status}
                  </span>
                  {c.status === 'sent' && (
                    <div className="text-right text-xs text-gray-400">
                      <div>{c.total_sent} sent</div>
                      <div>{(c.open_rate * 100).toFixed(1)}% open</div>
                    </div>
                  )}
                  <button onClick={() => deleteCampaign(c.id)} className="text-gray-400 hover:text-red-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Campaign Form Modal */}
      {showCampaignForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4">
            <h3 className="text-lg font-bold">New Campaign</h3>
            <input
              type="text"
              placeholder="Campaign title"
              value={campaignForm.title}
              onChange={(e) => setCampaignForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border rounded-lg px-4 py-3 text-sm"
            />
            <input
              type="text"
              placeholder="Email subject line"
              value={campaignForm.subject}
              onChange={(e) => setCampaignForm(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full border rounded-lg px-4 py-3 text-sm"
            />
            <textarea
              placeholder="Email HTML content..."
              value={campaignForm.html_content}
              onChange={(e) => setCampaignForm(prev => ({ ...prev, html_content: e.target.value }))}
              rows={6}
              className="w-full border rounded-lg px-4 py-3 text-sm resize-none"
            />
            <div>
              <p className="text-xs text-gray-400 mb-2">Target segments:</p>
              <div className="flex flex-wrap gap-2">
                {segmentOptions.map(seg => (
                  <button
                    key={seg}
                    onClick={() => setCampaignForm(prev => ({
                      ...prev,
                      segments: prev.segments.includes(seg)
                        ? prev.segments.filter(s => s !== seg)
                        : [...prev.segments, seg]
                    }))}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${campaignForm.segments.includes(seg) ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                  >
                    {seg}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCampaignForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button onClick={saveCampaign} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                Save Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
