import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { Streamdown } from "streamdown";

interface ATSCheck {
  name: string;
  points: number;
  status: "passed" | "failed";
  description: string;
}

interface CVPreviewProps {
  cv: string;
  coverLetter?: string;
  atsScore?: number;
  atsChecks?: ATSCheck[];
  suggestedImprovements?: string[];
  isLoading?: boolean;
}

export default function CVPreview({
  cv,
  coverLetter,
  atsScore = 0,
  atsChecks = [],
  suggestedImprovements = [],
  isLoading = false,
}: CVPreviewProps) {
  const passedChecks = atsChecks.filter((c) => c.status === "passed").length;
  const totalChecks = atsChecks.length;
  const scorePercentage = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* CV Preview */}
      <div className="lg:col-span-2 space-y-6">
        {/* CV Document */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-t-lg">
            <CardTitle>Your CV Preview</CardTitle>
            <CardDescription className="text-slate-300">
              This is how your CV will appear to employers
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-slate-400">Generating your CV...</div>
              </div>
            ) : cv ? (
              <div className="prose prose-sm max-w-none bg-white p-8 rounded-lg border border-slate-200 min-h-96">
                <Streamdown>{cv}</Streamdown>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                Your CV will appear here after generation
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cover Letter */}
        {coverLetter && (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-lg">
              <CardTitle>Cover Letter</CardTitle>
              <CardDescription className="text-blue-300">
                Tailored for your target platform
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="prose prose-sm max-w-none bg-white p-8 rounded-lg border border-slate-200 min-h-48">
                <Streamdown>{coverLetter}</Streamdown>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ATS Score & Suggestions Sidebar */}
      <div className="space-y-6">
        {/* ATS Score Card */}
        <Card className="shadow-lg border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardTitle className="text-center">ATS Score</CardTitle>
          </CardHeader>
          <CardContent className="pt-8 text-center">
            <div className="mb-4">
              <div className="text-5xl font-bold text-blue-600">{atsScore}</div>
              <div className="text-sm text-slate-600 mt-2">
                {passedChecks} of {totalChecks} checks passed
              </div>
            </div>

            {/* Score Visualization */}
            <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${scorePercentage}%` }}
              />
            </div>

            {/* Score Interpretation */}
            <div className="text-sm font-semibold mb-4">
              {scorePercentage >= 80 ? (
                <span className="text-green-600">Excellent! Ready to apply.</span>
              ) : scorePercentage >= 60 ? (
                <span className="text-blue-600">Good. Consider improvements below.</span>
              ) : (
                <span className="text-orange-600">Needs work. Review suggestions.</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ATS Checks */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              ATS Checks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {atsChecks.length > 0 ? (
              atsChecks.map((check, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                  {check.status === "passed" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900">{check.name}</div>
                    <div className="text-xs text-slate-600 mt-1">{check.description}</div>
                    <Badge variant={check.status === "passed" ? "default" : "secondary"} className="mt-2">
                      {check.points} points
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-400">ATS checks will appear after generation</div>
            )}
          </CardContent>
        </Card>

        {/* Suggested Improvements */}
        {suggestedImprovements.length > 0 && (
          <Card className="shadow-lg border-2 border-amber-200">
            <CardHeader className="bg-gradient-to-br from-amber-50 to-amber-100">
              <CardTitle className="text-lg">Suggested Improvements</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {suggestedImprovements.map((suggestion, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <span className="text-amber-600 font-bold">•</span>
                    <span className="text-slate-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Skills to Add */}
        <Card className="shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg">Skills to Consider Adding</CardTitle>
            <CardDescription>Based on your target platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                "Project Management",
                "Data Analysis",
                "Communication",
                "Problem Solving",
                "Teamwork",
                "Leadership",
              ].map((skill) => (
                <Badge key={skill} variant="outline" className="cursor-pointer hover:bg-purple-100">
                  + {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
