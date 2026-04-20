import { Link } from "wouter";
import { useListResumes, useDeleteResume, getListResumesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, getAtsScoreBgColor, formatDate } from "@/lib/utils";
import { Plus, FileText, Trash2, Edit, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Resumes() {
  const { data: resumes, isLoading } = useListResumes();
  const deleteMutation = useDeleteResume();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListResumesQueryKey() });
        toast({ title: "Resume deleted" });
      },
      onError: () => {
        toast({ title: "Failed to delete resume", variant: "destructive" });
      },
    });
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Resumes</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {resumes?.length || 0} resume{resumes?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/templates">
            <Button data-testid="button-new-resume">
              <Plus className="w-4 h-4 mr-2" />
              New Resume
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl h-48 animate-pulse" />
            ))}
          </div>
        ) : (resumes || []).length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No resumes yet</h2>
            <p className="text-muted-foreground mb-6">Create your first ATS-optimized resume to start your job search.</p>
            <Link href="/templates">
              <Button data-testid="button-create-first">Create Your First Resume</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(resumes || []).map((resume) => (
              <div
                key={resume.id}
                className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow"
                data-testid={`card-resume-${resume.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{resume.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <Badge variant="outline" className="text-xs capitalize py-0">{resume.sector}</Badge>
                        <Badge variant={resume.status === "complete" ? "default" : "secondary"} className="text-xs py-0">
                          {resume.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {resume.atsScore != null ? (
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      <span className={cn("text-sm font-bold px-2 py-0.5 rounded-full", getAtsScoreBgColor(resume.atsScore))}>
                        {resume.atsScore}% ATS
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not scored yet</span>
                  )}
                  <span className="text-xs text-muted-foreground">{formatDate(resume.updatedAt)}</span>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <Link href={`/resumes/${resume.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2" data-testid={`button-edit-resume-${resume.id}`}>
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(resume.id, resume.title)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-resume-${resume.id}`}
                    className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
