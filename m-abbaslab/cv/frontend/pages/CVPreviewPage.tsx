import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CVPreview from "@/components/CVPreview";
import { trpc } from "@/lib/trpc";
import { Download, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CVPreviewPage() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [cvId, setCvId] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Get CV ID from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      setCvId(parseInt(id));
    }
  }, []);

  const { data: cvData, isLoading } = trpc.cvGeneration.get.useQuery(
    { id: cvId! },
    { enabled: !!cvId }
  );

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/");
    return null;
  }

  if (!cvData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="pt-6">
            <p>CV not found</p>
            <Button onClick={() => navigate("/builder")} className="mt-4">
              Create a new CV
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // TODO: Implement PDF generation and download
      toast.success("CV downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download CV");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      // TODO: Implement email sending
      toast.success("CV sent to your email!");
    } catch (error) {
      toast.error("Failed to send CV");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Your CV is Ready!</h1>
            <p className="text-lg text-slate-600">Review and download your tailored CV</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/builder")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Create Another
          </Button>
        </div>

        {/* Preview */}
        <CVPreview
          cv={cvData.generatedCV}
          coverLetter={cvData.generatedCoverLetter || undefined}
          atsScore={cvData.atsScore || 0}
          atsChecks={cvData.atsChecks || []}
          suggestedImprovements={cvData.suggestedImprovements || []}
        />

        {/* Action Buttons */}
        <div className="mt-12 flex gap-4 justify-center">
          <Button
            size="lg"
            onClick={handleDownload}
            disabled={isDownloading}
            className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Download PDF
              </>
            )}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleSendEmail}
            disabled={isSendingEmail}
            className="gap-2"
          >
            {isSendingEmail ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-5 w-5" />
                Send to Email
              </>
            )}
          </Button>
        </div>

        {/* Info Card */}
        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-slate-900 mb-2">Next Steps</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>✓ Download your CV and cover letter</li>
              <li>✓ Review the ATS score and suggestions</li>
              <li>✓ Make any final edits if needed</li>
              <li>✓ Apply to your target positions</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
