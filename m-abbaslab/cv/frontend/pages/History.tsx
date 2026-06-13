import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Download, Eye, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";

export default function History() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const historyQuery = trpc.delivery.getCVHistory.useQuery();

  if (!user) {
    navigate("/");
    return null;
  }

  const cvs = historyQuery.data || [];

  const getStatusBadge = (status: string, isPaid: boolean) => {
    if (!isPaid) {
      return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">Free</Badge>;
    }
    switch (status) {
      case "downloaded":
        return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Downloaded</Badge>;
      case "emailed":
        return <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">Emailed</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-700 border-slate-500/30">Generated</Badge>;
    }
  };

  const getPlatformLabel = (platform: string) => {
    const labels: Record<string, string> = {
      linkedin: "LinkedIn",
      flexjobs: "FlexJobs",
      remote_co: "Remote.co",
      indeed: "Indeed",
      upwork: "Upwork",
    };
    return labels[platform] || platform;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My CVs</h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1">View and manage your generated CVs</p>
            </div>
            <Button onClick={() => navigate("/builder")} className="bg-blue-600 hover:bg-blue-700">
              Create New CV
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {historyQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : cvs.length === 0 ? (
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="pt-12 text-center">
              <div className="text-slate-400 dark:text-slate-500 mb-4">
                <Eye className="h-12 w-12 mx-auto opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No CVs yet</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Create your first CV to get started. Your first CV is completely free!
              </p>
              <Button onClick={() => navigate("/builder")} className="bg-blue-600 hover:bg-blue-700">
                Create Your First CV
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">CV History</CardTitle>
              <CardDescription>You have {cvs.length} generated CV{cvs.length !== 1 ? "s" : ""}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-700">
                      <TableHead className="text-slate-600 dark:text-slate-300">Platform</TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-300">Created</TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-300">ATS Score</TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cvs.map((cv) => (
                      <TableRow key={cv.id} className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <TableCell className="font-medium text-slate-900 dark:text-white">
                          {getPlatformLabel(cv.targetPlatform)}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-300">
                          {format(new Date(cv.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-slate-900 dark:text-white font-semibold">
                          {cv.atsScore ? `${cv.atsScore}/100` : "—"}
                        </TableCell>
                        <TableCell>{getStatusBadge(cv.status || "", cv.isPaid || false)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/preview/${cv.id}`)}
                              className="gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => {
                                toast.info("Download feature coming soon");
                              }}
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
