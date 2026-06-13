"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui-cv/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-cv/card";
import { Loader2, Download, FileText, CheckCircle2, AlertCircle, ArrowLeft, CreditCard, Copy } from "lucide-react";

interface ATSCheck {
  name: string;
  points: number;
  status: "passed" | "failed";
  description: string;
}

interface CVResult {
  id: string;
  cv: string;
  coverLetter: string;
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
  const [isPaid, setIsPaid] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [activeTab, setActiveTab] = useState<"cv" | "cover-letter" | "ats">("cv");
  const [copied, setCopied] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("cv_user_email");
    setUserEmail(email);

    // Load result from sessionStorage
    const stored = sessionStorage.getItem("cv_result");
    if (stored) {
      const parsed = JSON.parse(stored);
      setCvResult(parsed.data);
      setIsPaid(parsed.isFirstCV);
    }
  }, []);

  // Check if payment was completed (when user returns from Paystack)
  useEffect(() => {
    const ref = searchParams.get("reference");
    if (ref) {
      setIsCheckingPayment(true);
      fetch("/api/cv/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setIsPaid(true);
        })
        .finally(() => setIsCheckingPayment(false));
    }
  }, [searchParams]);

  const handlePayment = async () => {
    if (!userEmail || !id) return;
    setIsInitiatingPayment(true);
    try {
      const res = await fetch("/api/cv/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, generationId: id }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setIsInitiatingPayment(false);
    }
  };

  const handleDownload = () => {
    if (!cvResult) return;
    const blob = new Blob([cvResult.cv], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cv.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!cvResult) return;
    navigator.clipboard.writeText(activeTab === "cv" ? cvResult.cv : cvResult.coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!cvResult) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isCheckingPayment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-slate-300">Verifying payment...</p>
      </div>
    );
  }

  const atsScore = cvResult.atsReport?.score || 0;
  const atsTotal = cvResult.atsReport?.totalPoints || 100;
  const atsPercent = Math.round((atsScore / atsTotal) * 100);

  const blurredContent = !isPaid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => router.push("/cv-generator/builder")} className="text-slate-400 hover:text-white text-sm mb-2 flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to Builder
            </button>
            <h1 className="text-3xl font-bold text-white">
              {isPaid ? "✅ Your CV is Ready!" : "🔒 CV Generated — Unlock to Download"}
            </h1>
            <p className="text-slate-400 mt-1">
              {isPaid ? "Review, copy, or download your tailored CV below." : "Your first CV is free. Pay 1000 NGN to unlock additional CVs."}
            </p>
          </div>
          {isPaid && (
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
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
        <div className="flex gap-1 mb-4 bg-slate-800 rounded-lg p-1 w-fit">
          {(["cv", "cover-letter", "ats"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              {tab === "cv" ? "CV" : tab === "cover-letter" ? "Cover Letter" : "ATS Analysis"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="relative">
          {blurredContent && (
            <div className="absolute inset-0 z-10 backdrop-blur-md bg-slate-900/60 rounded-xl flex flex-col items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="text-xl font-bold text-white mb-2">Unlock Your CV</h3>
                <p className="text-slate-300 max-w-sm">Your CV has been generated! Pay 1000 NGN to download and use it.</p>
              </div>
              <Button
                size="lg"
                onClick={handlePayment}
                disabled={isInitiatingPayment}
                className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {isInitiatingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                Pay 1000 NGN with Paystack
              </Button>
            </div>
          )}

          {/* CV Tab */}
          {activeTab === "cv" && (
            <Card className="relative">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  Your CV
                </CardTitle>
                {isPaid && (
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2 text-slate-400">
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <pre className={`whitespace-pre-wrap text-sm text-slate-200 font-mono leading-relaxed max-h-[600px] overflow-y-auto ${blurredContent ? "select-none" : ""}`}>
                  {cvResult.cv}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Cover Letter Tab */}
          {activeTab === "cover-letter" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Cover Letter</CardTitle>
                {isPaid && (
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2 text-slate-400">
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <pre className={`whitespace-pre-wrap text-sm text-slate-200 leading-relaxed max-h-[600px] overflow-y-auto ${blurredContent ? "select-none" : ""}`}>
                  {cvResult.coverLetter}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* ATS Analysis Tab */}
          {activeTab === "ats" && (
            <div className="space-y-4">
              {cvResult.atsReport?.checks?.map((check, idx) => (
                <Card key={idx}>
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
                <Card>
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
        </div>

        {/* Payment CTA at bottom */}
        {!isPaid && !blurredContent && (
          <div className="mt-8 text-center">
            <Button size="lg" onClick={handlePayment} disabled={isInitiatingPayment} className="gap-2 bg-gradient-to-r from-green-600 to-green-700">
              {isInitiatingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Pay 1000 NGN to Unlock
            </Button>
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
