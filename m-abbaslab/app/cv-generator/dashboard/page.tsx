"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui-cv/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-cv/card";
import { Input } from "@/components/ui-cv/input";
import { Loader2, Plus, ArrowLeft, ExternalLink, Briefcase, FileText, Trash2, Calendar } from "lucide-react";

interface Job {
  id: string;
  company: string;
  role: string;
  platform: string;
  job_url: string;
  job_description: string;
  status: "saved" | "applied" | "interviewing" | "offered" | "rejected";
  notes: string;
  created_at: string;
}

const statusColors = {
  saved: "bg-slate-700 text-slate-300",
  applied: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  interviewing: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  offered: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function JobDashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newJob, setNewJob] = useState({ company: "", role: "", platform: "linkedin", job_url: "" });

  useEffect(() => {
    const email = localStorage.getItem("cv_user_email");
    if (!email) {
      router.push("/cv-generator");
      return;
    }
    setUserEmail(email);
    fetchJobs(email);
  }, [router]);

  const fetchJobs = async (email: string) => {
    try {
      const res = await fetch(`/api/cv/jobs?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;
    try {
      const res = await fetch("/api/cv/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, ...newJob, status: "saved" })
      });
      const data = await res.json();
      if (data.job) {
        setJobs([data.job, ...jobs]);
        setIsAdding(false);
        setNewJob({ company: "", role: "", platform: "linkedin", job_url: "" });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = async (id: string, status: Job["status"]) => {
    try {
      await fetch("/api/cv/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      setJobs(jobs.map(j => j.id === id ? { ...j, status } : j));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteJob = async (id: string) => {
    if (!confirm("Delete this job?")) return;
    try {
      await fetch("/api/cv/jobs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      setJobs(jobs.filter(j => j.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => router.push("/cv-generator")} className="text-slate-400 hover:text-white text-sm mb-2 flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to Home
            </button>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-blue-500" />
              Job Tracker
            </h1>
            <p className="text-slate-400 mt-1">Manage your applications and track your progress.</p>
          </div>
          <Button onClick={() => setIsAdding(!isAdding)} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Add Job
          </Button>
        </div>

        {isAdding && (
          <Card className="mb-8 bg-slate-800/80 border-blue-500/50 shadow-lg shadow-blue-500/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg">Add New Opportunity</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddJob} className="flex flex-col sm:flex-row gap-4">
                <Input placeholder="Company Name" required value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} className="bg-slate-900 border-slate-700 text-white" />
                <Input placeholder="Role Title" required value={newJob.role} onChange={e => setNewJob({...newJob, role: e.target.value})} className="bg-slate-900 border-slate-700 text-white" />
                <Input placeholder="Job URL (optional)" value={newJob.job_url} onChange={e => setNewJob({...newJob, job_url: e.target.value})} className="bg-slate-900 border-slate-700 text-white" />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shrink-0">Save Job</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : jobs.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="pt-12 pb-12 text-center">
              <Briefcase className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No jobs tracked yet</h3>
              <p className="text-slate-400 mb-6">Start adding jobs you want to apply for.</p>
              <Button onClick={() => setIsAdding(true)} variant="outline" className="border-slate-600 text-white">Add First Job</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map(job => (
              <Card key={job.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-500 transition-all flex flex-col">
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-white text-lg leading-tight">{job.role}</h3>
                      <p className="text-slate-400 text-sm font-medium mt-0.5">{job.company}</p>
                    </div>
                    <select
                      value={job.status}
                      onChange={(e) => updateStatus(job.id, e.target.value as any)}
                      className={`text-xs px-2.5 py-1 rounded-full border border-transparent font-medium cursor-pointer outline-none transition-colors ${statusColors[job.status]}`}
                    >
                      <option value="saved">Saved</option>
                      <option value="applied">Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offered">Offered</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-700/50">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      {job.job_url && (
                        <a href={job.job_url} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button onClick={() => router.push(`/cv-generator/builder?role=${encodeURIComponent(job.role)}&company=${encodeURIComponent(job.company)}`)} className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors" title="Generate CV for this job">
                        <FileText className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteJob(job.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
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
