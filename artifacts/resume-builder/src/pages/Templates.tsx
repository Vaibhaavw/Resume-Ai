import { useListTemplates } from "@workspace/api-client-react";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { cn, getTierColor } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Lock, Sparkles, CheckCircle } from "lucide-react";

const templatePreviews: Record<string, { bg: string; accent: string }> = {
  "Professional Classic": { bg: "#0F172A", accent: "#3B82F6" },
  "Modern Minimal": { bg: "#F8FAFC", accent: "#3B82F6" },
  "Executive Bold": { bg: "#111827", accent: "#3B82F6" },
  "Creative Flow": { bg: "#7C3AED", accent: "#F59E0B" },
  "Tech Focused": { bg: "#1E293B", accent: "#10B981" },
  "Healthcare Pro": { bg: "#0369A1", accent: "#34D399" },
  "Finance Elite": { bg: "#1C1917", accent: "#D97706" },
  "Academic Scholar": { bg: "#1E3A5F", accent: "#6366F1" },
};

function TemplateThumbnail({ name, tier, locked }: { name: string; tier: string; locked: boolean }) {
  const preview = templatePreviews[name] || { bg: "#0F172A", accent: "#3B82F6" };
  return (
    <div className="relative aspect-[8.5/11] rounded-lg overflow-hidden border border-border bg-white shadow-sm">
      <div className="absolute inset-0 flex flex-col">
        {/* Simulated header */}
        <div
          className="px-3 py-2.5"
          style={{ backgroundColor: preview.bg }}
        >
          <div className="h-2.5 rounded w-3/4 mb-1.5" style={{ backgroundColor: `${preview.accent}40` }} />
          <div className="h-1.5 rounded w-1/2" style={{ backgroundColor: `${preview.accent}30` }} />
        </div>
        {/* Simulated body */}
        <div className="flex-1 p-3 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-1.5 rounded w-1/3 mb-1" style={{ backgroundColor: preview.accent, opacity: 0.6 }} />
              <div className="space-y-1">
                <div className="h-1 rounded bg-gray-200 w-full" />
                <div className="h-1 rounded bg-gray-200 w-5/6" />
                <div className="h-1 rounded bg-gray-200 w-4/6" />
              </div>
            </div>
          ))}
          <div className="flex gap-1.5 flex-wrap pt-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-2.5 rounded px-1.5" style={{ width: `${40 + i * 15}px`, backgroundColor: `${preview.accent}20` }} />
            ))}
          </div>
        </div>
      </div>
      {locked && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <Lock className="w-6 h-6 mx-auto mb-1" />
            <p className="text-xs font-semibold">Upgrade to unlock</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Templates() {
  const { data: templates, isLoading } = useListTemplates();
  const { user } = useAuth();

  const canAccess = (tier: string) => {
    if (tier === "free") return true;
    if (tier === "pro") return user?.tier === "pro" || user?.tier === "premium";
    if (tier === "premium") return user?.tier === "premium";
    return false;
  };

  const freeTemplates = templates?.filter((t) => t.tier === "free") || [];
  const proTemplates = templates?.filter((t) => t.tier === "pro") || [];
  const premiumTemplates = templates?.filter((t) => t.tier === "premium") || [];

  const sections = [
    { label: "Free Templates", templates: freeTemplates, tier: "free" },
    { label: "Pro Templates", templates: proTemplates, tier: "pro" },
    { label: "Premium Templates", templates: premiumTemplates, tier: "premium" },
  ];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Resume Templates</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Choose from {templates?.length || 0} professionally designed templates.
            </p>
          </div>
          {user?.tier === "free" && (
            <Link href="/subscription">
              <Button className="gap-2" data-testid="button-upgrade">
                <Sparkles className="w-4 h-4" />
                Upgrade to Pro
              </Button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[8.5/11] bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {sections.map(({ label, templates: sectionTemplates, tier }) => (
              sectionTemplates.length > 0 && (
                <section key={tier}>
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-lg font-semibold">{label}</h2>
                    <Badge className={cn("border font-medium", getTierColor(tier))}>
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </Badge>
                    {!canAccess(tier) && (
                      <span className="text-sm text-muted-foreground ml-2">
                        Requires {tier} plan
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {sectionTemplates.map((template) => {
                      const accessible = canAccess(template.tier);
                      return (
                        <div key={template.id} className="group" data-testid={`card-template-${template.id}`}>
                          <TemplateThumbnail
                            name={template.name}
                            tier={template.tier}
                            locked={!accessible}
                          />
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm">{template.name}</p>
                              {accessible && <CheckCircle className="w-4 h-4 text-green-500" />}
                            </div>
                            <p className="text-xs text-muted-foreground capitalize mb-2">{template.style} · {template.sector}</p>
                            {accessible ? (
                              <Link href={`/resumes/new?templateId=${template.id}`}>
                                <Button size="sm" variant="outline" className="w-full text-xs" data-testid={`button-use-template-${template.id}`}>
                                  Use Template
                                </Button>
                              </Link>
                            ) : (
                              <Link href="/subscription">
                                <Button size="sm" variant="outline" className="w-full text-xs gap-1" data-testid={`button-unlock-template-${template.id}`}>
                                  <Lock className="w-3 h-3" />
                                  Unlock
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
