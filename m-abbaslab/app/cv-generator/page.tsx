// app/cv-generator/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, Sparkles, RefreshCw, Layers, Award, 
  Briefcase, GraduationCap, CheckCircle2, ChevronRight, 
  Wand2, BrainCircuit, ShieldCheck, Mail, Phone, MapPin, 
  Globe, FileText, MessageSquare, QrCode, FileSignature, X
} from 'lucide-react'
import { personalConfig } from '@/config/personal'

// ─── Data Templates based on Mohammed's Real CV ───────────────────────────────

const BASE_INFO = {
  name: "MOHAMMED ABBAS",
  email: "mohammedabbasofficial100@gmail.com",
  phone: "+254 702 894 309",
  location: "Nairobi, Kenya",
  linkedin: "linkedin.com/in/mohammed-abbas-490385369",
  website: "m-abbaslab.vercel.app",
  education: [
    {
      institution: "Chuka University",
      degree: "BSc Economics and Statistics",
      period: "2024 – 2028 (Ongoing)",
      details: ["Focus on Econometric Modeling, Advanced Calculus, and Probability Theory"]
    },
    {
      institution: "St. Augustine Kauma Boys High School",
      degree: "Kenya Certificate of Secondary Education (KCSE) – Grade B",
      period: "Completed 2023"
    },
    {
      institution: "Mutomo Preparatory Academy",
      degree: "Kenya Certificate of Primary Education (KCPE) – Grade B+",
      period: "Completed 2019"
    }
  ]
}

const TEMPLATES: Record<string, {
  title: string
  summary: string
  skills: { technical: string[]; business: string[] }
  experience: { role: string; company: string; period: string; bullets: string[] }[]
}> = {
  economics: {
    title: "Economist & Statistician CV",
    summary: "A analytical and highly motivated Economist & Statistician in training, combining robust economic theory with statistical algorithms to solve market inefficiencies and structural problems. Expert in predictive time-series models, econometrics, and quantitative analysis.",
    skills: {
      technical: ["Economic Research", "Time Series Econometrics", "Statistical Modelling", "Python & R", "Data Visualisation", "Jupyter"],
      business: ["Analytical Theory", "Policy Formulation", "Market Trend Forecasting", "Quantitative Finance", "Strategic Advisory"]
    },
    experience: [
      {
        role: "Data Collection & Analyst",
        company: "Cereal Growers Association (CGA)",
        period: "2025 (Two Engagements)",
        bullets: [
          "Collected and analyzed agricultural data to support strategic decisions for cereal growers across Kenya.",
          "Prepared structured data reports and insights that informed policy recommendations and operational planning.",
          "Applied statistical techniques to ensure accuracy, consistency, and reliability of field-collected data."
        ]
      },
      {
        role: "CEO & Founder",
        company: "Quantum Impact Syndicate",
        period: "Ongoing",
        bullets: [
          "Establish high-frequency quantitative finance research methods and proprietary micro-alpha frameworks.",
          "Lead strategic economic thesis formulation and supervise quantitative modeling pipelines."
        ]
      }
    ]
  },
  engineering: {
    title: "Full-Stack Software Engineer CV",
    summary: "Performance-driven Software Engineer with extensive experience in the Next.js/TypeScript ecosystem, microservices, and database scaling. Specializes in building secure personal operating systems, high-speed API Gateways, and AI-enabled software utilities.",
    skills: {
      technical: ["Next.js 14/15", "React & TypeScript", "Tailwind CSS", "Go & FastAPI", "gRPC & WebSockets", "Redis & PostgreSQL"],
      business: ["System Architecture", "API Scalability", "Rate Limiting Patterns", "Clean Code Standards", "Agile Product Management"]
    },
    experience: [
      {
        role: "Project Manager",
        company: "ALX Africa – Afya-Connect Project",
        period: "2024",
        bullets: [
          "Led the Afya-Connect project, coordinating cross-functional teams to deliver health-tech solutions.",
          "Managed project timelines, resources, and stakeholder communications to ensure successful delivery.",
          "Facilitated agile workflows and maintained documentation to track milestones and outcomes."
        ]
      },
      {
        role: "Lead Platform Developer",
        company: "M-AbbasLab",
        period: "Ongoing",
        bullets: [
          "Architected and deployed a personal operating framework serving unified analytical platforms.",
          "Engineered Edge-based middleware authentication pipelines, multi-platform schedulers, and secure CMS modules."
        ]
      }
    ]
  },
  entrepreneur: {
    title: "Entrepreneur & Business Advisor CV",
    summary: "Visionary founder, advisor, and community organizer with proven experience in venture development, luxury events planning, and student initiatives. Expert in brand positioning, financial optimization, and scaling highly profitable local ecosystems.",
    skills: {
      technical: ["CEO Financial Tracking", "Resource Management", "Event Planning Software", "Strategic Mapping", "Data Analytics"],
      business: ["Venture Architecture", "Brand Positioning", "Client Acquisition", "Contract Negotiation", "Public Relations"]
    },
    experience: [
      {
        role: "Event Organizer & Founder",
        company: "Chuka Royals Awards & FHSS Gala Night – Chuka University",
        period: "2026",
        bullets: [
          "Founded and organized the Chuka Royals Awards, a prestigious recognition event for students at Chuka University.",
          "Coordinated the Faculty of Health Sciences (FHSS) Gala Night, overseeing logistics, sponsorships, and guest management.",
          "Managed event budgets, vendor relationships, and promotional campaigns, resulting in a highly attended and acclaimed event."
        ]
      },
      {
        role: "CEO & Founder",
        company: "Royal Icon Events | Quantum Impact Syndicate",
        period: "Ongoing",
        bullets: [
          "Founded and lead Royal Icon Events, providing premium event planning and management services.",
          "Established Quantum Impact Syndicate, a business advisory and entrepreneurship platform.",
          "Drive strategic vision, business development, and client acquisition across both ventures."
        ]
      }
    ]
  },
  model: {
    title: "Fashion Model & Media Icon CV",
    summary: "High-fashion editorial and runway model, former multiple-title holder, and creative lead. Combines strong aesthetic vision with digital media analytics and runway management expertise to elevate premium lifestyle brands and young African creators.",
    skills: {
      technical: ["Runway Choreography", "Fashion Tech Platforms", "Media Analytics", "Digital Portfolio Design"],
      business: ["Brand Representation", "Event Hosting", "Public Relations", "Talent Management", "Creative Direction"]
    },
    experience: [
      {
        role: "Model Judge & Authority",
        company: "Kipawa Africa – Mr & Miss Mtwapa",
        period: "2025/2026",
        bullets: [
          "Served as a Model Judge in major national pageantry events, evaluating contestants on poise, presentation, and runway walk.",
          "Mentored aspiring models on style, creative expression, and professional standards in the fashion industry."
        ]
      },
      {
        role: "Professional Model & Title Winner",
        company: "Nairobi Fashion House / Kasarani",
        period: "2022 - 2024",
        bullets: [
          "Won prestigious crowns including Mr. YYMH (Nairobi), Mr. Glam Haven (Chuka), and Mr. Fashion Kitui County.",
          "Represented elite fashion houses in national campaigns and ran high-profile runways across the East African region."
        ]
      }
    ]
  }
}

export default function CVGenerator() {
  const [category, setCategory] = useState<'economics' | 'engineering' | 'entrepreneur' | 'model' | 'custom'>('economics')
  
  // Custom generated state
  const [customRole, setCustomRole] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [customCV, setCustomCV] = useState<typeof TEMPLATES['economics'] | null>(null)
  
  // Learning Algorithm metrics
  const [aiGeneration, setAiGeneration] = useState(14)
  const [learningLog, setLearningLog] = useState<string[]>([
    "System Initialized: Cognitive skill parser active.",
    "Database loaded with 4 real-world experience paradigms.",
    "Self-improving model sync'd to regional hiring trends."
  ])
  const [feedbackSuccess, setFeedbackSuccess] = useState(94.2)
  const [feedbackCount, setFeedbackCount] = useState(189)

  // PDF & Cover Letter States
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [showCoverLetter, setShowCoverLetter] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [generatingLetter, setGeneratingLetter] = useState(false)

  const cvData = category === 'custom' && customCV ? customCV : TEMPLATES[category === 'custom' ? 'economics' : category]

  // Learning Engine Optimizer
  const optimizeCV = () => {
    setAiLoading(true)
    const newLog = [...learningLog]
    
    setTimeout(() => {
      // Simulate highly sophisticated AI optimization based on the input role or standard refinement
      const roleText = customRole.trim() || "Applied Econometrics & AI Researcher"
      
      const newCustomCV = {
        title: `${roleText} - ACCREDITED CV`,
        summary: `Highly optimized and strategic CV custom-tailored for ${roleText}. Blends the robust mathematical core of BSc Economics & Statistics at Chuka University with modern software systems, and elite research execution. Designed for high impact, decision science, and continuous development pipelines.`,
        skills: {
          technical: [
            ...TEMPLATES.economics.skills.technical.slice(0, 3),
            ...TEMPLATES.engineering.skills.technical.slice(0, 3),
            "Algorithmic Alignment", "Cross-Paradigm Fusions"
          ],
          business: [
            ...TEMPLATES.economics.skills.business.slice(0, 2),
            ...TEMPLATES.engineering.skills.business.slice(0, 2),
            "Technical Venture Scaling", "Cognitive Advisory"
          ]
        },
        experience: [
          {
            role: `Strategic Lead (${roleText})`,
            company: "Quantum Impact Syndicate",
            period: "Ongoing",
            bullets: [
              `Directing research frameworks at the intersection of economic analysis and applied technological pipelines.`,
              `Automating multi-agent platforms and predictive modeling workflows to yield structural system designs.`
            ]
          },
          ...TEMPLATES.economics.experience.slice(0, 1),
          ...TEMPLATES.engineering.experience.slice(0, 1)
        ]
      }

      setCustomCV(newCustomCV)
      setCategory('custom')
      setAiGeneration(prev => prev + 1)
      setFeedbackCount(prev => prev + 1)
      setFeedbackSuccess(prev => parseFloat((prev + (Math.random() * 0.1)).toFixed(1)))
      
      newLog.unshift(`[Engine v2.4] Successfully parsed role: "${roleText}"`)
      newLog.unshift(`[Improvement] Restructured summary using high-professionalism weights.`)
      newLog.unshift(`[Database Update] Successfully integrated CGA field study metrics into quantitative segments.`)
      setLearningLog(newLog.slice(0, 5))
      setAiLoading(false)
    }, 1500)
  }

  // PDF Export using html2pdf
  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true)
    try {
      // Dynamically import html2pdf so it only runs on the client
      const html2pdf = (await import('html2pdf.js')).default
      const element = document.getElementById('printable-cv-area')
      
      const opt = {
        margin: [0.5, 0.5],
        filename: `Mohammed_Abbas_CV_${category}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      }
      
      await html2pdf().set(opt).from(element).save()
    } catch (err) {
      console.error("PDF generation failed:", err)
      // Fallback to browser print if library fails
      window.print()
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Cover Letter Generator
  const generateCoverLetter = () => {
    if (!jobDescription) return
    setGeneratingLetter(true)
    
    // Simulate AI Generation
    setTimeout(() => {
      setCoverLetter(
        `Dear Hiring Manager,\n\nI am writing to express my profound interest in the position described. As a ${cvData.title} with expertise in ${cvData.skills.technical.slice(0, 3).join(', ')}, I have a proven track record of driving impact.\n\nMy recent work with ${cvData.experience[0].company} as a ${cvData.experience[0].role} involved ${cvData.experience[0].bullets[0].toLowerCase()} This experience aligns perfectly with the strategic objectives of your organization.\n\nI am particularly drawn to this role because it requires a synthesis of ${cvData.skills.business[0]} and technical execution, a duality I have mastered throughout my career and via the Quantum Impact Syndicate.\n\nI welcome the opportunity to discuss how my distinct blend of economics, engineering, and leadership can provide immediate value to your team.\n\nSincerely,\nMohammed Abbas`
      )
      setGeneratingLetter(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen relative pt-10 pb-20">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#7000ff]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 mb-5">
            <BrainCircuit className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400 font-medium">Cognitive CV Orchestrator</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 via-white to-purple-500 bg-clip-text text-transparent">
            Autonomous CV Architect
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Generate and dynamically optimize Mohammed Abbas's professional credential configurations across multiple disciplines using our live learning model feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT COLUMN: CONTROL PANEL (4 cols) ───────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Category Selector */}
            <div className="glass-panel p-6 border border-white/10 rounded-2xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                Select Discipline
              </h3>
              <div className="space-y-2">
                {([
                  { id: 'economics', label: '📊 Economist & Statistician', desc: 'BSc Chuka, CGA metrics' },
                  { id: 'engineering', label: '💻 Software Engineer', desc: 'Next.js, Go API gateways' },
                  { id: 'entrepreneur', label: '💼 Venture & Advisory', desc: 'QIS, Royal Icon Events, FHSS' },
                  { id: 'model', label: '✨ Fashion Model', desc: 'Mr. YYMH, County Titles' }
                ] as const).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setCategory(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                      category === opt.id
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-white/5 bg-white/5 text-gray-400 hover:border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-bold text-sm">{opt.label}</div>
                    <div className="text-xs mt-1 opacity-70">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Custom Generation & Learning Algorithm */}
            <div className="glass-panel p-6 border border-white/10 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent pointer-events-none" />
              
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Autonomous Optimizer
              </h3>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Input any custom target role or company description. The system will use its cognitive weights to dynamically re-architect and align the CV structure.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Target Role / Field
                  </label>
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="e.g., Quantitative Risk Analyst"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                  />
                </div>

                <button
                  onClick={optimizeCV}
                  disabled={aiLoading}
                  className="w-full relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
                  <div className="relative w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
                    {aiLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Refining Parameters...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        Optimize & Learn
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* Learning Model Realtime Analytics */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                    <div className="text-xl font-mono font-bold text-blue-400">{feedbackSuccess}%</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">CV Accuracy</div>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                    <div className="text-xl font-mono font-bold text-purple-400">{feedbackCount}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Refinements</div>
                  </div>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-xl p-3 font-mono text-[10px] text-emerald-400/80 space-y-1.5 max-h-[120px] overflow-y-auto scrollbar-hide">
                  <div className="text-white/40 uppercase tracking-widest text-[8px] mb-1">Engine Logs</div>
                  {learningLog.map((log, idx) => (
                    <div key={idx} className="flex gap-1.5">
                      <span className="text-blue-400/60">&gt;</span>
                      <p className="flex-1">{log}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: CV SHEET (8 cols) ──────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <span className="text-xs text-gray-500 font-mono">
                System status: <span className="text-emerald-500 font-bold">READY FOR EXPORT</span>
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCoverLetter(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-400 rounded-xl text-xs font-bold transition-all"
                >
                  <FileSignature className="w-4 h-4" />
                  Auto Cover Letter
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] text-blue-400 hover:text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isGeneratingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {isGeneratingPdf ? 'Compiling PDF...' : 'Download PDF'}
                </button>
              </div>
            </div>

            {/* Stunning PDF-Like CV Card Sheet */}
            <div id="printable-cv-area" className="bg-white text-gray-900 border border-gray-200 shadow-2xl rounded-2xl p-8 md:p-12 relative overflow-hidden font-sans min-h-[1050px]">
              
              {/* Top Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
              
              {/* Header */}
              <div className="text-center mb-8 border-b border-gray-100 pb-6 relative">
                
                {/* Live QR Code linking to Portfolio */}
                <div className="absolute top-0 right-0 hidden md:flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://m-abbaslab.vercel.app/cv-generator`} 
                    alt="Scan Portfolio" 
                    className="w-16 h-16 rounded-md border border-gray-200 p-1"
                  />
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Live Profile</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight">{BASE_INFO.name}</h2>
                <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase mt-1">
                  {category === 'custom' ? cvData.title : TEMPLATES[category].title}
                </p>
                
                {/* Contact Badges */}
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 text-xs text-gray-600 font-medium">
                  <a href={personalConfig.social.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-green-600 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5 text-green-600" /> WhatsApp Chat
                  </a>
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-blue-600" /> {BASE_INFO.email}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-600" /> {BASE_INFO.location}</span>
                  <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-blue-600" /> {BASE_INFO.website}</span>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-blue-950 uppercase tracking-widest border-b border-blue-900/10 pb-1.5 mb-3">
                  Professional Summary
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {cvData.summary}
                </p>
              </div>

              {/* Grid: Skills & Education */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
                
                {/* Skills (7 cols) */}
                <div className="md:col-span-7">
                  <h3 className="text-xs font-bold text-blue-950 uppercase tracking-widest border-b border-blue-900/10 pb-1.5 mb-3">
                    Skills & Competencies
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-blue-900 mb-1.5">Technical Expertise</div>
                      <div className="flex flex-wrap gap-1.5">
                        {cvData.skills.technical.map((s) => (
                          <span key={s} className="text-xs px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-md text-blue-800 font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-indigo-900 mb-1.5">Business & Strategy</div>
                      <div className="flex flex-wrap gap-1.5">
                        {cvData.skills.business.map((s) => (
                          <span key={s} className="text-xs px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-indigo-800 font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education (5 cols) */}
                <div className="md:col-span-5">
                  <h3 className="text-xs font-bold text-blue-950 uppercase tracking-widest border-b border-blue-900/10 pb-1.5 mb-3">
                    Education
                  </h3>
                  <div className="space-y-4">
                    {BASE_INFO.education.map((e, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="text-xs font-bold text-gray-900">{e.degree}</div>
                        <div className="text-xs text-blue-850 font-semibold">{e.institution}</div>
                        <div className="text-[10px] text-gray-500 font-medium">{e.period}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Work Experience */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-blue-950 uppercase tracking-widest border-b border-blue-900/10 pb-1.5 mb-4">
                  Professional Experience
                </h3>
                <div className="space-y-6">
                  {cvData.experience.map((job, idx) => (
                    <div key={idx} className="relative pl-4 border-l-2 border-blue-500/20 space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{job.role}</h4>
                          <div className="text-xs text-blue-800 font-semibold">{job.company}</div>
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold whitespace-nowrap bg-gray-100 px-2 py-0.5 rounded-full">{job.period}</span>
                      </div>
                      <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1.5 font-medium leading-relaxed">
                        {job.bullets.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 pt-6 mt-8 flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                <span>REPRESENTED BY MOHAMMED ABBAS</span>
                <span>accredited credential template</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Cover Letter Modal Overlay */}
      <AnimatePresence>
        {showCoverLetter && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0a0a0f] border border-white/10 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl shadow-purple-500/10 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                  <FileSignature className="w-6 h-6 text-purple-400" />
                  AI Cover Letter Generator
                </h3>
                <button onClick={() => setShowCoverLetter(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Paste Job Description</label>
                  <textarea 
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the requirements or description for the role you're applying for..."
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 resize-none transition-all"
                  />
                  <button 
                    onClick={generateCoverLetter}
                    disabled={generatingLetter || !jobDescription}
                    className="mt-4 w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-2 transition-all"
                  >
                    {generatingLetter ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    {generatingLetter ? 'Generating Tailored Letter...' : 'Generate Letter'}
                  </button>
                </div>

                {coverLetter && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Generated Output</label>
                      <button 
                        onClick={() => navigator.clipboard.writeText(coverLetter)}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Copy to Clipboard
                      </button>
                    </div>
                    <div className="bg-white text-gray-900 p-8 rounded-xl text-sm leading-relaxed whitespace-pre-wrap font-sans shadow-inner">
                      {coverLetter}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
