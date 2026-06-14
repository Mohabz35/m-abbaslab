"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui-cv/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui-cv/card";
import { Input } from "@/components/ui-cv/input";
import { Label } from "@/components/ui-cv/label";
import { Textarea } from "@/components/ui-cv/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui-cv/select";
import { Progress } from "@/components/ui-cv/progress";
import { Loader2, ChevronRight, ChevronLeft, Save, Sparkles } from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface FormData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  workExperience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    currentlyWorking: boolean;
    responsibilities: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    graduationDate: string;
  }>;
  skills: Array<{
    name: string;
    proficiency: "beginner" | "intermediate" | "advanced" | "expert";
  }>;
  targetPlatform: "linkedin" | "flexjobs" | "remote_co" | "indeed" | "upwork" | "mercor" | "mindrift" | "rex" | "remo" | "micro1";
  existingCv?: string;
  jobDescription?: string;
  customInstructions?: string;
}

const INITIAL_FORM_DATA: FormData = {
  personalInfo: { name: "", email: "", phone: "", location: "", summary: "" },
  workExperience: [{ company: "", role: "", startDate: "", endDate: "", currentlyWorking: false, responsibilities: "" }],
  education: [{ school: "", degree: "", field: "", graduationDate: "" }],
  skills: [{ name: "", proficiency: "intermediate" }],
  targetPlatform: "linkedin",
  existingCv: "",
  jobDescription: "",
  customInstructions: "",
};

export default function CVBuilderPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"" | "saved" | "error">("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Load email & saved data
  useEffect(() => {
    const email = localStorage.getItem("cv_user_email");
    if (!email) {
      router.push("/cv-generator");
      return;
    }
    setUserEmail(email);
    // Pre-fill email in personal info
    setFormData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, email } }));

    // Load saved data
    fetch(`/api/cv/save?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(({ data }) => {
        if (data) setFormData(data as FormData);
      })
      .catch(() => {});
  }, [router]);

  // Debounced auto-save
  const saveProgress = useCallback(async () => {
    if (!userEmail) return;
    setIsSaving(true);
    try {
      await fetch("/api/cv/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, ...formData }),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [userEmail, formData]);

  useEffect(() => {
    if (!userEmail) return;
    const timer = setTimeout(saveProgress, 2500);
    return () => clearTimeout(timer);
  }, [formData, userEmail, saveProgress]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/cv/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, ...formData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      // Store result in sessionStorage and navigate to preview
      sessionStorage.setItem("cv_result", JSON.stringify(data));
      router.push(`/cv-generator/preview?id=${data.data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      if (file.type === "application/pdf") {
        const formDataPayload = new FormData();
        formDataPayload.append("file", file);
        const res = await fetch("/api/cv/parse-pdf", {
          method: "POST",
          body: formDataPayload,
        });
        const data = await res.json();
        if (res.ok && data.text) {
          setFormData(prev => ({ ...prev, existingCv: prev.existingCv ? prev.existingCv + "\n\n" + data.text : data.text }));
        } else {
          // PDF extraction failed - show helpful message instead of crash
          alert("⚠️ Could not extract text from this PDF automatically.\n\nPlease open your PDF, select all text (Ctrl+A), copy it (Ctrl+C), and paste it into the text area below.");
        }
      } else {
        const text = await file.text();
        setFormData(prev => ({ ...prev, existingCv: prev.existingCv ? prev.existingCv + "\n\n" + text : text }));
      }
    } catch (err: any) {
      alert("⚠️ Could not parse this file. Please paste the content manually into the text area below.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!userEmail) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const stepTitles = ["Personal Information", "Work Experience", "Education", "Skills", "Target Platform", "Context & Job", "Review & Generate"];
  const stepDescriptions = [
    "Tell us about yourself",
    "Share your professional experience",
    "Add your educational background",
    "List your key skills",
    "Choose where you'll apply",
    "Job description & existing CV",
    "Add any special instructions and generate",
  ];

  const progressPercentage = (currentStep / 7) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <button onClick={() => router.push("/cv-generator")} className="text-slate-400 hover:text-white text-sm flex items-center gap-1">
                ← Back to Home
              </button>
              <button onClick={() => router.push("/cv-generator/dashboard")} className="text-slate-400 hover:text-white text-sm flex items-center gap-1">
                Job Tracker
              </button>
            </div>
            <h1 className="text-3xl font-bold text-white">Create Your CV</h1>
            <p className="text-slate-400">Step {currentStep} of 7</p>
          </div>
          <div className="flex items-center gap-3">
            {saveStatus === "saved" && <span className="text-green-400 text-sm flex items-center gap-1"><Save className="h-3 w-3" />Saved</span>}
            {isSaving && <span className="text-slate-400 text-sm animate-pulse">Saving...</span>}
            <span className="text-slate-400 text-sm">{userEmail}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progressPercentage} className="h-2" />
          <div className="mt-3 flex justify-between text-sm text-slate-400">
            <span className="font-medium text-blue-400">{stepTitles[currentStep - 1]}</span>
            <span>{stepDescriptions[currentStep - 1]}</span>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <button
              key={step}
              onClick={() => setCurrentStep(step as Step)}
              className={`flex-1 h-1.5 rounded-full transition-all ${step <= currentStep ? "bg-blue-500" : "bg-slate-700"}`}
            />
          ))}
        </div>

        {/* Form Card */}
        <Card className="shadow-2xl border-slate-700/50">
          <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-xl border-b border-slate-700">
            <CardTitle className="text-xl text-white">{stepTitles[currentStep - 1]}</CardTitle>
            <CardDescription className="text-slate-400">{stepDescriptions[currentStep - 1]}</CardDescription>
          </CardHeader>

          <CardContent className="pt-8 space-y-6">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { id: "name", label: "Full Name *", placeholder: "John Doe", field: "name" },
                    { id: "email", label: "Email *", placeholder: "john@example.com", field: "email", type: "email" },
                    { id: "phone", label: "Phone *", placeholder: "+234 800 000 0000", field: "phone" },
                    { id: "location", label: "Location *", placeholder: "Lagos, Nigeria", field: "location" },
                  ].map(({ id, label, placeholder, field, type = "text" }) => (
                    <div key={id}>
                      <Label htmlFor={id}>{label}</Label>
                      <Input
                        id={id}
                        type={type}
                        value={(formData.personalInfo as any)[field]}
                        onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, [field]: e.target.value } })}
                        placeholder={placeholder}
                        className="mt-2"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <Label htmlFor="summary">Professional Summary *</Label>
                  <Textarea
                    id="summary"
                    value={formData.personalInfo.summary}
                    onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, summary: e.target.value } })}
                    placeholder="Brief overview of your professional background and goals..."
                    rows={5}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Work Experience */}
            {currentStep === 2 && (
              <div className="space-y-5">
                {formData.workExperience.map((job, idx) => (
                  <div key={idx} className="p-5 border border-slate-600/50 rounded-xl bg-slate-800/50 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-blue-400">Position {idx + 1}</h3>
                      {formData.workExperience.length > 1 && (
                        <button
                          onClick={() => setFormData({ ...formData, workExperience: formData.workExperience.filter((_, i) => i !== idx) })}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Company *</Label>
                        <Input value={job.company} onChange={e => { const u = [...formData.workExperience]; u[idx].company = e.target.value; setFormData({ ...formData, workExperience: u }); }} placeholder="Company name" className="mt-2" />
                      </div>
                      <div>
                        <Label>Job Title *</Label>
                        <Input value={job.role} onChange={e => { const u = [...formData.workExperience]; u[idx].role = e.target.value; setFormData({ ...formData, workExperience: u }); }} placeholder="e.g., Senior Developer" className="mt-2" />
                      </div>
                      <div>
                        <Label>Start Date *</Label>
                        <Input type="month" value={job.startDate} onChange={e => { const u = [...formData.workExperience]; u[idx].startDate = e.target.value; setFormData({ ...formData, workExperience: u }); }} className="mt-2" />
                      </div>
                      <div>
                        <Label>End Date {job.currentlyWorking && "(Current)"}</Label>
                        <Input type="month" value={job.endDate || ""} onChange={e => { const u = [...formData.workExperience]; u[idx].endDate = e.target.value; setFormData({ ...formData, workExperience: u }); }} disabled={job.currentlyWorking} className="mt-2" />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-sm">
                      <input type="checkbox" checked={job.currentlyWorking} onChange={e => { const u = [...formData.workExperience]; u[idx].currentlyWorking = e.target.checked; if (e.target.checked) u[idx].endDate = ""; setFormData({ ...formData, workExperience: u }); }} className="rounded border-slate-600 bg-slate-800" />
                      I currently work here
                    </label>
                    <div>
                      <Label>Key Responsibilities & Achievements *</Label>
                      <Textarea value={job.responsibilities} onChange={e => { const u = [...formData.workExperience]; u[idx].responsibilities = e.target.value; setFormData({ ...formData, workExperience: u }); }} placeholder="Describe your key responsibilities and achievements..." rows={4} className="mt-2" />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={() => setFormData({ ...formData, workExperience: [...formData.workExperience, { company: "", role: "", startDate: "", endDate: "", currentlyWorking: false, responsibilities: "" }] })}>
                  + Add Another Position
                </Button>
              </div>
            )}

            {/* Step 3: Education */}
            {currentStep === 3 && (
              <div className="space-y-5">
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="p-5 border border-slate-600/50 rounded-xl bg-slate-800/50 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-blue-400">Education {idx + 1}</h3>
                      {formData.education.length > 1 && (
                        <button onClick={() => setFormData({ ...formData, education: formData.education.filter((_, i) => i !== idx) })} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>School/University *</Label>
                        <Input value={edu.school} onChange={e => { const u = [...formData.education]; u[idx].school = e.target.value; setFormData({ ...formData, education: u }); }} placeholder="University name" className="mt-2" />
                      </div>
                      <div>
                        <Label>Degree *</Label>
                        <Input value={edu.degree} onChange={e => { const u = [...formData.education]; u[idx].degree = e.target.value; setFormData({ ...formData, education: u }); }} placeholder="e.g., Bachelor of Science" className="mt-2" />
                      </div>
                      <div>
                        <Label>Field of Study *</Label>
                        <Input value={edu.field} onChange={e => { const u = [...formData.education]; u[idx].field = e.target.value; setFormData({ ...formData, education: u }); }} placeholder="e.g., Computer Science" className="mt-2" />
                      </div>
                      <div>
                        <Label>Graduation Date *</Label>
                        <Input type="month" value={edu.graduationDate} onChange={e => { const u = [...formData.education]; u[idx].graduationDate = e.target.value; setFormData({ ...formData, education: u }); }} className="mt-2" />
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={() => setFormData({ ...formData, education: [...formData.education, { school: "", degree: "", field: "", graduationDate: "" }] })}>
                  + Add Another Education
                </Button>
              </div>
            )}

            {/* Step 4: Skills */}
            {currentStep === 4 && (
              <div className="space-y-4">
                {formData.skills.map((skill, idx) => (
                  <div key={idx} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label>Skill Name *</Label>
                      <Input value={skill.name} onChange={e => { const u = [...formData.skills]; u[idx].name = e.target.value; setFormData({ ...formData, skills: u }); }} placeholder="e.g., React, Project Management" className="mt-2" />
                    </div>
                    <div className="w-48">
                      <Label>Proficiency</Label>
                      <Select value={skill.proficiency} onValueChange={val => { const u = [...formData.skills]; u[idx].proficiency = val as any; setFormData({ ...formData, skills: u }); }}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.skills.length > 1 && (
                      <button onClick={() => setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== idx) })} className="text-red-400 hover:text-red-300 text-sm mb-2">×</button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={() => setFormData({ ...formData, skills: [...formData.skills, { name: "", proficiency: "intermediate" }] })}>
                  + Add Another Skill
                </Button>
              </div>
            )}

            {/* Step 5: Target Platform */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <p className="text-slate-300 text-sm">We'll tailor your CV specifically for the chosen platform.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { value: "linkedin", label: "LinkedIn", description: "Professional networking & career", icon: "💼" },
                    { value: "flexjobs", label: "FlexJobs", description: "Remote & flexible work", icon: "🏠" },
                    { value: "remote_co", label: "Remote.co", description: "Remote-first jobs", icon: "🌍" },
                    { value: "mercor", label: "Mercor AI", description: "AI vetted remote jobs", icon: "🤖" },
                    { value: "mindrift", label: "Mindrift AI", description: "AI tutoring & expert jobs", icon: "🧠" },
                    { value: "rex", label: "Rex", description: "Remote tech jobs", icon: "💻" },
                    { value: "remo", label: "Remo", description: "Distributed teams", icon: "🌐" },
                    { value: "micro1", label: "Micro1", description: "Vetted engineering jobs", icon: "⚡" },
                    { value: "indeed", label: "Indeed", description: "General job board (ATS-focused)", icon: "🔍" },
                    { value: "upwork", label: "Upwork", description: "Freelance marketplace", icon: "💰" },
                  ].map(platform => (
                    <button
                      key={platform.value}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${formData.targetPlatform === platform.value ? "border-blue-500 bg-blue-500/10" : "border-slate-600 hover:border-slate-500 bg-slate-800/50"}`}
                      onClick={() => setFormData({ ...formData, targetPlatform: platform.value as any })}
                    >
                      <div className="text-2xl mb-1">{platform.icon}</div>
                      <div className="font-semibold text-white">{platform.label}</div>
                      <div className="text-sm text-slate-400">{platform.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Context & Job */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="jobDescription">Job Description & Requirements</Label>
                  <p className="text-sm text-slate-400 mb-2 mt-1">Paste the specific job description you are applying for. The AI will tailor your CV to pass the ATS for this role.</p>
                  <Textarea
                    id="jobDescription"
                    value={formData.jobDescription || ""}
                    onChange={e => setFormData({ ...formData, jobDescription: e.target.value })}
                    placeholder="Paste job description here..."
                    rows={6}
                  />
                </div>
                
                <div>
                  <Label htmlFor="existingCv">Existing CV / Additional Info</Label>
                  <p className="text-sm text-slate-400 mb-2 mt-1">Paste your existing CV or upload a PDF/text file. The AI will extract relevant information to enhance your new CV.</p>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <Label htmlFor="file-upload" className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      {isUploading ? "Extracting..." : "Upload PDF/TXT"}
                    </Label>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.txt,.md"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    {isUploading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                  </div>

                  <Textarea
                    id="existingCv"
                    value={formData.existingCv || ""}
                    onChange={e => setFormData({ ...formData, existingCv: e.target.value })}
                    placeholder="Or paste your existing CV content here..."
                    rows={8}
                  />
                </div>
              </div>
            )}

            {/* Step 7: Review & Generate */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="instructions">Custom Instructions (Optional)</Label>
                  <p className="text-sm text-slate-400 mb-3 mt-1">Any specific guidance? E.g., "Emphasize leadership" or "Keep it under 2 pages"</p>
                  <Textarea
                    id="instructions"
                    value={formData.customInstructions}
                    onChange={e => setFormData({ ...formData, customInstructions: e.target.value })}
                    placeholder="E.g., Emphasize my experience with cloud technologies and team leadership..."
                    rows={4}
                  />
                </div>

                {/* Summary */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-3">
                  <h4 className="font-semibold text-white">Review Summary</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-400">Name:</span> <span className="text-white">{formData.personalInfo.name || "—"}</span></div>
                    <div><span className="text-slate-400">Email:</span> <span className="text-white">{formData.personalInfo.email || "—"}</span></div>
                    <div><span className="text-slate-400">Platform:</span> <span className="text-white capitalize">{formData.targetPlatform}</span></div>
                    <div><span className="text-slate-400">Targeting JD:</span> <span className="text-white">{formData.jobDescription ? "Yes" : "No"}</span></div>
                    <div><span className="text-slate-400">Existing CV:</span> <span className="text-white">{formData.existingCv ? "Provided" : "No"}</span></div>
                    <div><span className="text-slate-400">Positions:</span> <span className="text-white">{formData.workExperience.length}</span></div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5">
                  <h4 className="font-semibold text-blue-300 mb-2">✨ What happens next?</h4>
                  <ul className="text-sm text-blue-200 space-y-1">
                    <li>✓ AI generates 3 tailored CV variants</li>
                    <li>✓ Interview preparation questions are generated</li>
                    <li>✓ ATS score analysis with improvement suggestions</li>
                    <li>✓ First CV generation is completely free!</li>
                  </ul>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1) as Step)}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep === 7 ? (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isGenerating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
                ) : (
                  <><Sparkles className="h-4 w-4" />Generate Models</>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep(Math.min(7, currentStep + 1) as Step)}
                className="gap-2"
              >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
