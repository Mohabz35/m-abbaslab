import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Shield, TrendingUp, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

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
            {user ? (
              <>
                <span className="text-slate-300">Welcome, {user.name}</span>
                <Button onClick={() => navigate("/history")} variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                  My CVs
                </Button>
                <Button onClick={() => navigate("/builder")} className="bg-blue-600 hover:bg-blue-700">
                  Create CV
                </Button>
              </>
            ) : (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
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
          completely free, then just 50 kobo for each additional one.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          {user ? (
            <>
              <Button
                size="lg"
                onClick={() => navigate("/builder")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2"
              >
                Start Creating
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                View My CVs
              </Button>
            </>
          ) : (
            <>
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2"
              >
                <a href={getLoginUrl()}>
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                Learn More
              </Button>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
          <div>
            <div className="text-3xl font-bold text-blue-400">100%</div>
            <p className="text-slate-400 text-sm">ATS Compatible</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400">50 KES</div>
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

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">How It Works</h2>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              step: "1",
              title: "Fill Your Info",
              description: "Enter your experience, education, and skills",
            },
            {
              step: "2",
              title: "Choose Platform",
              description: "Select your target job platform",
            },
            {
              step: "3",
              title: "AI Generates",
              description: "Get a tailored, ATS-optimized CV instantly",
            },
            {
              step: "4",
              title: "Download & Apply",
              description: "Download as PDF or email to yourself",
            },
          ].map((item, idx) => (
            <div key={idx} className="relative">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-white font-semibold mb-2 text-center">{item.title}</h3>
                <p className="text-slate-400 text-sm text-center">{item.description}</p>
              </div>
              {idx < 3 && (
                <div className="hidden md:block absolute top-6 left-[60%] w-[40%] h-0.5 bg-gradient-to-r from-blue-500 to-transparent" />
              )}
            </div>
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
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Get Started</Button>
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
              <div className="text-4xl font-bold text-blue-300 mb-4">50 KES</div>
              <ul className="space-y-2 text-blue-100 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Platform-specific tailoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  AI humanization included
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Email delivery option
                </li>
              </ul>
              <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">Create CV</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Land Your Dream Job?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Create your first CV free today and start applying with confidence.
          </p>
          {user ? (
            <Button
              size="lg"
              onClick={() => navigate("/builder")}
              className="bg-white text-blue-600 hover:bg-blue-50 gap-2"
            >
              Create Your CV Now
              <ArrowRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              size="lg"
              asChild
              className="bg-white text-blue-600 hover:bg-blue-50 gap-2"
            >
              <a href={getLoginUrl()}>
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    How It Works
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2026 CV Generator Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
