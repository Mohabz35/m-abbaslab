"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui-cv/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-cv/card";
import { Loader2, FileText, CheckCircle2, Clock, Plus, ArrowLeft } from "lucide-react";

interface Generation {
  id: string;
  target_platform: string;
  ats_score: number;
  is_paid: boolean;
  status: string;
  created_at: string;
}

export default function CVHistoryPage() {
  const router = useRouter();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("cv_user_email");
    if (!email) {
      router.push("/cv-generator");
      return;
    }
    setUserEmail(email);
    fetch(`/api/cv/history?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        setGenerations(data.generations || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [router]);

  const platformEmojis: Record<string, string> = {
    linkedin: "💼",
    flexjobs: "🏠",
    remote_co: "🌍",
    indeed: "🔍",
    upwork: "💰",
    mercor: "🤖",
    mindrift: "🧠",
    rex: "💻",
    remo: "🌐",
    micro1: "⚡",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => router.push("/cv-generator")} className="text-slate-400 hover:text-white text-sm mb-2 flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to Home
            </button>
            <h1 className="text-3xl font-bold text-white">My CVs</h1>
            <p className="text-slate-400">{userEmail}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/cv-generator/dashboard")} variant="outline" className="border-slate-600 text-white hidden sm:flex">
              Job Tracker
            </Button>
            <Button onClick={() => router.push("/cv-generator/builder")} className="gap-2">
              <Plus className="h-4 w-4" />
              New CV
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : generations.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No CVs yet</h3>
              <p className="text-slate-400 mb-6">Create your first CV — it's free!</p>
              <Button onClick={() => router.push("/cv-generator/builder")}>
                Create My First CV
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {generations.map((gen) => (
              <Card key={gen.id} className="hover:border-blue-500/50 transition-all cursor-pointer"
                onClick={() => router.push(`/cv-generator/preview?id=${gen.id}`)}>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{platformEmojis[gen.target_platform] || "📄"}</div>
                      <div>
                        <div className="font-semibold text-white capitalize">{gen.target_platform.replace("_", ".")} CV</div>
                        <div className="text-sm text-slate-400 flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {new Date(gen.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${gen.ats_score >= 70 ? "text-green-400" : "text-yellow-400"}`}>
                          {gen.ats_score || "—"}
                        </div>
                        <div className="text-xs text-slate-400">ATS Score</div>
                      </div>
                        <span className="flex items-center gap-1 text-green-400 text-sm"><CheckCircle2 className="h-4 w-4" />Ready</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
