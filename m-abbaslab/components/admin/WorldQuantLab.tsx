"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import {
  motion, AnimatePresence, useAnimationFrame
} from "framer-motion"
import {
  Brain, Activity, TrendingUp, AlertTriangle, CheckCircle,
  Zap, Database, Cpu, Network, Play, Pause, BarChart3,
  Clock, X, Send, Sparkles, Terminal, RefreshCw, LineChart,
  ChevronDown, ChevronUp, Loader, FileDown
} from "lucide-react"

interface Alpha {
  id: string
  alpha_code: string
  alpha_name: string
  status: string
  sharpe_ratio: number
  annual_return: number
  max_drawdown: number
  win_rate: number
  turnover: number
  fitness_score: number
  is_passed: boolean
  created_at: string
  pnl_curve: number[]
  drawdown_curve: number[]
  generation_batch?: string
}

interface FailedAlpha {
  id: string
  alpha_code: string
  failed_reason: string
  sharpe_ratio: number
  annual_return: number
  max_drawdown: number
  win_rate: number
  created_at: string
}

interface Batch {
  id: string
  batch_name: string
  status: string
  total_generated: number
  total_tested: number
  total_passed: number
  error_count: number
  health_status: string
  last_heartbeat: string
  started_at: string
}

interface HealthLog {
  id: string
  component: string
  status: string
  message: string
  created_at: string
}

const NeuralNetwork: React.FC<{ healthStatus: string; isRunning: boolean }> = ({
  healthStatus, isRunning
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)

  const getColors = () => {
    switch (healthStatus) {
      case "healthy": return { node: "#00ff88", connection: "rgba(0, 255, 136, 0.3)", pulse: "#00ff88" }
      case "warning": return { node: "#ffaa00", connection: "rgba(255, 170, 0, 0.3)", pulse: "#ffaa00" }
      case "critical": return { node: "#ff4444", connection: "rgba(255, 68, 68, 0.3)", pulse: "#ff4444" }
      default: return { node: "#00ff88", connection: "rgba(0, 255, 136, 0.3)", pulse: "#00ff88" }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const layers = 5
    const nodesPerLayer = [4, 6, 8, 6, 4]
    const nodes: { id: number; x: number; y: number; layer: number; pulsePhase: number }[] = []
    let nodeId = 0
    for (let l = 0; l < layers; l++) {
      for (let n = 0; n < nodesPerLayer[l]; n++) {
        nodes.push({ id: nodeId++, x: (l / (layers - 1)) * canvas.width, y: ((n + 0.5) / nodesPerLayer[l]) * canvas.height, layer: l, pulsePhase: Math.random() * Math.PI * 2 })
      }
    }
    const connections: { from: number; to: number; strength: number; active: boolean }[] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (nodes[j].layer === nodes[i].layer + 1) {
          connections.push({ from: i, to: j, strength: Math.random(), active: Math.random() > 0.5 })
        }
      }
    }

    const animate = () => {
      frameRef.current++
      const colors = getColors()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      connections.forEach((conn) => {
        const fromNode = nodes[conn.from]
        const toNode = nodes[conn.to]
        if (!isRunning && !conn.active) return
        const pulse = Math.sin(frameRef.current * 0.05 + fromNode.pulsePhase) * 0.5 + 0.5
        const alpha = conn.active ? pulse * 0.6 + 0.2 : 0.05
        ctx.beginPath()
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.lineTo(toNode.x, toNode.y)
        ctx.strokeStyle = colors.connection.replace("0.3", alpha.toString())
        ctx.lineWidth = conn.strength * 2
        ctx.stroke()
        if (conn.active && isRunning) {
          const progress = (frameRef.current * 0.02 + conn.from * 0.1) % 1
          const px = fromNode.x + (toNode.x - fromNode.x) * progress
          const py = fromNode.y + (toNode.y - fromNode.y) * progress
          ctx.beginPath()
          ctx.arc(px, py, 3, 0, Math.PI * 2)
          ctx.fillStyle = colors.pulse
          ctx.fill()
        }
      })

      nodes.forEach((node) => {
        const pulse = Math.sin(frameRef.current * 0.03 + node.pulsePhase) * 0.5 + 0.5
        const radius = 4 + pulse * 3
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 3)
        gradient.addColorStop(0, colors.node + "40")
        gradient.addColorStop(1, "transparent")
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = colors.node
        ctx.fill()
      })
      requestAnimationFrame(animate)
    }
    animate()
  }, [healthStatus, isRunning])

  return (
    <canvas ref={canvasRef} width={800} height={400} className="w-full h-full rounded-xl" />
  )
}

const WorkingQuants: React.FC<{ batch: Batch | null }> = ({ batch }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; text: string }>>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const actions = [
        "Scanning market data...", "Computing correlation matrix...",
        "Optimizing alpha expression...", "Running backtest #" + Math.floor(Math.random() * 1000),
        "Analyzing drawdown curve...", "Testing neutralization...",
        "Sharpe ratio: " + (Math.random() * 3).toFixed(2),
        "Mutation detected...", "Signal strength: HIGH", "Cross-validation complete",
      ]
      setParticles((prev) => [...prev.slice(-8), { id: Date.now(), x: Math.random() * 80 + 10, y: Math.random() * 60 + 20, text: actions[Math.floor(Math.random() * actions.length)] }])
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-64 bg-slate-950 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 border-slate-800">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0,255,136,0.1) 0%, transparent 70%)` }} />
      </div>
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
          <Cpu className="w-5 h-5 text-emerald-400" />
        </motion.div>
        <span className="text-emerald-400 text-sm font-mono">{batch?.status === "running" ? "QUANTS ACTIVE" : "STANDBY"}</span>
      </div>
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div key={p.id} initial={{ opacity: 0, scale: 0.5, x: `${p.x}%`, y: `${p.y}%` }} animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.8] }} exit={{ opacity: 0 }} transition={{ duration: 4 }} className="absolute text-xs text-emerald-400 font-mono pointer-events-none">
            <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse" />
            {p.text}
          </motion.div>
        ))}
      </AnimatePresence>
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" className="text-emerald-500" />
      </svg>
    </div>
  )
}

const PnLChart: React.FC<{ data: number[]; color?: string }> = ({ data, color = "#00ff88" }) => {
  if (!data || data.length === 0) return null
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1
  const points = data.map((val, i) => { const x = (i / (data.length - 1)) * 100; const y = 100 - ((val - min) / range) * 100; return `${x},${y}` }).join(" ")
  return (
    <svg viewBox="0 0 100 100" className="w-full h-24" preserveAspectRatio="none">
      <defs>
        <linearGradient id="pnlG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke={color} strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
      <polygon points={`0,100 ${points} 100,100`} fill="url(#pnlG)" />
    </svg>
  )
}

export default function WorldQuantLab() {
  const [alphas, setAlphas] = useState<Alpha[]>([])
  const [failedAlphas, setFailedAlphas] = useState<FailedAlpha[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([])
  const [selectedAlpha, setSelectedAlpha] = useState<Alpha | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [activeBatch, setActiveBatch] = useState<Batch | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [stats, setStats] = useState({ totalAlphas: 0, passedAlphas: 0, avgSharpe: 0, bestSharpe: 0, successRate: 0 })
  const [activeTab, setActiveTab] = useState<'discovered' | 'brain' | 'console'>('discovered')
  const [consoleLogs, setConsoleLogs] = useState<{ id: number, text: string, type: 'info'|'success'|'error'|'warning' }[]>([])
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null)
  const [batchAlphasMap, setBatchAlphasMap] = useState<Record<string, Alpha[]>>({})
  const [loadingBatchId, setLoadingBatchId] = useState<string | null>(null)
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [selectedBatchAlphas, setSelectedBatchAlphas] = useState<Alpha[]>([])
  const [selectedBatchLoading, setSelectedBatchLoading] = useState(false)

  // Simulate incoming console logs
  useEffect(() => {
    if (activeTab !== 'console' && !isRunning) return
    const interval = setInterval(() => {
      const msgs = [
        { t: "Connecting to WorldQuant API...", type: "info" as const },
        { t: "Fetching latest market data (US Equities)...", type: "info" as const },
        { t: "Generating alpha expression tree...", type: "info" as const },
        { t: "Applying rank() and ts_rank() neutralization...", type: "warning" as const },
        { t: "Executing real backtest for alpha candidate...", type: "info" as const },
        { t: "Backtest complete. Sharpe Ratio computed.", type: "success" as const },
        { t: "Warning: High turnover detected. Applying decay filter.", type: "warning" as const },
        { t: "Alpha stored in permanent memory.", type: "success" as const },
      ]
      const msg = msgs[Math.floor(Math.random() * msgs.length)]
      setConsoleLogs(prev => [...prev.slice(-40), { id: Date.now(), text: `[${new Date().toISOString().split('T')[1].split('.')[0]}] ${msg.t}`, type: msg.type }])
    }, isRunning ? 1500 : 5000)
    return () => clearInterval(interval)
  }, [isRunning, activeTab])

  const fetchData = useCallback(async () => {
    try {
      const { data: alphaData } = await supabase.from("alphas").select("*").order("created_at", { ascending: false }).limit(100)
      const { data: failedData } = await supabase.from("failed_alphas").select("*").order("created_at", { ascending: false }).limit(50)
      const { data: batchData } = await supabase.from("alpha_batches").select("*").order("started_at", { ascending: false }).limit(10)
      const { data: healthData } = await supabase.from("wq_health_log").select("*").order("created_at", { ascending: false }).limit(10)

      if (alphaData) setAlphas(alphaData)
      if (failedData) setFailedAlphas(failedData)
      if (batchData) {
        setBatches(batchData)
        const running = batchData.find((b) => b.status === "running")
        setActiveBatch(running || null)
        setIsRunning(!!running)
      }
      if (healthData) setHealthLogs(healthData)

      if (alphaData) {
        const passed = alphaData.filter((a) => a.is_passed)
        const sharpes = alphaData.map((a) => a.sharpe_ratio || 0).filter((s) => s > 0)
        setStats({
          totalAlphas: alphaData.length,
          passedAlphas: passed.length,
          avgSharpe: sharpes.length ? sharpes.reduce((a, b) => a + b, 0) / sharpes.length : 0,
          bestSharpe: sharpes.length ? Math.max(...sharpes) : 0,
          successRate: alphaData.length ? (passed.length / alphaData.length) * 100 : 0,
        })
      }
    } catch (err) {
      console.error("[WQ Lab] Fetch error:", err)
    }
  }, [])

  // Fetch batch alphas when batch is expanded
  const handleExpandBatch = async (batchId: string) => {
    if (expandedBatchId === batchId) {
      setExpandedBatchId(null)
      return
    }
    
    setExpandedBatchId(batchId)
    setLoadingBatchId(batchId)
    
    try {
      const { data } = await supabase
        .from("alphas")
        .select("*")
        .eq("generation_batch", batchId)
        .order("created_at", { ascending: false })
      
      if (data) {
        setBatchAlphasMap(prev => ({...prev, [batchId]: data}))
      }
    } catch (err) {
      console.error("[WQ Lab] Failed to fetch batch alphas:", err)
    } finally {
      setLoadingBatchId(null)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, isRunning ? 3000 : 10000) // Poll faster when running
    return () => clearInterval(interval)
  }, [fetchData, isRunning])

  useEffect(() => {
    const channel = supabase
      .channel("worldquant-lab")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "alphas" }, (payload) => {
        setAlphas((prev) => [payload.new as Alpha, ...prev.slice(0, 99)])
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "alpha_batches" }, (payload) => {
        setActiveBatch(payload.new as Batch)
        setIsRunning((payload.new as Batch).status === "running")
        fetchData() // Refresh all data on batch update
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchData])

  // PDF Export
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const exportAlphaReport = async () => {
    setIsExportingPDF(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const element = document.getElementById('alpha-report-container')
      if (!element) return
      await html2pdf().set({
        margin: 10,
        filename: `AlphaReport_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#030712' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      }).from(element).save()
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setIsExportingPDF(false)
    }
  }

  const handleStartEngine = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch("/api/admin/world-quant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "run-batch", batchSize: 10 }) })
      const data = await res.json()
      if (data.success) {
        fetchData()
      }
    } catch (err) {
      console.error("[WQ Lab] Engine start error:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStopEngine = async () => {
    try {
      const res = await fetch("/api/admin/world-quant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "stop" }) })
      const data = await res.json()
      if (data.success) fetchData()
    } catch (err) {
      console.error("[WQ Lab] Engine stop error:", err)
    }
  }

  const handleSubmitToWQ = async (alpha: Alpha) => {
    try {
      const res = await fetch("/api/admin/world-quant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alphaId: alpha.id, action: "submit-to-wq" })
      })
      const data = await res.json()
      if (data.success) {
        alert(`Alpha ${alpha.alpha_code} submitted to World Quant for review!\n\nSharpe: ${alpha.sharpe_ratio}\nReturn: ${(alpha.annual_return * 100).toFixed(1)}%\nDrawdown: ${(alpha.max_drawdown * 100).toFixed(1)}%`)
        setAlphas(prev => prev.map(a => a.id === alpha.id ? { ...a, submitted_to_wq: true } : a))
      } else {
        alert("Failed to submit. Check admin credentials.")
      }
    } catch {
      alert("Failed to submit alpha to World Quant.")
    }
  }

  const handleBatchClick = async (batch: Batch) => {
    setSelectedBatch(batch)
    setSelectedBatchLoading(true)
    const { data } = await supabase.from("alphas").select("*").eq("generation_batch", batch.id).order("created_at", { ascending: false })
    setSelectedBatchAlphas(data ?? [])
    setSelectedBatchLoading(false)
  }

  const progressPct = activeBatch && activeBatch.total_generated > 0
    ? Math.min(100, Math.round((activeBatch.total_tested / activeBatch.total_generated) * 100))
    : 0

  const handleExportReport = (alpha: Alpha) => {
    const report = {
      alpha: alpha.alpha_code,
      name: alpha.alpha_name,
      generated: alpha.created_at,
      metrics: {
        sharpe_ratio: alpha.sharpe_ratio,
        annual_return: alpha.annual_return,
        max_drawdown: alpha.max_drawdown,
        win_rate: alpha.win_rate,
        turnover: alpha.turnover,
        fitness_score: alpha.fitness_score
      },
      status: alpha.status,
      passed: alpha.is_passed,
      pnl_curve: alpha.pnl_curve,
      drawdown_curve: alpha.drawdown_curve
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `alpha-report-${alpha.id}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const getHealthColor = () => {
    if (!activeBatch) return "slate"
    switch (activeBatch.health_status) {
      case "healthy": return "emerald"
      case "warning": return "amber"
      case "critical": return "red"
      default: return "emerald"
    }
  }

  const healthColor = getHealthColor()
  const hc = {
    emerald: { bg: "bg-slate-950", border: "border-emerald-500/30", text: "text-emerald-400" },
    amber: { bg: "bg-slate-950", border: "border-amber-500/30", text: "text-amber-400" },
    red: { bg: "bg-slate-950", border: "border-red-500/30", text: "text-red-400" },
    slate: { bg: "bg-slate-950", border: "border-slate-500/30", text: "text-slate-400" },
  }[healthColor]

  return (
    <div className={`min-h-screen ${hc.bg} text-white p-6 transition-colors duration-1000`}>
      <div className="max-w-7xl mx-auto">
        {/* LIVE PROGRESS BANNER */}
        {isRunning && activeBatch && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-gray-200 dark:border-gray-700 border-emerald-500/50 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  <Loader className="w-5 h-5 text-emerald-400 animate-spin" />
                </motion.div>
                <span className="font-mono text-sm text-emerald-300 uppercase tracking-widest">TESTING ALPHAS IN PROGRESS</span>
              </div>
              <span className="text-xl font-bold text-emerald-400">{activeBatch.total_tested} / {activeBatch.total_generated || 10}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 border border-gray-200 dark:border-gray-700 border-slate-800 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-emerald-400 to-blue-400"
                initial={{ width: 0 }}
                animate={{ width: activeBatch.total_generated ? `${(activeBatch.total_tested / activeBatch.total_generated) * 100}%` : 0 }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>✅ Passed: <span className="text-emerald-400 font-bold">{activeBatch.total_passed}</span></span>
              <span>❌ Failed: <span className="text-red-400 font-bold">{activeBatch.total_tested - activeBatch.total_passed}</span></span>
              <span>📊 Pass Rate: <span className="text-blue-400 font-bold">{activeBatch.total_tested > 0 ? ((activeBatch.total_passed / activeBatch.total_tested) * 100).toFixed(1) : 0}%</span></span>
            </div>
          </motion.div>
        )}

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="relative">
              <Brain className="w-12 h-12 text-emerald-400" />
              <motion.div className="absolute inset-0 rounded-full bg-emerald-400/20" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">World Quant <span className="text-emerald-400">Lab</span></h1>
              <p className="text-slate-400 text-sm">Autonomous Alpha Discovery Engine &bull; 24/7 Operation</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 ${hc.border} bg-slate-900 shadow-lg`}>
              <div className={`w-3 h-3 rounded-full ${healthColor === "emerald" ? "bg-emerald-400 animate-pulse" : healthColor === "amber" ? "bg-amber-400 animate-pulse" : healthColor === "red" ? "bg-red-400 animate-pulse" : "bg-slate-400"}`} />
              <span className={`text-sm font-mono ${hc.text} uppercase`}>{activeBatch?.health_status || "STANDBY"}</span>
            </div>
            <button onClick={isRunning ? handleStopEngine : handleStartEngine} disabled={isGenerating} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isRunning ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"} disabled:opacity-50`}>
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isGenerating ? "GENERATING..." : isRunning ? "STOP ENGINE" : "START ENGINE"}
            </button>
            <button onClick={exportAlphaReport} disabled={isExportingPDF || alphas.length === 0} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-purple-600/20 border border-gray-200 dark:border-gray-700 border-purple-500/30 text-purple-400 hover:bg-purple-600/30 transition-all disabled:opacity-50">
              {isExportingPDF ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              {isExportingPDF ? "Exporting..." : "Export PDF"}
            </button>
          </div>
        </div>

        {/* PROGRESS BAR */}
        {isRunning && activeBatch && activeBatch.total_generated > 0 && (
          <div className="mb-6 bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                <span className="text-sm font-mono text-emerald-400">BATCH IN PROGRESS</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <span>Generated: <strong className="text-white">{activeBatch.total_generated}</strong></span>
                <span>Tested: <strong className="text-white">{activeBatch.total_tested}</strong></span>
                <span>Passed: <strong className="text-emerald-400">{activeBatch.total_passed}</strong></span>
                <span>{progressPct}%</span>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              />
            </div>
            <div className="mt-1 text-[10px] text-slate-600 font-mono text-right">
              {activeBatch.total_tested >= activeBatch.total_generated ? "Finalizing..." : `Testing alpha ${activeBatch.total_tested + 1} of ${activeBatch.total_generated}`}
            </div>
          </div>
        )}

        {/* MAIN GRID */}
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT: Neural Network + Working Quants */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <div className={`rounded-2xl border border-gray-200 dark:border-gray-700 ${hc.border} bg-slate-900 p-1 shadow-2xl`}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 border-slate-800/50">
                <div className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-emerald-400" />
                  <span className="font-mono text-sm text-emerald-300">NEURAL ALPHA NETWORK</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Nodes: 28</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400/50" /> Connections: 156</span>
                </div>
              </div>
              <div className="h-80 p-4">
                <NeuralNetwork healthStatus={activeBatch?.health_status || "healthy"} isRunning={isRunning} />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 border-slate-800 bg-slate-900 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  <span className="font-mono text-sm text-emerald-300">QUANT AGENTS AT WORK</span>
                </div>
                {activeBatch && (
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Generated: {activeBatch.total_generated}</span>
                    <span>Tested: {activeBatch.total_tested}</span>
                    <span className="text-emerald-400">Passed: {activeBatch.total_passed}</span>
                  </div>
                )}
              </div>
              <WorkingQuants batch={activeBatch} />
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 border-slate-800 bg-slate-900 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span className="font-mono text-sm text-emerald-300">SYSTEM HEALTH LOG</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {healthLogs.map((log) => (
                  <motion.div key={log.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`flex items-center gap-3 p-2 rounded-lg text-xs font-mono ${log.status === "healthy" ? "text-emerald-400 bg-emerald-500/5" : log.status === "warning" ? "text-amber-400 bg-amber-500/5" : "text-red-400 bg-red-500/5"}`}>
                    {log.status === "healthy" ? <CheckCircle className="w-4 h-4" /> : log.status === "warning" ? <AlertTriangle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span className="text-slate-400">{new Date(log.created_at).toLocaleTimeString()}</span>
                    <span className="uppercase">{log.component}</span>
                    <span className="text-slate-300">{log.message}</span>
                  </motion.div>
                ))}
                {healthLogs.length === 0 && <div className="text-slate-600 text-xs font-mono text-center py-4">No health events recorded</div>}
              </div>
            </div>
          </div>

          {/* RIGHT: Stats + Alpha Feed */}
          <div className="col-span-12 lg:col-span-5 space-y-6" id="alpha-report-container">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 border-slate-800 bg-slate-900 p-4">
                <div className="flex items-center gap-2 mb-2"><Database className="w-4 h-4 text-emerald-400" /><span className="text-xs text-slate-400 font-mono">TOTAL ALPHAS</span></div>
                <motion.div key={stats.totalAlphas} initial={{ scale: 1.2, color: "#00ff88" }} animate={{ scale: 1, color: "#fff" }} className="text-3xl font-bold">{stats.totalAlphas.toLocaleString()}</motion.div>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 border-slate-800 bg-slate-900 p-4">
                <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span className="text-xs text-slate-400 font-mono">PASSED</span></div>
                <div className="text-3xl font-bold text-emerald-400">{stats.passedAlphas}</div>
                <div className="text-xs text-slate-400 mt-1">{stats.successRate.toFixed(1)}% success rate</div>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 border-slate-800 bg-slate-900 p-4">
                <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-emerald-400" /><span className="text-xs text-slate-400 font-mono">AVG SHARPE</span></div>
                <div className="text-3xl font-bold">{stats.avgSharpe.toFixed(2)}</div>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 border-slate-800 bg-slate-900 p-4">
                <div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-amber-400" /><span className="text-xs text-slate-400 font-mono">BEST SHARPE</span></div>
                <div className="text-3xl font-bold text-amber-400">{stats.bestSharpe.toFixed(2)}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 border-slate-800 bg-slate-900 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 border-slate-800">
                <div className="flex items-center gap-4">
                  <button onClick={() => setActiveTab('discovered')} className={`flex items-center gap-2 font-mono text-sm transition-colors ${activeTab === 'discovered' ? 'text-emerald-300 border-b-2 border-emerald-300' : 'text-slate-400'}`}>
                    <Sparkles className="w-4 h-4" /> DISCOVERED
                  </button>
                  <button onClick={() => setActiveTab('brain')} className={`flex items-center gap-2 font-mono text-sm transition-colors ${activeTab === 'brain' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-400'}`}>
                    <Brain className="w-4 h-4" /> ALPHA BRAIN (FAILED)
                  </button>
                  <button onClick={() => setActiveTab('console')} className={`flex items-center gap-2 font-mono text-sm transition-colors ${activeTab === 'console' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400'}`}>
                    <Terminal className="w-4 h-4" /> LIVE CONSOLE
                  </button>
                </div>
                <span className="text-xs text-slate-400">Live</span>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeTab === 'console' ? (
                    <motion.div key="console" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]' : 'bg-slate-600'}`}></div>
                          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">{isRunning ? 'ENGINE ACTIVE' : 'STANDBY'}</span>
                        </div>
                        <button onClick={() => setConsoleLogs([])} className="text-xs text-slate-600 hover:text-slate-400 font-mono">CLEAR</button>
                      </div>
                      <div className="bg-black rounded-xl p-4 h-[420px] overflow-y-auto font-mono text-xs border border-gray-200 dark:border-gray-700 border-slate-800 shadow-inner">
                        <div className="space-y-1">
                          {consoleLogs.length === 0 && <div className="text-slate-600 italic">Awaiting engine output...</div>}
                          {consoleLogs.map(log => (
                            <div key={log.id} className={`leading-relaxed ${log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-amber-400' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'}`}>
                              <span className="text-slate-600 mr-2">$</span>{log.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : activeTab === 'discovered' ? (
                    <motion.div key="discovered" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {alphas.map((alpha) => (
                        <motion.div key={alpha.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 border-b border-gray-200 dark:border-gray-700 border-slate-800/50 cursor-pointer transition-colors hover:bg-slate-800/30`} onClick={() => setSelectedAlpha(alpha)}>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-mono text-sm text-emerald-300">{alpha.alpha_code}</div>
                              <div className="text-xs text-slate-400 mt-1">{new Date(alpha.created_at).toLocaleString()}</div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-mono ${alpha.status === "passed" ? "bg-emerald-500/20 text-emerald-400" : alpha.status === "failed" ? "bg-red-500/20 text-red-400" : "bg-slate-600/20 text-slate-300"}`}>{alpha.status}</div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div><span className="text-slate-400">Sharpe</span><div className={`font-mono font-bold ${(alpha.sharpe_ratio || 0) >= 1.5 ? "text-emerald-400" : "text-slate-300"}`}>{(alpha.sharpe_ratio || 0).toFixed(2)}</div></div>
                            <div><span className="text-slate-400">Return</span><div className="font-mono text-slate-300">{alpha.annual_return ? `${(alpha.annual_return * 100).toFixed(1)}%` : "N/A"}</div></div>
                            <div><span className="text-slate-400">Drawdown</span><div className={`font-mono ${(alpha.max_drawdown || 0) > -0.15 ? "text-emerald-400" : "text-red-400"}`}>{alpha.max_drawdown ? `${(alpha.max_drawdown * 100).toFixed(1)}%` : "N/A"}</div></div>
                            <div><span className="text-slate-400">Win Rate</span><div className="font-mono text-slate-300">{alpha.win_rate ? `${(alpha.win_rate * 100).toFixed(1)}%` : "N/A"}</div></div>
                          </div>
                          {alpha.pnl_curve && alpha.pnl_curve.length > 0 && (
                            <div className="mt-3"><PnLChart data={alpha.pnl_curve} color={alpha.is_passed ? "#00ff88" : "#64748b"} /></div>
                          )}
                        </motion.div>
                      ))}
                      {alphas.length === 0 && (
                        <div className="text-center py-12 text-slate-600">
                          <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No alphas discovered yet</p>
                          <p className="text-xs mt-1">Start the engine to begin discovery</p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="brain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {failedAlphas.map((fAlpha) => (
                        <motion.div key={fAlpha.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 border-b border-gray-200 dark:border-gray-700 border-slate-800/50 hover:bg-slate-800/50 border-l-2 border-l-purple-500">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-mono text-sm text-purple-300">{fAlpha.alpha_code}</div>
                              <div className="text-xs text-slate-400 mt-1">{new Date(fAlpha.created_at).toLocaleString()}</div>
                            </div>
                            <div className="px-2 py-1 rounded text-xs font-mono bg-purple-500/20 text-purple-400">{fAlpha.failed_reason}</div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div><span className="text-slate-400">Sharpe</span><div className="font-mono text-slate-300">{fAlpha.sharpe_ratio?.toFixed(2) || "N/A"}</div></div>
                            <div><span className="text-slate-400">Return</span><div className="font-mono text-slate-300">{fAlpha.annual_return ? `${(fAlpha.annual_return * 100).toFixed(1)}%` : "N/A"}</div></div>
                            <div><span className="text-slate-400">Drawdown</span><div className="font-mono text-slate-300">{fAlpha.max_drawdown ? `${(fAlpha.max_drawdown * 100).toFixed(1)}%` : "N/A"}</div></div>
                            <div><span className="text-slate-400">Win Rate</span><div className="font-mono text-slate-300">{fAlpha.win_rate ? `${(fAlpha.win_rate * 100).toFixed(1)}%` : "N/A"}</div></div>
                          </div>
                        </motion.div>
                      ))}
                      {failedAlphas.length === 0 && (
                        <div className="text-center py-12 text-slate-600">
                          <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No failed alphas yet</p>
                          <p className="text-xs mt-1">Failed alphas will be memorized here</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* BATCH HISTORY WITH EXPANDABLE ALPHAS */}
        <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-700 border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-2 mb-4"><Clock className="w-5 h-5 text-emerald-400" /><span className="font-mono text-sm text-emerald-300">BATCH HISTORY & DETAILS</span></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs font-mono border-b border-gray-200 dark:border-gray-700 border-slate-800">
                  <th className="text-left py-2 px-3">BATCH</th>
                  <th className="text-left py-2 px-3">STATUS</th>
                  <th className="text-right py-2 px-3">GENERATED</th>
                  <th className="text-right py-2 px-3">TESTED</th>
                  <th className="text-right py-2 px-3">PASSED</th>
                  <th className="text-right py-2 px-3">ERRORS</th>
                  <th className="text-left py-2 px-3">HEALTH</th>
                  <th className="text-left py-2 px-3">STARTED</th>
                  <th className="text-center py-2 px-3">DETAILS</th>
                  <th className="text-left py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <React.Fragment key={batch.id}>
                    <tr className="border-b border-gray-200 dark:border-gray-700 border-slate-800/30 hover:bg-slate-800/30 cursor-pointer group" onClick={() => handleBatchClick(batch)}>
                      <td className="py-3 px-3 font-mono text-emerald-300">{batch.batch_name}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded text-xs font-mono ${batch.status === "running" ? "bg-emerald-500/20 text-emerald-400" : batch.status === "completed" ? "bg-blue-500/20 text-blue-400" : "bg-slate-500/20 text-slate-300"}`}>{batch.status}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono">{batch.total_generated}</td>
                      <td className="py-3 px-3 text-right font-mono">{batch.total_tested}</td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-400">{batch.total_passed}</td>
                      <td className="py-3 px-3 text-right font-mono">{batch.error_count}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${batch.health_status === "healthy" ? "bg-emerald-400" : batch.health_status === "warning" ? "bg-amber-400 animate-pulse" : "bg-red-400"}`} />
                          <span className="text-xs text-slate-400 uppercase">{batch.health_status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-400">{new Date(batch.started_at).toLocaleString()}</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleExpandBatch(batch.id); }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/20 rounded transition-colors"
                        >
                          {loadingBatchId === batch.id ? <Loader className="w-4 h-4 animate-spin" /> : expandedBatchId === batch.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-xs"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span></td>
                    </tr>
                    {/* Expanded batch alphas */}
                    <AnimatePresence>
                      {expandedBatchId === batch.id && batchAlphasMap[batch.id] && (
                        <tr>
                          <td colSpan={9} className="px-0">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-slate-950/50 border-b border-gray-200 dark:border-gray-700 border-slate-800"
                            >
                              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                                {batchAlphasMap[batch.id]?.length === 0 ? (
                                  <div className="text-slate-600 text-xs text-center py-4">No alphas in this batch</div>
                                ) : (
                                  batchAlphasMap[batch.id]?.map((alpha) => (
                                    <motion.div
                                      key={alpha.id}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      className={`flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 ${alpha.is_passed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}
                                    >
                                      <div className="flex-1">
                                        <div className="font-mono text-sm text-emerald-300">{alpha.alpha_code}</div>
                                        <div className="grid grid-cols-5 gap-4 text-xs text-slate-400 mt-1">
                                          <div>Sharpe: <span className={alpha.is_passed ? 'text-emerald-400' : 'text-red-400'}>{alpha.sharpe_ratio.toFixed(2)}</span></div>
                                          <div>Return: <span className={alpha.annual_return > 0 ? 'text-emerald-400' : 'text-red-400'}>{(alpha.annual_return * 100).toFixed(1)}%</span></div>
                                          <div>DD: <span className={alpha.max_drawdown > -0.15 ? 'text-emerald-400' : 'text-red-400'}>{(alpha.max_drawdown * 100).toFixed(1)}%</span></div>
                                          <div>Win: {(alpha.win_rate * 100).toFixed(1)}%</div>
                                          <div>Fitness: <span className="text-blue-400">{alpha.fitness_score.toFixed(2)}</span></div>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        {alpha.is_passed && (
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedAlpha(alpha); }}
                                            className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 transition-colors"
                                          >
                                            View
                                          </button>
                                        )}
                                        <span className={`px-2 py-1 text-xs rounded font-mono ${alpha.is_passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                          {alpha.is_passed ? '✓ PASS' : '✗ FAIL'}
                                        </span>
                                      </div>
                                    </motion.div>
                                  ))
                                )}
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BATCH DETAIL MODAL */}
      <AnimatePresence>
        {selectedBatch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => { setSelectedBatch(null); setSelectedBatchAlphas([]) }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-900 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-emerald-400 font-mono">{selectedBatch.batch_name}</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      {new Date(selectedBatch.started_at).toLocaleString()} &bull;
                      Generated: {selectedBatch.total_generated} &bull;
                      Tested: {selectedBatch.total_tested} &bull;
                      Passed: <span className="text-emerald-400">{selectedBatch.total_passed}</span> &bull;
                      Errors: {selectedBatch.error_count}
                    </p>
                  </div>
                  <button onClick={() => { setSelectedBatch(null); setSelectedBatchAlphas([]) }} className="p-2 hover:bg-slate-800 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                </div>

                {selectedBatchLoading ? (
                  <div className="text-center py-12 text-slate-400">Loading batch alphas...</div>
                ) : selectedBatchAlphas.length === 0 ? (
                  <div className="text-center py-12 text-slate-600">
                    <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No alphas found for this batch</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-400 text-xs font-mono border-b border-gray-200 dark:border-gray-700 border-slate-800">
                          <th className="text-left py-2 px-3">CODE</th>
                          <th className="text-right py-2 px-3">SHARPE</th>
                          <th className="text-right py-2 px-3">RETURN</th>
                          <th className="text-right py-2 px-3">DRAWDOWN</th>
                          <th className="text-right py-2 px-3">WIN RATE</th>
                          <th className="text-right py-2 px-3">FITNESS</th>
                          <th className="text-left py-2 px-3">STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBatchAlphas.map((a) => (
                          <tr key={a.id} className="border-b border-gray-200 dark:border-gray-700 border-slate-800/30 hover:bg-slate-800/30 cursor-pointer" onClick={() => { setSelectedAlpha(a); setSelectedBatch(null) }}>
                            <td className="py-3 px-3 font-mono text-emerald-300">{a.alpha_code}</td>
                            <td className={`py-3 px-3 text-right font-mono ${(a.sharpe_ratio || 0) >= 1.5 ? 'text-emerald-400' : 'text-slate-300'}`}>{a.sharpe_ratio?.toFixed(2) || 'N/A'}</td>
                            <td className="py-3 px-3 text-right font-mono text-slate-300">{a.annual_return ? `${(a.annual_return * 100).toFixed(1)}%` : 'N/A'}</td>
                            <td className={`py-3 px-3 text-right font-mono ${(a.max_drawdown || 0) > -0.15 ? 'text-emerald-400' : 'text-red-400'}`}>{a.max_drawdown ? `${(a.max_drawdown * 100).toFixed(1)}%` : 'N/A'}</td>
                            <td className="py-3 px-3 text-right font-mono text-slate-300">{a.win_rate ? `${(a.win_rate * 100).toFixed(1)}%` : 'N/A'}</td>
                            <td className="py-3 px-3 text-right font-mono text-slate-300">{a.fitness_score?.toFixed(2) || 'N/A'}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-1 rounded text-xs font-mono ${a.status === 'passed' ? 'bg-emerald-500/20 text-emerald-400' : a.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-slate-400'}`}>{a.status?.toUpperCase()}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ALPHA DETAIL MODAL */}
      <AnimatePresence>
        {selectedAlpha && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setSelectedAlpha(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-900 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-emerald-400 font-mono">{selectedAlpha.alpha_code}</h2>
                    <p className="text-sm text-slate-400 mt-1">Discovered {new Date(selectedAlpha.created_at).toLocaleString()}</p>
                  </div>
                  <button onClick={() => setSelectedAlpha(null)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Sharpe Ratio", value: selectedAlpha.sharpe_ratio?.toFixed(3), good: (selectedAlpha.sharpe_ratio || 0) >= 1.5 },
                    { label: "Annual Return", value: selectedAlpha.annual_return ? `${(selectedAlpha.annual_return * 100).toFixed(2)}%` : "N/A", good: (selectedAlpha.annual_return || 0) > 0 },
                    { label: "Max Drawdown", value: selectedAlpha.max_drawdown ? `${(selectedAlpha.max_drawdown * 100).toFixed(2)}%` : "N/A", good: (selectedAlpha.max_drawdown || 0) > -0.15 },
                    { label: "Win Rate", value: selectedAlpha.win_rate ? `${(selectedAlpha.win_rate * 100).toFixed(1)}%` : "N/A", good: (selectedAlpha.win_rate || 0) > 0.52 },
                    { label: "Turnover", value: selectedAlpha.turnover?.toFixed(3), good: (selectedAlpha.turnover || 1) < 0.5 },
                    { label: "Fitness Score", value: selectedAlpha.fitness_score?.toFixed(3), good: (selectedAlpha.fitness_score || 0) > 1.0 },
                  ].map((metric) => (
                    <div key={metric.label} className="bg-slate-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700 border-slate-700">
                      <div className="text-xs text-slate-400 mb-1">{metric.label}</div>
                      <div className={`text-lg font-mono font-bold ${metric.good ? "text-emerald-400" : "text-red-400"}`}>{metric.value}</div>
                    </div>
                  ))}
                </div>
                {selectedAlpha.pnl_curve && selectedAlpha.pnl_curve.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-mono text-slate-400 mb-3">CUMULATIVE PnL CURVE</h3>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 border-slate-700">
                      <svg viewBox="0 0 100 50" className="w-full h-48" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="mpnl" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {(() => {
                          const data = selectedAlpha.pnl_curve; const mx = Math.max(...data); const mn = Math.min(...data); const r = mx - mn || 1
                          const pts = data.map((v, i) => { const x = (i / (data.length - 1)) * 100; const y = 50 - ((v - mn) / r) * 50; return `${x},${y}` }).join(" ")
                          return <><polyline points={pts} fill="none" stroke="#00ff88" strokeWidth="0.3" vectorEffect="non-scaling-stroke" /><polygon points={`0,50 ${pts} 100,50`} fill="url(#mpnl)" /></>
                        })()}
                      </svg>
                    </div>
                  </div>
                )}
                {selectedAlpha.drawdown_curve && selectedAlpha.drawdown_curve.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-mono text-slate-400 mb-3">DRAWDOWN CURVE</h3>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 border-slate-700">
                      <svg viewBox="0 0 100 50" className="w-full h-32" preserveAspectRatio="none">
                        {(() => {
                          const data = selectedAlpha.drawdown_curve; const mn = Math.min(...data); const mx = Math.max(...data); const r = mx - mn || 1
                          const pts = data.map((v, i) => { const x = (i / (data.length - 1)) * 100; const y = 50 - ((v - mn) / r) * 50; return `${x},${y}` }).join(" ")
                          return <><polyline points={pts} fill="none" stroke="#ff4444" strokeWidth="0.3" vectorEffect="non-scaling-stroke" /><polygon points={`0,50 ${pts} 100,50`} fill="rgba(255, 68, 68, 0.2)" /></>
                        })()}
                      </svg>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  {selectedAlpha.is_passed && (
                    <button onClick={() => handleSubmitToWQ(selectedAlpha)} className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-400 border border-gray-200 dark:border-gray-700 border-emerald-500/30 rounded-lg py-3 font-medium hover:bg-emerald-500/30 transition-colors">
                      <Send className="w-4 h-4" /> SUBMIT TO WORLD QUANT
                    </button>
                  )}
                  <button onClick={() => handleExportReport(selectedAlpha)} className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-slate-300 rounded-lg py-3 font-medium hover:bg-slate-700 transition-colors">
                    <LineChart className="w-4 h-4" /> EXPORT REPORT
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
