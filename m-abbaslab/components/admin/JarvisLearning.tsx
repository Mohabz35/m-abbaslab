'use client'

import { useEffect, useState } from 'react'
import {
  Brain,
  Star,
  RefreshCw,
  MessageSquare,
  Calendar,
  TrendingUp,
  User,
  Bot,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

type Interaction = {
  id: string
  user_message: string
  jarvis_response: string
  sender_number: string
  created_at: string
  metadata?: {
    rating?: number
    feedback?: string
    is_group?: boolean
    group_name?: string
  }
}

type Stats = {
  totalInteractions: number
  averageScore: number
  topTopics: { topic: string; count: number }[]
}

export default function JarvisLearning() {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [stats, setStats] = useState<Stats>({
    totalInteractions: 0,
    averageScore: 0,
    topTopics: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isActionInProgress, setIsActionInProgress] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  
  // Interactive rating state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [ratingVal, setRatingVal] = useState<number>(5)
  const [feedbackVal, setFeedbackVal] = useState<string>('')

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchLearningData = async (silent = false) => {
    if (!silent) setIsLoading(true)
    else setIsRefreshing(true)

    try {
      const response = await fetch('/api/admin/jarvis/learning', {
        cache: 'no-store'
      })
      const data = await response.json()
      if (data.success) {
        setInteractions(data.interactions)
        setStats(data.stats)
      } else {
        showToast(data.error || 'Failed to fetch learning stats', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Error loading learning stats', 'error')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLearningData()
  }, [])

  const handleSubmitRating = async (id: string) => {
    setIsActionInProgress(true)
    try {
      const response = await fetch('/api/admin/jarvis/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interactionId: id,
          rating: ratingVal,
          feedback: feedbackVal
        })
      })
      const data = await response.json()
      if (data.success) {
        showToast('Feedback submitted successfully!')
        setEditingId(null)
        setFeedbackVal('')
        fetchLearningData(true)
      } else {
        showToast(data.error || 'Failed to submit rating', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Error submitting rating', 'error')
    } finally {
      setIsActionInProgress(false)
    }
  }

  const handleResetProfile = async () => {
    if (!confirm('Are you sure you want to completely reset the learning profile? This will clear all recorded interactions.')) {
      return
    }

    setIsActionInProgress(true)
    try {
      const response = await fetch('/api/admin/jarvis/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      })
      const data = await response.json()
      if (data.success) {
        showToast('Learning profile reset successfully.')
        fetchLearningData()
      } else {
        showToast(data.error || 'Reset request failed', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Error resetting learning profile', 'error')
    } finally {
      setIsActionInProgress(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium border border-gray-200 dark:border-gray-700 shadow-lg transition-all ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/80 dark:border-rose-900 dark:text-rose-200'
              : 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/80 dark:border-emerald-900 dark:text-emerald-200'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header and Refresh */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-500" />
            Learning Dashboard
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor Jarvis learning stats, rate recent model responses, and review conversation topics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLearningData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-400 dark:text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>

          <button
            onClick={handleResetProfile}
            disabled={isActionInProgress}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset Profile
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-2">Total Interactions</div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            {stats.totalInteractions}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Combined user messages & auto-replies logged</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-2">Average Rating</div>
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1.5">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            {stats.averageScore > 0 ? `${stats.averageScore}/5` : 'N/A'}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Based on rated responses in learning archive</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-2">Top Context Topics</div>
          {stats.topTopics.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">No key terms detected yet</div>
          ) : (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {stats.topTopics.map(({ topic, count }) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-700 border-b border-gray-200 dark:border-gray-700lue-100 dark:border-b border-gray-200 dark:border-gray-700lue-900/40"
                >
                  <TrendingUp className="w-3 h-3" />
                  <span className="capitalize">{topic}</span>
                  <span className="text-[10px] text-blue-400 dark:text-blue-500 font-bold">({count})</span>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Extracted from recent user queries</p>
        </div>
      </div>

      {/* Main Content split: Left is interactions log, Right is tips/info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Recent Interactions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-400 dark:text-gray-600 dark:text-gray-300">Recent Interactions Log</h4>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400 flex justify-center items-center">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-indigo-500" />
                <span>Loading interactions...</span>
              </div>
            ) : interactions.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No recent conversations found. Wait for Jarvis to respond to messages.
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800 max-h-[650px] overflow-y-auto">
                {interactions.map(item => {
                  const isEditing = editingId === item.id
                  const rating = item.metadata?.rating
                  const feedback = item.metadata?.feedback
                  const date = new Date(item.created_at)

                  return (
                    <div key={item.id} className="p-5 space-y-3 hover:bg-gray-50 dark:bg-gray-800/50/50 dark:hover:bg-gray-800/20 transition-colors">
                      {/* Interaction Metadata Header */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                          <span className="font-semibold text-gray-700 dark:text-gray-400 dark:text-gray-600 dark:text-gray-300">
                            {item.sender_number.split('@')[0]}
                          </span>
                          {item.metadata?.is_group && (
                            <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-blue-500">
                              Group: {item.metadata.group_name || 'Group Chat'}
                            </span>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {date.toLocaleString()}
                          </span>
                        </div>

                        {/* Existing Rating Display */}
                        {rating && !isEditing && (
                          <div className="flex items-center gap-1 text-amber-500 bg-amber-50 dark:bg-amber-950/20 border border-gray-200 dark:border-gray-700 border-amber-100 dark:border-amber-900/60 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 fill-amber-500" />
                            <span className="font-bold text-[11px]">{rating}/5</span>
                          </div>
                        )}
                      </div>

                      {/* Chat Bubbles */}
                      <div className="space-y-2">
                        {/* User Message */}
                        <div className="flex gap-2 items-start max-w-[85%]">
                          <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-450 mt-0.5">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none text-sm text-gray-800 dark:text-gray-250 font-medium">
                            {item.user_message}
                          </div>
                        </div>

                        {/* Jarvis Response */}
                        <div className="flex gap-2 items-start justify-end max-w-[85%] ml-auto">
                          <div className="p-3 bg-blue-600 text-white rounded-2xl rounded-tr-none text-sm font-medium">
                            {item.jarvis_response}
                          </div>
                          <div className="p-1.5 rounded-lg bg-blue-600 text-white mt-0.5">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>

                      {/* Feedback Rating Block */}
                      {isEditing ? (
                        <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 border-gray-250/60 dark:border-gray-800 p-4 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-400 dark:text-gray-600 dark:text-gray-300">Rate Jarvis Response:</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  key={star}
                                  onClick={() => setRatingVal(star)}
                                  className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                                >
                                  <Star
                                    className={`w-5 h-5 ${
                                      star <= ratingVal ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-700 dark:text-gray-200'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase">Feedback Comment (Optional)</label>
                            <input
                              type="text"
                              value={feedbackVal}
                              onChange={e => setFeedbackVal(e.target.value)}
                              placeholder="e.g. Too formal, great response, slightly off-topic..."
                              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 border-gray-250 dark:border-gray-805 rounded-lg bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex justify-end gap-2 text-xs">
                            <button
                              onClick={() => {
                                setEditingId(null)
                                setFeedbackVal('')
                              }}
                              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-500 dark:text-gray-400 font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSubmitRating(item.id)}
                              disabled={isActionInProgress}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                              Save Feedback
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-1">
                          {feedback ? (
                            <p className="text-xs italic text-gray-500 dark:text-gray-400 truncate max-w-[70%]">
                              <span className="font-bold font-sans not-italic text-gray-600 dark:text-gray-500 dark:text-gray-400">Feedback: </span>
                              "{feedback}"
                            </p>
                          ) : (
                            <div className="w-1" />
                          )}

                          <button
                            onClick={() => {
                              setEditingId(item.id)
                              setRatingVal(rating || 5)
                              setFeedbackVal(feedback || '')
                            }}
                            className="inline-flex items-center gap-1 text-xs text-indigo-500 font-bold hover:underline"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500" />
                            {rating ? 'Edit Rating' : 'Rate Response'}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Learning & Optimization Guide */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-500" />
              How Jarvis Learns
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Jarvis stores every message transaction to analyze communication success. By rating answers here, you help establish a dataset of optimal responses.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex gap-2.5 items-start text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400">
                <div className="p-1 rounded bg-blue-500/10 text-blue-500 flex-shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <span className="font-bold text-gray-800 dark:text-white">Star Ratings:</span> Rate answers 1-5 to signal quality benchmarks.
                </div>
              </div>
              <div className="flex gap-2.5 items-start text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400">
                <div className="p-1 rounded bg-indigo-500/10 text-indigo-500 flex-shrink-0">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div>
                  <span className="font-bold text-gray-800 dark:text-white">Feedback Comments:</span> Detail specifically what was good or bad to allow fine-tuning prompts.
                </div>
              </div>
              <div className="flex gap-2.5 items-start text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400">
                <div className="p-1 rounded bg-rose-500/10 text-rose-500 flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <div>
                  <span className="font-bold text-gray-800 dark:text-white">Reset Profile:</span> Clears the logs if you wish to start training fresh.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/10 to-blue-900/10 rounded-2xl border border-gray-200 dark:border-gray-700 border-indigo-100 dark:border-indigo-950 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-500" />
              <h5 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Reinforcement Guidelines</h5>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              For optimal performance, check in once a day to review recent interactions and flag responses that felt overly verbose or out-of-character.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
