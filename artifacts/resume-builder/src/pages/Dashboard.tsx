import { Link } from "wouter";
import { useGetDashboardSummary, useGetRecentActivity, useListResumes, getGetDashboardSummaryQueryKey, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, getAtsScoreBgColor, formatDate } from "@/lib/utils";
import { Plus, FileText, Target, TrendingUp, CheckCircle, Clock, BarChart3 } from "lucide-react";

function StatCard({ label, value, sub, icon, color }: { label: string; value: string | number; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

const actionIcons: Record<string, React.ReactNode> = {
  created: <Plus className="w-3.5 h-3.5 text-green-600" />,
  updated: <FileText className="w-3.5 h-3.5 text-blue-600" />,
  scored: <BarChart3 className="w-3.5 h-3.5 text-purple-600" />,
  exported: <CheckCircle className="w-3.5 h-3.5 text-amber-600" />,
};

const actionLabels: Record<string, string> = {
  created: "Created",
  updated: "Updated",
  scored: "ATS Scored",
  exported: "Exported",
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity({ query: { queryKey: getGetRecentActivityQueryKey() } });
  const { data: resumes } = useListResumes();

  const recentResumes = (resumes || []).slice(0, 3);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {user?.sector ? `Building resumes for the ${user.sector} sector` : "Ready to build your career?"}
            </p>
          </div>
          <Link href="/resumes/new">
            <Button data-testid="button-new-resume">
              <Plus className="w-4 h-4 mr-2" />
              New Resume
            </Button>
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Resumes"
            value={summaryLoading ? "—" : (summary?.totalResumes ?? 0)}
            icon={<FileText className="w-6 h-6 text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            label="Avg ATS Score"
            value={summaryLoading ? "—" : (summary?.averageAtsScore != null ? `${summary.averageAtsScore}%` : "N/A")}
            sub={summary?.bestAtsScore != null ? `Best: ${summary.bestAtsScore}%` : undefined}
            icon={<Target className="w-6 h-6 text-green-600" />}
            color="bg-green-50"
          />
          <StatCard
            label="Completed"
            value={summaryLoading ? "—" : (summary?.completedResumes ?? 0)}
            icon={<CheckCircle className="w-6 h-6 text-purple-600" />}
            color="bg-purple-50"
          />
          <StatCard
            label="Drafts"
            value={summaryLoading ? "—" : (summary?.draftResumes ?? 0)}
            icon={<Clock className="w-6 h-6 text-amber-600" />}
            color="bg-amber-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent resumes */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Recent Resumes</h2>
              <Link href="/resumes" className="text-sm text-primary hover:underline">View all</Link>
            </div>

            {recentResumes.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-10 text-center">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-2">No resumes yet</h3>
                <p className="text-muted-foreground text-sm mb-4">Create your first ATS-optimized resume to get started.</p>
                <Link href="/resumes/new">
                  <Button size="sm" data-testid="button-create-first-resume">Create Resume</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentResumes.map((resume) => (
                  <Link key={resume.id} href={`/resumes/${resume.id}`}>
                    <div
                      className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-shadow cursor-pointer"
                      data-testid={`card-resume-${resume.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{resume.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-xs capitalize py-0">{resume.sector}</Badge>
                            <span className="text-xs text-muted-foreground">{formatDate(resume.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {resume.atsScore != null && (
                          <span className={cn("text-sm font-bold px-2 py-0.5 rounded-full", getAtsScoreBgColor(resume.atsScore))}>
                            {resume.atsScore}%
                          </span>
                        )}
                        <Badge variant={resume.status === "complete" ? "default" : "secondary"} className="text-xs">
                          {resume.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div>
            <h2 className="font-semibold mb-4">Recent Activity</h2>
            {activityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card border border-border rounded-lg h-16 animate-pulse" />
                ))}
              </div>
            ) : (activity || []).length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
                No activity yet. Create or update a resume to see your history.
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
                {(activity || []).slice(0, 8).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3" data-testid={`activity-item-${item.id}`}>
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {actionIcons[item.action] || <FileText className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.resumeTitle}</p>
                      <p className="text-xs text-muted-foreground">{actionLabels[item.action] || item.action}</p>
                    </div>
                    {item.atsScore != null && (
                      <span className={cn("text-xs font-bold", getAtsScoreBgColor(item.atsScore), "px-1.5 py-0.5 rounded")}>
                        {item.atsScore}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ATS quick tip */}
            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Pro Tip</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Resumes with 75%+ ATS scores are 3x more likely to get an interview. Run the ATS checker on your resume to see how to improve.
              </p>
              <Link href="/ats-checker">
                <Button size="sm" variant="outline" className="mt-3 text-xs h-7" data-testid="button-ats-tip">
                  Check My Resume
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
