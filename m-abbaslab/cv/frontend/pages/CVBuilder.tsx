import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

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
  targetPlatform: "linkedin" | "flexjobs" | "remote_co" | "indeed" | "upwork";
  customInstructions?: string;
}

const INITIAL_FORM_DATA: FormData = {
  personalInfo: {
    name: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
  },
  workExperience: [
    {
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      responsibilities: "",
    },
  ],
  education: [
    {
      school: "",
      degree: "",
      field: "",
      graduationDate: "",
    },
  ],
  skills: [
    {
      name: "",
      proficiency: "intermediate",
    },
  ],
  targetPlatform: "linkedin",
  customInstructions: "",
};

export default function CVBuilder() {
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isSaving, setIsSaving] = useState(false);

  const { data: savedData, isLoading: isLoadingSaved } = trpc.cvForm.retrieve.useQuery();
  const saveMutation = trpc.cvForm.save.useMutation();

  // Load saved form data on mount
  useEffect(() => {
    if (savedData) {
      setFormData(savedData as any);
    }
  }, [savedData]);

  // Auto-save form data
  const autoSaveFormData = async () => {
    setIsSaving(true);
    try {
      await saveMutation.mutateAsync(formData as any);
    } catch (error) {
      console.error("Failed to save form data:", error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      autoSaveFormData();
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData]);

  if (authLoading || isLoadingSaved) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to continue</p>
      </div>
    );
  }

  const stepTitles = [
    "Personal Information",
    "Work Experience",
    "Education",
    "Skills",
    "Target Platform",
    "Custom Instructions",
  ];

  const stepDescriptions = [
    "Tell us about yourself",
    "Share your professional experience",
    "Add your educational background",
    "List your key skills",
    "Choose where you'll apply",
    "Any special requests or guidelines",
  ];

  const progressPercentage = (currentStep / 6) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Create Your CV</h1>
          <p className="text-lg text-slate-600">Step {currentStep} of 6</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progressPercentage} className="h-2" />
          <div className="mt-4 flex justify-between text-sm text-slate-600">
            <span>
              {stepTitles[currentStep - 1]} - {stepDescriptions[currentStep - 1]}
            </span>
            {isSaving && <span className="text-green-600">Saving...</span>}
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-t-lg">
            <CardTitle className="text-2xl">{stepTitles[currentStep - 1]}</CardTitle>
            <CardDescription className="text-slate-300">{stepDescriptions[currentStep - 1]}</CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.personalInfo.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, name: e.target.value },
                        })
                      }
                      placeholder="John Doe"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.personalInfo.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, email: e.target.value },
                        })
                      }
                      placeholder="john@example.com"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.personalInfo.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, phone: e.target.value },
                        })
                      }
                      placeholder="+1 (555) 123-4567"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.personalInfo.location}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, location: e.target.value },
                        })
                      }
                      placeholder="New York, NY"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="summary">Professional Summary *</Label>
                  <Textarea
                    id="summary"
                    value={formData.personalInfo.summary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, summary: e.target.value },
                      })
                    }
                    placeholder="Brief overview of your professional background and goals..."
                    rows={5}
                    className="mt-2"
                  />
                  <p className="text-sm text-slate-500 mt-2">Minimum 10 characters</p>
                </div>
              </div>
            )}

            {/* Step 2: Work Experience */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {formData.workExperience.map((job, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-slate-900">Position {idx + 1}</h3>
                      {formData.workExperience.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              workExperience: formData.workExperience.filter((_, i) => i !== idx),
                            });
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Company *</Label>
                        <Input
                          value={job.company}
                          onChange={(e) => {
                            const updated = [...formData.workExperience];
                            updated[idx].company = e.target.value;
                            setFormData({ ...formData, workExperience: updated });
                          }}
                          placeholder="Company name"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Job Title *</Label>
                        <Input
                          value={job.role}
                          onChange={(e) => {
                            const updated = [...formData.workExperience];
                            updated[idx].role = e.target.value;
                            setFormData({ ...formData, workExperience: updated });
                          }}
                          placeholder="e.g., Senior Developer"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Start Date *</Label>
                        <Input
                          type="month"
                          value={job.startDate}
                          onChange={(e) => {
                            const updated = [...formData.workExperience];
                            updated[idx].startDate = e.target.value;
                            setFormData({ ...formData, workExperience: updated });
                          }}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>End Date {job.currentlyWorking && "(Current)"}</Label>
                        <Input
                          type="month"
                          value={job.endDate || ""}
                          onChange={(e) => {
                            const updated = [...formData.workExperience];
                            updated[idx].endDate = e.target.value;
                            setFormData({ ...formData, workExperience: updated });
                          }}
                          disabled={job.currentlyWorking}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`currently-${idx}`}
                        checked={job.currentlyWorking}
                        onChange={(e) => {
                          const updated = [...formData.workExperience];
                          updated[idx].currentlyWorking = e.target.checked;
                          if (e.target.checked) {
                            updated[idx].endDate = "";
                          }
                          setFormData({ ...formData, workExperience: updated });
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={`currently-${idx}`} className="cursor-pointer">
                        I currently work here
                      </Label>
                    </div>

                    <div>
                      <Label>Responsibilities *</Label>
                      <Textarea
                        value={job.responsibilities}
                        onChange={(e) => {
                          const updated = [...formData.workExperience];
                          updated[idx].responsibilities = e.target.value;
                          setFormData({ ...formData, workExperience: updated });
                        }}
                        placeholder="Describe your key responsibilities and achievements..."
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      workExperience: [
                        ...formData.workExperience,
                        {
                          company: "",
                          role: "",
                          startDate: "",
                          endDate: "",
                          currentlyWorking: false,
                          responsibilities: "",
                        },
                      ],
                    });
                  }}
                >
                  + Add Another Position
                </Button>
              </div>
            )}

            {/* Step 3: Education */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-slate-900">Education {idx + 1}</h3>
                      {formData.education.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              education: formData.education.filter((_, i) => i !== idx),
                            });
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>School/University *</Label>
                        <Input
                          value={edu.school}
                          onChange={(e) => {
                            const updated = [...formData.education];
                            updated[idx].school = e.target.value;
                            setFormData({ ...formData, education: updated });
                          }}
                          placeholder="University name"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Degree *</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...formData.education];
                            updated[idx].degree = e.target.value;
                            setFormData({ ...formData, education: updated });
                          }}
                          placeholder="e.g., Bachelor of Science"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Field of Study *</Label>
                        <Input
                          value={edu.field}
                          onChange={(e) => {
                            const updated = [...formData.education];
                            updated[idx].field = e.target.value;
                            setFormData({ ...formData, education: updated });
                          }}
                          placeholder="e.g., Computer Science"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Graduation Date *</Label>
                        <Input
                          type="month"
                          value={edu.graduationDate}
                          onChange={(e) => {
                            const updated = [...formData.education];
                            updated[idx].graduationDate = e.target.value;
                            setFormData({ ...formData, education: updated });
                          }}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      education: [
                        ...formData.education,
                        {
                          school: "",
                          degree: "",
                          field: "",
                          graduationDate: "",
                        },
                      ],
                    });
                  }}
                >
                  + Add Another Education
                </Button>
              </div>
            )}

            {/* Step 4: Skills */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {formData.skills.map((skill, idx) => (
                  <div key={idx} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label>Skill Name *</Label>
                      <Input
                        value={skill.name}
                        onChange={(e) => {
                          const updated = [...formData.skills];
                          updated[idx].name = e.target.value;
                          setFormData({ ...formData, skills: updated });
                        }}
                        placeholder="e.g., React, Project Management"
                        className="mt-2"
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Proficiency</Label>
                      <Select
                        value={skill.proficiency}
                        onValueChange={(value) => {
                          const updated = [...formData.skills];
                          updated[idx].proficiency = value as any;
                          setFormData({ ...formData, skills: updated });
                        }}
                      >
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            skills: formData.skills.filter((_, i) => i !== idx),
                          });
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      skills: [
                        ...formData.skills,
                        {
                          name: "",
                          proficiency: "intermediate",
                        },
                      ],
                    });
                  }}
                >
                  + Add Another Skill
                </Button>
              </div>
            )}

            {/* Step 5: Target Platform */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <Label>Where will you apply? *</Label>
                  <p className="text-sm text-slate-600 mb-4">
                    We'll tailor your CV specifically for this platform
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { value: "linkedin", label: "LinkedIn", description: "Professional networking" },
                      { value: "flexjobs", label: "FlexJobs", description: "Remote & flexible work" },
                      { value: "remote_co", label: "Remote.co", description: "Remote-first jobs" },
                      { value: "indeed", label: "Indeed", description: "General job board" },
                      { value: "upwork", label: "Upwork", description: "Freelance platform" },
                    ].map((platform) => (
                      <div
                        key={platform.value}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.targetPlatform === platform.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            targetPlatform: platform.value as any,
                          })
                        }
                      >
                        <div className="font-semibold text-slate-900">{platform.label}</div>
                        <div className="text-sm text-slate-600">{platform.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Custom Instructions */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="instructions">Custom Instructions (Optional)</Label>
                  <p className="text-sm text-slate-600 mb-4">
                    Any specific guidance for AI generation? E.g., "Emphasize leadership" or "Focus on
                    technical skills"
                  </p>
                  <Textarea
                    id="instructions"
                    value={formData.customInstructions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customInstructions: e.target.value,
                      })
                    }
                    placeholder="E.g., Emphasize my experience with cloud technologies and team leadership..."
                    rows={6}
                    className="mt-2"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ Your first CV is completely free</li>
                    <li>✓ We'll generate a tailored CV & cover letter</li>
                    <li>✓ You'll see an ATS score and suggestions</li>
                    <li>✓ Download or email your CV</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1) as Step)}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep === 6 ? (
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              Generate CV
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentStep(Math.min(6, currentStep + 1) as Step)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
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
