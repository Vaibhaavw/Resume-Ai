import { useEffect, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";
import {
  useGetResume,
  useCreateResume,
  useUpdateResume,
  useCalculateAtsScore,
  useEnhanceResume,
  useGetSectorKeywords,
  getGetResumeQueryKey,
  getGetSectorKeywordsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import ResumePreview from "@/components/ResumePreview";
import { FloatingToolbar } from "@/components/canvas/FloatingToolbar";
import { TemplateGallery } from "@/components/TemplateGallery";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { cn, getAtsScoreBgColor } from "@/lib/utils";
import { useResumeStore } from "@/store/useResumeStore";
import { MOCK_USER } from "@/components/mock-data";
import {
  Save, Download, Sparkles, BarChart3, ChevronLeft, AlertCircle,
  FileText, CheckCircle2
} from "lucide-react";

const SECTORS = ["tech", "healthcare", "finance", "marketing", "education", "legal", "engineering", "sales"];

function buildResumeText(data: ReturnType<typeof useResumeStore.getState>["data"], title: string): string {
  const pi = data.personalInfo;
  const lines: string[] = [
    `${pi.firstName} ${pi.lastName}`,
    `${pi.email} | ${pi.countryCode} ${pi.phone} | ${pi.location}`,
    ...(pi.linkedIn ? [pi.linkedIn] : []),
    ...(pi.websites || []).filter(Boolean),
    "",
    "SUMMARY",
    pi.summary,
    "",
    "EXPERIENCE",
    ...(data.experience || []).flatMap((exp) => [
      `${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate || "Present"})`,
      ...(exp.bullets || []),
    ]),
    "",
    "EDUCATION",
    ...(data.education || []).map((edu) => `${edu.degree} in ${edu.field}, ${edu.institution}`),
    "",
    "SKILLS",
    (data.skills || []).join(", "),
    "",
    "CERTIFICATIONS",
    ...(data.certifications || []).map((c) => `${c.name} - ${c.issuer} (${c.date})`),
  ];
  return lines.join("\n");
}

export default function ResumeEditor() {
  const [, params] = useRoute("/resumes/:id");
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLDivElement>(null);

  // ── Store ─────────────────────────────────────────────────────────────────
  const {
    resumeId, resumeTitle, sector, templateId, data, validationErrors, isDirty, atsResult,
    setResumeId, setResumeTitle, setSector, setTemplateId, setAtsResult,
    loadResume, validate,
    updatePersonalInfo,
    addExperience, removeExperience, updateExperience, updateExperienceBullet, addExperienceBullet, removeExperienceBullet,
    addEducation, removeEducation, updateEducation,
    addProject, removeProject, updateProject, updateProjectBullet, addProjectBullet, removeProjectBullet,
    addSkill, removeSkill,
    addCertification, removeCertification, updateCertification,
  } = useResumeStore();

  // Parse IDs from URL
  const urlResumeId = params?.id && params.id !== "new" ? parseInt(params.id) : null;
  const searchParams = new URLSearchParams(window.location.search);
  const urlTemplateId = searchParams.get("templateId");

  // ── API hooks ─────────────────────────────────────────────────────────────
  const { data: existingResume } = useGetResume(urlResumeId!, {
    query: { enabled: urlResumeId !== null, queryKey: getGetResumeQueryKey(urlResumeId!) },
  });
  const createMutation = useCreateResume();
  const updateMutation = useUpdateResume();
  const scoreMutation = useCalculateAtsScore();
  const enhanceMutation = useEnhanceResume();
  const { data: keywordsData } = useGetSectorKeywords(sector, {
    query: { enabled: !!sector, queryKey: getGetSectorKeywordsQueryKey(sector) },
  });

  const suggestions = keywordsData?.keywords ?? [];

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (urlTemplateId) setTemplateId(parseInt(urlTemplateId));
  }, [urlTemplateId]);

  useEffect(() => {
    if (existingResume) {
      const d = existingResume.data as any;
      loadResume(
        existingResume.id,
        existingResume.title,
        existingResume.sector || "tech",
        existingResume.templateId || 1,
        {
          personalInfo: d?.personalInfo,
          experience: d?.experience,
          education: d?.education,
          projects: d?.projects,
          skills: d?.skills,
          certifications: d?.certifications,
        }
      );
    } else if (urlResumeId === null && !resumeId && !isDirty) {
      // Pre-fill with sample data for new resumes
      loadResume(
        null,
        "My New Resume",
        sector || "tech",
        urlTemplateId ? parseInt(urlTemplateId) : (templateId || 1),
        MOCK_USER as any
      );
    }
  }, [existingResume, urlResumeId, urlTemplateId]);

  // ── Handlers object for ResumePreview ────────────────────────────────────
  const handlers = {
    updatePersonalInfo,
    addExperience, removeExperience, updateExperience, updateExperienceBullet, addExperienceBullet, removeExperienceBullet,
    addEducation, removeEducation, updateEducation,
    addProject, removeProject, updateProject, updateProjectBullet, addProjectBullet, removeProjectBullet,
    addSkill, removeSkill,
    addCertification, removeCertification, updateCertification,
  };

  // ── AI Enhance ────────────────────────────────────────────────────────────
  const [enhancing, setEnhancing] = useState(false);
  const handleFloatingEnhance = (selectedText: string) => {
    if (!selectedText || enhancing) return;
    setEnhancing(true);
    enhanceMutation.mutate({ data: { field: "bullets", content: selectedText, sector } } as any, {
      onSuccess: (d: any) => {
        if (d?.enhanced) {
          document.execCommand("insertText", false, d.enhanced);
        }
        toast({ title: "Text enhanced with AI" });
      },
      onError: () => toast({ title: "Enhancement failed", variant: "destructive" }),
      onSettled: () => setEnhancing(false),
    });
  };

  const handleEnhanceSummary = () => {
    if (!data.personalInfo.summary) {
      toast({ title: "Write a summary first" });
      return;
    }
    enhanceMutation.mutate({ data: { field: "summary", content: data.personalInfo.summary, sector } } as any, {
      onSuccess: (d: any) => {
        if (d?.enhanced) updatePersonalInfo("summary", d.enhanced);
        toast({ title: "Summary enhanced" });
      },
      onError: () => toast({ title: "Enhancement failed", variant: "destructive" }),
    });
  };

  // ── ATS Score ─────────────────────────────────────────────────────────────
  const handleAtsScore = () => {
    const text = buildResumeText(data, resumeTitle);
    scoreMutation.mutate(
      { data: { resumeText: text, sector, resumeId: resumeId || undefined } },
      { onSuccess: (d) => setAtsResult(d as any) }
    );
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    const isValid = validate();
    const errorCount = Object.keys(validationErrors).length;

    if (!isValid) {
      toast({
        title: `${errorCount} validation issue${errorCount > 1 ? "s" : ""} found`,
        description: "Hover over highlighted fields on the canvas to see what's needed.",
        variant: "destructive",
      });
      // Don't block save for minor issues — save anyway with a warning
    }

    const resumeData = {
      personalInfo: data.personalInfo,
      education: data.education,
      experience: data.experience,
      skills: data.skills,
      certifications: data.certifications,
      projects: data.projects,
    };

    if (resumeId) {
      updateMutation.mutate(
        { id: resumeId, data: { title: resumeTitle, sector, data: resumeData, templateId } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetResumeQueryKey(resumeId) });
            toast({ title: "Resume saved ✓" });
          },
          onError: () => toast({ title: "Failed to save", variant: "destructive" }),
        }
      );
    } else {
      createMutation.mutate(
        { data: { title: resumeTitle, sector, data: resumeData, templateId } },
        {
          onSuccess: (r) => {
            setResumeId(r.id);
            toast({ title: "Resume created ✓" });
            setLocation(`/resumes/${r.id}`);
          },
          onError: () => toast({ title: "Failed to create", variant: "destructive" }),
        }
      );
    }
  };

  // ── PDF Export ────────────────────────────────────────────────────────────
  const handleExportPDF = () => window.print();

  const handleExportWord = () => {
    const text = buildResumeText(data, resumeTitle);
    const blob = new Blob([text], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resumeTitle || "resume"}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const errorCount = Object.keys(validationErrors).length;

  // The preview data must include countryCode for phone rendering
  const previewData = {
    ...data,
    personalInfo: {
      ...data.personalInfo,
    },
  };

  return (
    <AppLayout>
      {/* Floating selection toolbar */}
      <FloatingToolbar
        onEnhance={handleFloatingEnhance}
        enhancing={enhancing}
        containerRef={canvasRef as any}
      />

      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Top Ribbon Toolbar ────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-card no-print flex-wrap shrink-0 shadow-sm">
          {/* Back */}
          <Button variant="ghost" size="sm" onClick={() => setLocation("/resumes")} className="gap-1.5 text-xs shrink-0">
            <ChevronLeft className="w-3.5 h-3.5" />
            Resumes
          </Button>

          <div className="w-px h-5 bg-border mx-1 shrink-0" />

          {/* Resume title inline edit */}
          <div className="flex-1 min-w-0 max-w-[200px]">
            <input
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              className="w-full font-semibold bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/30 rounded px-1"
              placeholder="Resume title…"
            />
          </div>

          {/* Sector */}
          <Select value={sector} onValueChange={setSector}>
            <SelectTrigger className="h-8 text-xs w-28 capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((s) => (
                <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1.5 ml-auto flex-wrap">
            {/* Validation status */}
            {errorCount > 0 ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                <AlertCircle className="w-3 h-3" />
                {errorCount} issue{errorCount > 1 ? "s" : ""}
              </span>
            ) : isDirty ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                <CheckCircle2 className="w-3 h-3" />
                Looking good
              </span>
            ) : null}

            {/* ATS Score */}
            {atsResult && (
              <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", getAtsScoreBgColor(atsResult.score))}>
                {atsResult.score}% ATS
              </span>
            )}

            <Button type="button" size="sm" variant="outline" onClick={handleAtsScore} disabled={scoreMutation.isPending} className="gap-1.5 text-xs h-8">
              <BarChart3 className="w-3.5 h-3.5" />
              {scoreMutation.isPending ? "Scoring…" : "ATS Score"}
            </Button>

            <Button type="button" size="sm" variant="outline" onClick={handleEnhanceSummary} disabled={enhanceMutation.isPending} className="gap-1.5 text-xs h-8">
              <Sparkles className="w-3.5 h-3.5" />
              AI Enhance
            </Button>

            <TemplateGallery selectedId={templateId} onSelect={setTemplateId} userTier={user?.tier || "free"} />

            <Button type="button" size="sm" variant="outline" onClick={handleExportPDF} className="gap-1.5 text-xs h-8">
              <Download className="w-3.5 h-3.5" />
              PDF
            </Button>

            <Button type="button" size="sm" variant="outline" onClick={handleExportWord} className="gap-1.5 text-xs h-8">
              <FileText className="w-3.5 h-3.5" />
              Word
            </Button>

            <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5 text-xs h-8">
              <Save className="w-3.5 h-3.5" />
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        {/* ── WYSIWYG Canvas Area ───────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto bg-[#E8EAED] flex flex-col items-center py-8 px-4 print:bg-white print:p-0 print:block"
          style={{
            backgroundImage: "radial-gradient(circle, #d0d3d8 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {/* A4 paper */}
          <div
            ref={canvasRef}
            className={cn(
              "w-full bg-white shadow-2xl print:shadow-none print:m-0 print:w-full",
              "transition-all duration-200 relative"
            )}
            style={{
              maxWidth: "794px",           // A4 at 96dpi
              minHeight: "1123px",          // A4 height
              boxShadow: "0 4px 40px rgba(0,0,0,0.18), 0 1px 6px rgba(0,0,0,0.10)",
            }}
          >
            {/* Edit mode banner */}
            <div className="no-print absolute -top-7 left-0 right-0 flex justify-center pointer-events-none">
              <span className="text-[10px] font-semibold text-slate-400 bg-white/80 rounded px-2 py-0.5 border border-slate-200">
                Click any field to edit · Hover sections to add/remove · Select text for formatting
              </span>
            </div>

            <ResumePreview
              data={previewData}
              templateId={templateId}
              editable={true}
              handlers={handlers}
              errors={validationErrors}
              suggestions={suggestions}
            />
          </div>

          {/* Bottom padding */}
          <div className="h-16 no-print" />
        </div>
      </div>
    </AppLayout>
  );
}
