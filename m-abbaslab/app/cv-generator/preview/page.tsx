"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui-cv/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-cv/card";
import { Loader2, Download, FileText, CheckCircle2, AlertCircle, ArrowLeft, Copy, Sparkles, Star, Briefcase } from "lucide-react";
import { marked } from "marked";

interface CVModel {
  name: string;
  content: string;
}

interface InterviewQuestion {
  question: string;
  rationale: string;
  suggestedAnswer: string;
}

interface ATSCheck {
  name: string;
  points: number;
  status: "passed" | "failed";
  description: string;
}

interface CVResult {
  id: string;
  cv?: string;
  cv_models?: CVModel[];
  coverLetter: string;
  interviewQuestions?: InterviewQuestion[];
  researchSummary?: string;
  atsReport: {
    score: number;
    totalPoints: number;
    checks: ATSCheck[];
    suggestedImprovements: string[];
  };
}

function CVPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [cvResult, setCvResult] = useState<CVResult | null>(null);
  const [activeTab, setActiveTab] = useState<"cv" | "cover-letter" | "ats" | "interview" | "research">("cv");
  const [activeModelIdx, setActiveModelIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  useEffect(() => {
    // Load result from sessionStorage
    const stored = sessionStorage.getItem("cv_result");
    if (stored) {
      const parsed = JSON.parse(stored);
      setCvResult(parsed.data);
    }
  }, []);

  const handleDownload = async () => {
    if (!cvResult) return;
    
    const markdownContent = activeTab === "cv" && cvResult.cv_models 
      ? cvResult.cv_models[activeModelIdx].content 
      : activeTab === "cv" && cvResult.cv 
        ? cvResult.cv 
        : cvResult.coverLetter;

    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      
      const htmlContent = await marked.parse(markdownContent);
      
      const element = document.createElement('div');
      element.innerHTML = htmlContent;
      element.style.padding = '40px';
      element.style.fontFamily = 'Georgia, "Times New Roman", serif';
      element.style.color = '#1a1a1a';
      element.style.lineHeight = '1.6';
      element.style.fontSize = '11pt';
      
      const opt = {
        margin:       [15, 15, 15, 15] as [number, number, number, number],
        filename:     activeTab === "cv" 
          ? `CV_${cvResult.cv_models?.[activeModelIdx]?.name || 'Professional'}.pdf` 
          : 'Cover_Letter.pdf',
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      
      html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error("PDF generation error:", e);
      const blob = new Blob([markdownContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cv.md";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCopy = () => {
    if (!cvResult) return;
    const content = activeTab === "cv" && cvResult.cv_models
      ? cvResult.cv_models[activeModelIdx].content 
      : activeTab === "cv" && cvResult.cv 
        ? cvResult.cv 
        : cvResult.coverLetter;

    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!cvResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-slate-400">Loading your CV...</p>
      </div>
    );
  }

  const atsScore = cvResult.atsReport?.score || 0;
  const atsTotal = cvResult.atsReport?.totalPoints || 100;
  const atsPercent = Math.round((atsScore / atsTotal) * 100);

  const tabs = [
    { id: "cv" as const, label: "CV Models", show: true },
    { id: "cover-letter" as const, label: "Cover Letter", show: true },
    { id: "ats" as const, label: "ATS Analysis", show: true },
    { id: "interview" as const, label: "Interview Prep", show: !!cvResult.interviewQuestions?.length },
    { id: "research" as const, label: "AI Research", show: !!cvResult.researchSummary },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Pro Upsell Banner */}
        <div className="mb-6 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-indigo-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Upgrade to CV Generator Pro</p>
              <p className="text-slate-400 text-xs">Unlimited CVs, Job Tracker, AI Interview Coach — from just <span className="text-green-400 font-bold">$0.50/mo</span></p>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => setShowProModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2 shrink-0"
          >
            <Star className="h-3 w-3" /> Go Pro
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => router.push("/cv-generator/builder")} className="text-slate-400 hover:text-white text-sm mb-2 flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to Builder
            </button>
            <h1 className="text-3xl font-bold text-white">✅ Your CV is Ready!</h1>
            <p className="text-slate-400 mt-1">Review, copy, or download your tailored CV below.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCopy} variant="outline" className="gap-2 border-slate-600 text-white">
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button onClick={handleDownload} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* ATS Score Banner */}
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-4 ${atsPercent >= 70 ? "bg-green-500/10 border-green-500/30" : "bg-yellow-500/10 border-yellow-500/30"}`}>
          <div className="text-4xl font-bold text-white">{atsPercent}%</div>
          <div>
            <div className={`font-semibold ${atsPercent >= 70 ? "text-green-400" : "text-yellow-400"}`}>ATS Score</div>
            <div className="text-slate-400 text-sm">{atsScore}/{atsTotal} points — {atsPercent >= 70 ? "Your CV is well-optimized" : "Consider the suggestions below"}</div>
          </div>
          <div className="flex-1 bg-slate-700 rounded-full h-2 ml-4">
            <div className={`h-2 rounded-full transition-all ${atsPercent >= 70 ? "bg-green-500" : "bg-yellow-500"}`} style={{ width: `${atsPercent}%` }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-800/80 rounded-xl p-1.5 w-fit flex-wrap backdrop-blur-sm border border-slate-700/50">
          {tabs.filter(t => t.show).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25" 
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* CV Tab */}
          {activeTab === "cv" && (
            <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  Your CV
                </CardTitle>
                
                {cvResult.cv_models && cvResult.cv_models.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {cvResult.cv_models.map((model, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveModelIdx(idx)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          activeModelIdx === idx 
                            ? "bg-blue-500/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10" 
                            : "bg-slate-800 border-slate-600 text-slate-400 hover:text-white hover:border-slate-500"
                        }`}
                      >
                        {model.name}
                      </button>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                <pre className="whitespace-pre-wrap text-sm text-slate-200 font-mono leading-relaxed max-h-[700px] overflow-y-auto pr-4">
                  {cvResult.cv_models ? cvResult.cv_models[activeModelIdx]?.content : cvResult.cv}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Cover Letter Tab */}
          {activeTab === "cover-letter" && (
            <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700/50">
                <CardTitle className="text-white">Cover Letter</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <pre className="whitespace-pre-wrap text-sm text-slate-200 leading-relaxed max-h-[700px] overflow-y-auto pr-4">
                  {cvResult.coverLetter}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* ATS Analysis Tab */}
          {activeTab === "ats" && (
            <div className="space-y-4">
              {cvResult.atsReport?.checks?.map((check, idx) => (
                <Card key={idx} className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-3">
                      {check.status === "passed" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">{check.name}</span>
                          <span className={`text-sm font-semibold ${check.status === "passed" ? "text-green-400" : "text-red-400"}`}>
                            {check.status === "passed" ? `+${check.points}` : "0"}/{check.points} pts
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{check.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {cvResult.atsReport?.suggestedImprovements?.length > 0 && (
                <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white text-base">💡 Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {cvResult.atsReport.suggestedImprovements.map((s, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">→</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Interview Prep Tab */}
          {activeTab === "interview" && cvResult.interviewQuestions && (
            <div className="space-y-4">
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 mb-4">
                <p className="text-indigo-300 text-sm font-medium">🎯 These questions are predicted based on the gap between your CV and the target job description. Practice these before your interview.</p>
              </div>
              {cvResult.interviewQuestions.map((q, idx) => (
                <Card key={idx} className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
                  <CardContent className="pt-5">
                    <h3 className="font-bold text-lg text-white mb-2">Q{idx + 1}: {q.question}</h3>
                    <p className="text-sm text-slate-400 italic mb-4">💡 Why they ask this: {q.rationale}</p>
                    <div className="bg-green-500/5 p-4 rounded-lg border border-green-500/20">
                      <span className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2 block">✅ Suggested Answer Approach</span>
                      <p className="text-sm text-slate-200 whitespace-pre-wrap">{q.suggestedAnswer}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* AI Research Tab */}
          {activeTab === "research" && cvResult.researchSummary && (
            <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-700/50">
                <CardTitle className="text-white flex items-center gap-2">
                  🔬 AI Research Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <pre className="whitespace-pre-wrap text-sm text-slate-200 leading-relaxed">
                  {cvResult.researchSummary}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 bg-gradient-to-r from-slate-800 to-slate-800/50 border border-slate-700/50 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-blue-400" />
            <div>
              <p className="text-white font-semibold">Track this application</p>
              <p className="text-slate-400 text-sm">Save this job to your dashboard and track your progress</p>
            </div>
          </div>
          <Button onClick={() => router.push("/cv-generator/dashboard")} variant="outline" className="border-slate-600 text-white gap-2">
            <Briefcase className="h-4 w-4" /> Go to Job Tracker
          </Button>
        </div>

        {/* Pro Modal */}
        {showProModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowProModal(false)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">CV Generator Pro</h2>
                <p className="text-slate-400">Supercharge your job search</p>
              </div>
              
              <div className="space-y-3 mb-6">
                {[
                  "Unlimited CV generations",
                  "3 AI-tailored CV models per generation",
                  "AI Interview Coach with predicted questions",
                  "Job Application Tracker dashboard",
                  "Live AI company research",
                  "Priority processing & support",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-white">$0<span className="text-2xl">.50</span><span className="text-lg text-slate-400 font-normal">/mo</span></div>
                <p className="text-slate-500 text-sm mt-1">Cancel anytime. No commitment.</p>
              </div>

              <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg font-semibold" onClick={() => { setShowProModal(false); alert("🚀 Pro subscriptions launching soon! You'll be the first to know."); }}>
                Coming Soon — Join Waitlist
              </Button>
              <button onClick={() => setShowProModal(false)} className="w-full text-slate-500 text-sm mt-3 hover:text-slate-300 transition-colors">
                Maybe later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CVPreviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    }>
      <CVPreviewContent />
    </Suspense>
  );
}
