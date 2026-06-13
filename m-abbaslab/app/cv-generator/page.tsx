"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui-cv/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui-cv/card";
import { Badge } from "@/components/ui-cv/badge";
import { Input } from "@/components/ui-cv/input";
import { CheckCircle2, Zap, Shield, TrendingUp, ArrowRight } from "lucide-react";


export default function CVGeneratorHome() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem("cv_user_email");
    if (savedEmail) setUserEmail(savedEmail);
  }, []);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      localStorage.setItem("cv_user_email", email);
      setUserEmail(email);
      router.push("/cv-generator/builder");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cv_user_email");
    setUserEmail(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CV</span>
            </div>
            <span className="text-white font-bold text-lg">CV Generator Pro</span>
          </div>

          <div className="flex items-center gap-4">
            {userEmail ? (
              <>
                <span className="text-slate-300">Welcome, {userEmail}</span>
                <Button onClick={() => router.push("/cv-generator/history")} variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                  My CVs
                </Button>
                <Button onClick={() => router.push("/cv-generator/builder")} className="bg-blue-600 hover:bg-blue-700">
                  Create CV
                </Button>
                <Button onClick={handleLogout} variant="ghost" className="text-slate-400 hover:text-white">
                  Log Out
                </Button>
              </>
            ) : (
              <form onSubmit={handleStart} className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Enter email to start" 
                  className="bg-slate-800 border-slate-700 text-white"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Start Free
                </Button>
              </form>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">
          🚀 AI-Powered CV Generation
        </Badge>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Your Perfect CV,
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Powered by AI
          </span>
        </h1>

        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Create ATS-optimized, AI-humanized CVs tailored to your target platform. Get your first CV
          completely free, then just 1000 NGN for each additional one.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          {userEmail ? (
            <>
              <Button
                size="lg"
                onClick={() => router.push("/cv-generator/builder")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2"
              >
                Start Creating
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" onClick={() => router.push("/cv-generator/history")} variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                View My CVs
              </Button>
            </>
          ) : (
            <div className="max-w-md mx-auto w-full">
              <form onSubmit={handleStart} className="flex flex-col gap-4">
                <Input 
                  type="email" 
                  placeholder="Enter your email to get started" 
                  className="bg-slate-800 border-slate-700 text-white text-lg py-6"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <Button
                  size="lg"
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
          <div>
            <div className="text-3xl font-bold text-blue-400">100%</div>
            <p className="text-slate-400 text-sm">ATS Compatible</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400">1000 NGN</div>
            <p className="text-slate-400 text-sm">Per CV</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400">5 Platforms</div>
            <p className="text-slate-400 text-sm">Supported</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Why Choose CV Generator Pro?</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Zap className="h-6 w-6" />,
              title: "AI-Powered",
              description: "Advanced LLM generates tailored CVs in seconds",
            },
            {
              icon: <Shield className="h-6 w-6" />,
              title: "AI-Humanized",
              description: "Passes GPTZero, Turnitin, and Copyleaks detection",
            },
            {
              icon: <TrendingUp className="h-6 w-6" />,
              title: "ATS Optimized",
              description: "Scores and suggestions to maximize job applications",
            },
            {
              icon: <CheckCircle2 className="h-6 w-6" />,
              title: "Platform-Specific",
              description: "Tailored for LinkedIn, FlexJobs, Indeed, and more",
            },
          ].map((feature, idx) => (
            <Card key={idx} className="bg-slate-800 border-slate-700 hover:border-blue-500/50 transition-all">
              <CardHeader>
                <div className="text-blue-400 mb-2">{feature.icon}</div>
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Simple, Transparent Pricing</h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">First CV</CardTitle>
              <CardDescription>Get started free</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-400 mb-4">Free</div>
              <ul className="space-y-2 text-slate-300 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Full CV generation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ATS score & suggestions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Download as PDF
                </li>
              </ul>
              {userEmail ? (
                <Button onClick={() => router.push("/cv-generator/builder")} className="w-full bg-blue-600 hover:bg-blue-700">Get Started</Button>
              ) : (
                <form onSubmit={handleStart} className="w-full flex gap-2">
                  <Input 
                    type="email" 
                    placeholder="Email" 
                    className="bg-slate-900 border-slate-600 text-white"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Start</Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-500">
            <CardHeader>
              <Badge className="w-fit bg-blue-500/30 text-blue-300 border-blue-500/50 mb-2">
                Best Value
              </Badge>
              <CardTitle className="text-white">Additional CVs</CardTitle>
              <CardDescription>Per CV</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-300 mb-4">1000 NGN</div>
              <ul className="space-y-2 text-blue-100 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Platform-specific tailoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  AI humanization included
                </li>
              </ul>
              <Button onClick={() => router.push(userEmail ? "/cv-generator/builder" : "/")} className="w-full bg-white text-blue-600 hover:bg-blue-50">Create CV</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
