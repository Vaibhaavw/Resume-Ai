import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetResume,
  useCreateResume,
  useUpdateResume,
  useCalculateAtsScore,
  useEnhanceResume,
  useListTemplates,
  getGetResumeQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import ResumePreview from "@/components/ResumePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { cn, getAtsScoreColor, getAtsScoreBgColor } from "@/lib/utils";
import { Plus, Trash2, Save, Download, Sparkles, BarChart3, Eye, ChevronLeft } from "lucide-react";

const SECTORS = ["tech", "healthcare", "finance", "marketing", "education", "legal", "engineering", "sales"];

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  sector: z.string(),
  personalInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string(),
    location: z.string(),
    linkedIn: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    summary: z.string(),
  }),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    startDate: z.string(),
    endDate: z.string().optional().nullable(),
    gpa: z.string().optional().nullable(),
  })),
  experience: z.array(z.object({
    company: z.string(),
    title: z.string(),
    location: z.string(),
    startDate: z.string(),
    endDate: z.string().optional().nullable(),
    bullets: z.array(z.string()),
  })),
  skills: z.array(z.string()),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string(),
  })),
});

type FormData = z.infer<typeof schema>;

const defaultFormValues: FormData = {
  title: "My Resume",
  sector: "tech",
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    linkedIn: "",
    website: "",
    summary: "",
  },
  education: [],
  experience: [],
  skills: [],
  certifications: [],
};

function SectionHeader({ title, onAdd, addLabel }: { title: string; onAdd?: () => void; addLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-sm text-foreground">{title}</h3>
      {onAdd && (
        <Button type="button" size="sm" variant="outline" onClick={onAdd} className="h-7 text-xs gap-1">
          <Plus className="w-3 h-3" />
          {addLabel || "Add"}
        </Button>
      )}
    </div>
  );
}

export default function ResumeEditor() {
  const [, params] = useRoute("/resumes/:id");
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [previewVisible, setPreviewVisible] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState(1);
  const [atsResult, setAtsResult] = useState<{ score: number; matchedKeywords: string[]; missingKeywords: string[] } | null>(null);
  const [skillInput, setSkillInput] = useState("");

  // Parse URL params
  const resumeId = params?.id && params.id !== "new" ? parseInt(params.id) : null;
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const urlTemplateId = searchParams.get("templateId");

  const { data: existingResume } = useGetResume(resumeId!, {
    query: { enabled: resumeId !== null, queryKey: getGetResumeQueryKey(resumeId!) }
  });
  const { data: templates } = useListTemplates();
  const createMutation = useCreateResume();
  const updateMutation = useUpdateResume();
  const scoreMutation = useCalculateAtsScore();
  const enhanceMutation = useEnhanceResume();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultFormValues,
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control: form.control,
    name: "experience",
  });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control: form.control,
    name: "education",
  });
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({
    control: form.control,
    name: "certifications",
  });

  useEffect(() => {
    if (urlTemplateId) setSelectedTemplateId(parseInt(urlTemplateId));
  }, [urlTemplateId]);

  useEffect(() => {
    if (existingResume) {
      const data = existingResume.resumeData as any;
      form.reset({
        title: existingResume.title,
        sector: existingResume.sector,
        personalInfo: data?.personalInfo || defaultFormValues.personalInfo,
        education: data?.education || [],
        experience: data?.experience || [],
        skills: data?.skills || [],
        certifications: data?.certifications || [],
      });
      if (existingResume.templateId) setSelectedTemplateId(existingResume.templateId);
    }
  }, [existingResume]);

  const watchedData = form.watch();
  const skills = form.watch("skills") || [];

  const previewData = {
    personalInfo: watchedData.personalInfo || defaultFormValues.personalInfo,
    education: watchedData.education || [],
    experience: (watchedData.experience || []).map((exp) => ({
      ...exp,
      bullets: exp.bullets || [],
    })),
    skills: watchedData.skills || [],
    certifications: watchedData.certifications || [],
  };

  const onSubmit = async (data: FormData) => {
    const resumeData = {
      personalInfo: data.personalInfo,
      education: data.education,
      experience: data.experience,
      skills: data.skills,
      certifications: data.certifications,
    };

    if (resumeId) {
      updateMutation.mutate(
        { id: resumeId, data: { title: data.title, sector: data.sector, resumeData, templateId: selectedTemplateId } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetResumeQueryKey(resumeId) });
            toast({ title: "Resume saved" });
          },
          onError: () => toast({ title: "Failed to save", variant: "destructive" }),
        }
      );
    } else {
      createMutation.mutate(
        { data: { title: data.title, sector: data.sector, resumeData, templateId: selectedTemplateId } },
        {
          onSuccess: (r) => {
            toast({ title: "Resume created" });
            setLocation(`/resumes/${r.id}`);
          },
          onError: () => toast({ title: "Failed to create", variant: "destructive" }),
        }
      );
    }
  };

  const handleAtsScore = () => {
    const text = buildResumeText(watchedData);
    scoreMutation.mutate({ data: { resumeText: text, sector: watchedData.sector, resumeId: resumeId || undefined } }, {
      onSuccess: (d) => setAtsResult(d as any),
    });
  };

  const handleEnhance = () => {
    if (!resumeId) return toast({ title: "Save your resume first", description: "Please save before using AI enhancement." });
    enhanceMutation.mutate({ id: resumeId }, {
      onSuccess: (d) => {
        toast({ title: "Resume enhanced", description: "AI suggestions have been applied." });
        if (d.resumeData) {
          const rd = d.resumeData as any;
          form.setValue("personalInfo.summary", rd.personalInfo?.summary || watchedData.personalInfo.summary);
        }
      },
    });
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportWord = () => {
    const text = buildResumeText(watchedData);
    const blob = new Blob([text], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${watchedData.title || "resume"}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      form.setValue("skills", [...skills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (i: number) => {
    form.setValue("skills", skills.filter((_, idx) => idx !== i));
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AppLayout>
      <div className="flex h-full">
        {/* Form panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card no-print flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/resumes")} className="gap-1.5">
              <ChevronLeft className="w-4 h-4" />
              Resumes
            </Button>

            <div className="flex-1 min-w-0">
              <input
                {...form.register("title")}
                className="font-semibold bg-transparent border-none outline-none text-sm w-full"
                placeholder="Resume title..."
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {atsResult && (
                <span className={cn("text-sm font-bold px-2 py-0.5 rounded-full", getAtsScoreBgColor(atsResult.score))}>
                  {atsResult.score}% ATS
                </span>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAtsScore}
                disabled={scoreMutation.isPending}
                className="gap-1.5 text-xs"
                data-testid="button-ats-score"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                {scoreMutation.isPending ? "Scoring..." : "ATS Score"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleEnhance}
                disabled={enhanceMutation.isPending || !resumeId}
                className="gap-1.5 text-xs"
                data-testid="button-enhance"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Enhance
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setPreviewVisible(!previewVisible)}
                className="gap-1.5 text-xs lg:flex"
                data-testid="button-toggle-preview"
              >
                <Eye className="w-3.5 h-3.5" />
                {previewVisible ? "Hide" : "Show"} Preview
              </Button>
              <Select value={selectedTemplateId.toString()} onValueChange={(v) => setSelectedTemplateId(parseInt(v))}>
                <SelectTrigger className="w-40 h-8 text-xs" data-testid="select-template">
                  <SelectValue placeholder="Template" />
                </SelectTrigger>
                <SelectContent>
                  {(templates || []).filter(t => t.tier === "free" || user?.tier !== "free").map(t => (
                    <SelectItem key={t.id} value={t.id.toString()} className="text-xs">{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleExportPDF}
                className="gap-1.5 text-xs"
                data-testid="button-export-pdf"
              >
                <Download className="w-3.5 h-3.5" />
                PDF
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleExportWord}
                className="gap-1.5 text-xs"
                data-testid="button-export-word"
              >
                <Download className="w-3.5 h-3.5" />
                Word
              </Button>
              <Button
                size="sm"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSaving}
                className="gap-1.5 text-xs"
                data-testid="button-save"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>

          {/* Scrollable form */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Tabs defaultValue="personal" className="p-4">
                <TabsList className="mb-4 no-print" data-testid="tabs-editor">
                  <TabsTrigger value="personal" data-testid="tab-personal">Personal</TabsTrigger>
                  <TabsTrigger value="experience" data-testid="tab-experience">Experience</TabsTrigger>
                  <TabsTrigger value="education" data-testid="tab-education">Education</TabsTrigger>
                  <TabsTrigger value="skills" data-testid="tab-skills">Skills</TabsTrigger>
                  <TabsTrigger value="other" data-testid="tab-other">Other</TabsTrigger>
                </TabsList>

                {/* Personal Info */}
                <TabsContent value="personal" className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Sector</label>
                    <Select value={form.watch("sector")} onValueChange={(v) => form.setValue("sector", v)}>
                      <SelectTrigger className="capitalize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTORS.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">First Name</label>
                      <Input {...form.register("personalInfo.firstName")} placeholder="Jane" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Last Name</label>
                      <Input {...form.register("personalInfo.lastName")} placeholder="Smith" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                    <Input type="email" {...form.register("personalInfo.email")} placeholder="jane@example.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                      <Input {...form.register("personalInfo.phone")} placeholder="+1 (555) 000-0000" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Location</label>
                      <Input {...form.register("personalInfo.location")} placeholder="New York, NY" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">LinkedIn URL</label>
                    <Input {...form.register("personalInfo.linkedIn")} placeholder="linkedin.com/in/janesmith" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Website</label>
                    <Input {...form.register("personalInfo.website")} placeholder="janesmith.dev" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Professional Summary</label>
                    <Textarea
                      {...form.register("personalInfo.summary")}
                      placeholder="Write a compelling 2-3 sentence summary of your experience, skills, and career goals..."
                      rows={5}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{form.watch("personalInfo.summary")?.length || 0}/500</p>
                  </div>
                </TabsContent>

                {/* Experience */}
                <TabsContent value="experience" className="space-y-4">
                  <SectionHeader
                    title={`Work Experience (${expFields.length})`}
                    onAdd={() => appendExp({ company: "", title: "", location: "", startDate: "", endDate: "", bullets: [""] })}
                    addLabel="Add Position"
                  />
                  {expFields.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-6">No experience added yet. Click "Add Position" to get started.</p>
                  )}
                  {expFields.map((field, index) => (
                    <div key={field.id} className="bg-muted/40 rounded-xl p-4 space-y-3 border border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Position {index + 1}</span>
                        <button type="button" onClick={() => removeExp(index)} className="text-destructive hover:text-destructive/70">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Job Title *</label>
                          <Input {...form.register(`experience.${index}.title`)} placeholder="Senior Engineer" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Company *</label>
                          <Input {...form.register(`experience.${index}.company`)} placeholder="Acme Corp" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Location</label>
                          <Input {...form.register(`experience.${index}.location`)} placeholder="Remote" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Start</label>
                          <Input {...form.register(`experience.${index}.startDate`)} placeholder="Jan 2020" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">End</label>
                          <Input {...form.register(`experience.${index}.endDate`)} placeholder="Present" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-muted-foreground">Bullet Points</label>
                          <button
                            type="button"
                            onClick={() => {
                              const cur = form.getValues(`experience.${index}.bullets`) || [];
                              form.setValue(`experience.${index}.bullets`, [...cur, ""]);
                            }}
                            className="text-xs text-primary hover:underline"
                          >
                            + Add bullet
                          </button>
                        </div>
                        {(form.watch(`experience.${index}.bullets`) || []).map((_, bi) => (
                          <div key={bi} className="flex gap-2 mb-2">
                            <span className="text-muted-foreground mt-2.5 flex-shrink-0">•</span>
                            <Input
                              {...form.register(`experience.${index}.bullets.${bi}`)}
                              placeholder={`Achieved X by implementing Y, resulting in Z% improvement...`}
                              className="text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const cur = form.getValues(`experience.${index}.bullets`) || [];
                                form.setValue(`experience.${index}.bullets`, cur.filter((_, i) => i !== bi));
                              }}
                              className="text-muted-foreground hover:text-destructive flex-shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                {/* Education */}
                <TabsContent value="education" className="space-y-4">
                  <SectionHeader
                    title={`Education (${eduFields.length})`}
                    onAdd={() => appendEdu({ institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "" })}
                    addLabel="Add Education"
                  />
                  {eduFields.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-6">No education added yet.</p>
                  )}
                  {eduFields.map((field, index) => (
                    <div key={field.id} className="bg-muted/40 rounded-xl p-4 space-y-3 border border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Education {index + 1}</span>
                        <button type="button" onClick={() => removeEdu(index)} className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Institution</label>
                        <Input {...form.register(`education.${index}.institution`)} placeholder="MIT" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Degree</label>
                          <Input {...form.register(`education.${index}.degree`)} placeholder="B.S." />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Field of Study</label>
                          <Input {...form.register(`education.${index}.field`)} placeholder="Computer Science" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Start</label>
                          <Input {...form.register(`education.${index}.startDate`)} placeholder="Sep 2018" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">End</label>
                          <Input {...form.register(`education.${index}.endDate`)} placeholder="May 2022" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">GPA</label>
                          <Input {...form.register(`education.${index}.gpa`)} placeholder="3.9" />
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                {/* Skills */}
                <TabsContent value="skills" className="space-y-4">
                  <SectionHeader title={`Skills (${skills.length})`} />
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Type a skill and press Enter..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      data-testid="input-skill"
                    />
                    <Button type="button" variant="outline" onClick={addSkill} className="flex-shrink-0">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="gap-1.5 pr-1 cursor-pointer"
                        data-testid={`badge-skill-${i}`}
                      >
                        {skill}
                        <button type="button" onClick={() => removeSkill(i)} className="hover:text-destructive">
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {skills.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-6">Add skills relevant to your target role. Each skill helps improve your ATS score.</p>
                  )}
                </TabsContent>

                {/* Other — certifications */}
                <TabsContent value="other" className="space-y-4">
                  <SectionHeader
                    title={`Certifications (${certFields.length})`}
                    onAdd={() => appendCert({ name: "", issuer: "", date: "" })}
                    addLabel="Add Certification"
                  />
                  {certFields.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-6">No certifications added yet.</p>
                  )}
                  {certFields.map((field, index) => (
                    <div key={field.id} className="bg-muted/40 rounded-xl p-4 space-y-3 border border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Certification {index + 1}</span>
                        <button type="button" onClick={() => removeCert(index)} className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Certification Name</label>
                        <Input {...form.register(`certifications.${index}.name`)} placeholder="AWS Solutions Architect" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Issuer</label>
                          <Input {...form.register(`certifications.${index}.issuer`)} placeholder="Amazon Web Services" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                          <Input {...form.register(`certifications.${index}.date`)} placeholder="Mar 2024" />
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </form>
          </div>
        </div>

        {/* Preview panel */}
        {previewVisible && (
          <div className="hidden lg:flex flex-col w-[480px] border-l border-border bg-muted/30 print-area">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card no-print">
              <span className="text-sm font-semibold">Live Preview</span>
              {atsResult && (
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", getAtsScoreBgColor(atsResult.score))}>
                  ATS: {atsResult.score}%
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="transform scale-[0.62] origin-top-left w-[161%]">
                <ResumePreview data={previewData} templateId={selectedTemplateId} />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function buildResumeText(data: FormData): string {
  const pi = data.personalInfo;
  const lines: string[] = [
    `${pi.firstName} ${pi.lastName}`,
    `${pi.email} | ${pi.phone} | ${pi.location}`,
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
    ...(data.education || []).map((edu) =>
      `${edu.degree} in ${edu.field}, ${edu.institution} (${edu.startDate} - ${edu.endDate || "Present"})`
    ),
    "",
    "SKILLS",
    (data.skills || []).join(", "),
    "",
    "CERTIFICATIONS",
    ...(data.certifications || []).map((c) => `${c.name} - ${c.issuer} (${c.date})`),
  ];
  return lines.join("\n");
}
