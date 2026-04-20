import { cn } from "@/lib/utils";
import { EditableField } from "./canvas/EditableField";
import { DateField } from "./canvas/DateField";
import { EditableSection, EditableSectionItem, EditableBulletList } from "./canvas/EditableSection";
import { SkillsEditor } from "./canvas/SkillsEditor";

// ─── Type definitions ───────────────────────────────────────────────────────

export type ValidationErrors = Record<string, string>;

export interface ResumePersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  countryCode?: string;
  phone: string;
  location: string;
  linkedIn?: string | null;
  websites?: string[] | null;
  summary: string;
}

export interface ResumeData {
  personalInfo: ResumePersonalInfo;
  education: Array<{
    id?: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string | null;
    gpa?: string | null;
  }>;
  experience: Array<{
    id?: string;
    company: string;
    title: string;
    location: string;
    startDate: string;
    endDate?: string | null;
    bullets: string[];
  }>;
  projects: Array<{
    id?: string;
    title: string;
    link?: string | null;
    bullets: string[];
  }>;
  skills: string[];
  certifications: Array<{
    id?: string;
    name: string;
    issuer: string;
    date: string;
  }>;
}

export interface ResumeHandlers {
  updatePersonalInfo: (field: string, value: string) => void;
  addExperience: () => void;
  removeExperience: (id: string) => void;
  updateExperience: (id: string, field: string, value: string) => void;
  updateExperienceBullet: (expId: string, idx: number, val: string) => void;
  addExperienceBullet: (expId: string) => void;
  removeExperienceBullet: (expId: string, idx: number) => void;
  addEducation: () => void;
  removeEducation: (id: string) => void;
  updateEducation: (id: string, field: string, value: string) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  addProject: () => void;
  removeProject: (id: string) => void;
  updateProject: (id: string, field: string, value: string) => void;
  updateProjectBullet: (projId: string, idx: number, val: string) => void;
  addProjectBullet: (projId: string) => void;
  removeProjectBullet: (projId: string, idx: number) => void;
  addCertification: () => void;
  removeCertification: (id: string) => void;
  updateCertification: (id: string, field: string, value: string) => void;
}

interface TemplateProps {
  data: ResumeData;
  palette: typeof STRATEGIC_PALETTES[0];
  editable?: boolean;
  handlers?: ResumeHandlers;
  errors?: ValidationErrors;
  suggestions?: string[];
}

interface Props {
  data: ResumeData;
  templateId: number | string;
  editable?: boolean;
  handlers?: ResumeHandlers;
  errors?: ValidationErrors;
  suggestions?: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const STRATEGIC_PALETTES = [
  { id: "slate", primary: "#334155", accent: "#64748b" },
  { id: "navy", primary: "#1e293b", accent: "#475569" },
  { id: "emerald", primary: "#064e3b", accent: "#059669" },
  { id: "crimson", primary: "#7f1d1d", accent: "#b91c1c" },
];

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  if (iso === "present") return "Present";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function phone(pi: ResumePersonalInfo): string {
  return pi.countryCode ? `${pi.countryCode} ${pi.phone}` : pi.phone;
}

// Shorthand: editable field for personal info
function PIField({ pi, field, handlers, errors, editable, className, placeholder, as: Tag = "span", multiline }: {
  pi: ResumePersonalInfo;
  field: keyof ResumePersonalInfo;
  handlers?: ResumeHandlers;
  errors?: ValidationErrors;
  editable?: boolean;
  className?: string;
  placeholder?: string;
  as?: React.ElementType;
  multiline?: boolean;
}) {
  const value = (pi[field] as string) ?? "";
  return (
    <EditableField
      value={value}
      onChange={(v) => handlers?.updatePersonalInfo(field as string, v)}
      editable={editable}
      error={errors?.[`personalInfo.${field}`]}
      placeholder={placeholder ?? String(field)}
      className={className}
      as={Tag}
      multiline={multiline}
    />
  );
}

// Editable experience section helper
function ExperienceBlocks({
  data, handlers, errors, editable,
  renderItem,
}: {
  data: ResumeData;
  handlers?: ResumeHandlers;
  errors?: ValidationErrors;
  editable?: boolean;
  renderItem: (exp: ResumeData["experience"][0], i: number, ef: (field: string, v: string) => void, df: (field: string, v: string) => void, bulletsEl: React.ReactNode) => React.ReactNode;
}) {
  return (
    <EditableSection label="Experience" editable={editable} onAdd={handlers?.addExperience} addLabel="+ Add Experience">
      {data.experience.map((exp, i) => {
        const id = exp.id ?? String(i);
        const ef = (field: string, v: string) => handlers?.updateExperience(id, field, v);
        const df = (field: string, v: string) => handlers?.updateExperience(id, field, v);
        const bulletsEl = (
          <EditableBulletList
            bullets={exp.bullets}
            onChange={(idx, val) => handlers?.updateExperienceBullet(id, idx, val)}
            onAdd={() => handlers?.addExperienceBullet(id)}
            onRemove={(idx) => handlers?.removeExperienceBullet(id, idx)}
            editable={editable}
            errors={
              Object.fromEntries(
                exp.bullets.map((_, j) => [j, errors?.[`experience.${i}.bullets.${j}`] ?? ""])
              )
            }
          />
        );
        return (
          <EditableSectionItem
            key={id}
            editable={editable}
            onRemove={() => handlers?.removeExperience(id)}
          >
            {renderItem(exp, i, ef, df, bulletsEl)}
          </EditableSectionItem>
        );
      })}
    </EditableSection>
  );
}

function EducationBlocks({
  data, handlers, errors, editable,
  renderItem,
}: {
  data: ResumeData;
  handlers?: ResumeHandlers;
  errors?: ValidationErrors;
  editable?: boolean;
  renderItem: (edu: ResumeData["education"][0], i: number, ef: (field: string, v: string) => void) => React.ReactNode;
}) {
  return (
    <EditableSection label="Education" editable={editable} onAdd={handlers?.addEducation} addLabel="+ Add Education">
      {data.education.map((edu, i) => {
        const id = edu.id ?? String(i);
        const ef = (field: string, v: string) => handlers?.updateEducation(id, field, v);
        return (
          <EditableSectionItem key={id} editable={editable} onRemove={() => handlers?.removeEducation(id)}>
            {renderItem(edu, i, ef)}
          </EditableSectionItem>
        );
      })}
    </EditableSection>
  );
}

function ProjectBlocks({
  data, handlers, errors, editable,
  renderItem,
}: {
  data: ResumeData;
  handlers?: ResumeHandlers;
  errors?: ValidationErrors;
  editable?: boolean;
  renderItem: (proj: ResumeData["projects"][0], i: number, ef: (field: string, v: string) => void, bulletsEl: React.ReactNode) => React.ReactNode;
}) {
  return (
    <EditableSection label="Projects" editable={editable} onAdd={handlers?.addProject} addLabel="+ Add Project">
      {data.projects.map((proj, i) => {
        const id = proj.id ?? String(i);
        const ef = (field: string, v: string) => handlers?.updateProject(id, field, v);
        const bulletsEl = (
          <EditableBulletList
            bullets={proj.bullets}
            onChange={(idx, val) => handlers?.updateProjectBullet(id, idx, val)}
            onAdd={() => handlers?.addProjectBullet(id)}
            onRemove={(idx) => handlers?.removeProjectBullet(id, idx)}
            editable={editable}
          />
        );
        return (
          <EditableSectionItem key={id} editable={editable} onRemove={() => handlers?.removeProject(id)}>
            {renderItem(proj, i, ef, bulletsEl)}
          </EditableSectionItem>
        );
      })}
    </EditableSection>
  );
}

function CertBlocks({
  data, handlers, errors, editable,
  renderItem,
}: {
  data: ResumeData;
  handlers?: ResumeHandlers;
  errors?: ValidationErrors;
  editable?: boolean;
  renderItem: (cert: ResumeData["certifications"][0], i: number, ef: (field: string, v: string) => void) => React.ReactNode;
}) {
  return (
    <EditableSection label="Certifications" editable={editable} onAdd={handlers?.addCertification} addLabel="+ Add Cert">
      {data.certifications.map((cert, i) => {
        const id = cert.id ?? String(i);
        const ef = (field: string, v: string) => handlers?.updateCertification(id, field, v);
        return (
          <EditableSectionItem key={id} editable={editable} onRemove={() => handlers?.removeCertification(id)}>
            {renderItem(cert, i, ef)}
          </EditableSectionItem>
        );
      })}
    </EditableSection>
  );
}

// ─── TEMPLATE 1: MODERN TECH LEAD ────────────────────────────────────────────
export function ModernTechLead({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-900 min-h-[1056px] p-12 print:p-0 font-sans leading-snug">
      <header className="mb-8 border-b-2 border-slate-900 pb-6">
        <h1 className="text-4xl font-extrabold tracking-tight uppercase mb-2">
          <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
          <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
        </h1>
        <div className="text-[11px] font-medium flex flex-wrap gap-x-4 gap-y-1 text-slate-600">
          <PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="email@example.com" />
          <span>{phone(pi)}</span>
          <PIField pi={pi} field="location" handlers={handlers} errors={errors} editable={editable} placeholder="City, Country" />
          {(pi.linkedIn || editable) && <PIField pi={pi} field="linkedIn" handlers={handlers} errors={errors} editable={editable} placeholder="LinkedIn URL" />}
        </div>
      </header>
      <main className="space-y-8">
        <section>
          <h2 className="text-sm font-black uppercase tracking-widest mb-3 border-b border-slate-200">Summary</h2>
          <PIField pi={pi} field="summary" handlers={handlers} errors={errors} editable={editable} multiline as="p" placeholder="Write your professional summary…" className="text-[11px] leading-relaxed text-slate-700 block" />
        </section>
        {(data.projects.length > 0 || editable) && (
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest mb-4 border-b border-slate-200">Technical Projects</h2>
            <div className="space-y-4">
              <ProjectBlocks data={data} handlers={handlers} errors={errors} editable={editable}
                renderItem={(proj, i, ef, bulletsEl) => (
                  <div>
                    <div className="font-bold text-[13px]">
                      <EditableField value={proj.title} onChange={(v) => ef("title", v)} editable={editable} placeholder="Project Title" />
                      {" "}{(proj.link || editable) && <EditableField value={proj.link ?? ""} onChange={(v) => ef("link", v)} editable={editable} placeholder="Project URL" className="text-slate-400 font-normal" />}
                    </div>
                    <div className="mt-1 list-disc pl-4 text-[10px] text-slate-600">{bulletsEl}</div>
                  </div>
                )}
              />
            </div>
          </section>
        )}
        <section>
          <h2 className="text-sm font-black uppercase tracking-widest mb-4 border-b border-slate-200">Professional Experience</h2>
          <div className="space-y-6">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-[13px]">
                      <EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Job Title" />
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400">
                      <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" /> — <DateField value={exp.endDate ?? ""} onChange={(v) => df("endDate", v)} editable={editable} allowPresent placeholder="End" />
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 mb-2">
                    <EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" /> | <EditableField value={exp.location} onChange={(v) => ef("location", v)} editable={editable} placeholder="Location" />
                  </div>
                  <div className="pl-4 text-[11px] text-slate-600">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
        <div className="grid grid-cols-2 gap-8">
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest mb-3 border-b border-slate-200">Skills</h2>
            <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="flex flex-wrap gap-1.5 text-[11px] text-slate-700" />
          </section>
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest mb-3 border-b border-slate-200">Education</h2>
            <div className="space-y-4">
              <EducationBlocks data={data} handlers={handlers} errors={errors} editable={editable}
                renderItem={(edu, i, ef) => (
                  <div>
                    <div className="font-bold text-[11px]"><EditableField value={edu.institution} onChange={(v) => ef("institution", v)} editable={editable} error={errors?.[`education.${i}.institution`]} placeholder="Institution" /></div>
                    <div className="text-[10px] text-slate-500 italic"><EditableField value={edu.degree} onChange={(v) => ef("degree", v)} editable={editable} placeholder="Degree" /> in <EditableField value={edu.field} onChange={(v) => ef("field", v)} editable={editable} placeholder="Field" /></div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      <DateField value={edu.startDate} onChange={(v) => ef("startDate", v)} editable={editable} placeholder="Start" /> — <DateField value={edu.endDate ?? ""} onChange={(v) => ef("endDate", v)} editable={editable} allowPresent placeholder="End" />
                    </div>
                  </div>
                )}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// ─── TEMPLATE 2: EXECUTIVE CLASSIC ───────────────────────────────────────────
export function ExecutiveClassic({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-900 min-h-[1056px] p-16 print:p-0 font-serif leading-relaxed">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold border-b-2 border-slate-800 pb-2 mb-3 tracking-tighter uppercase">
          <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
          <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
        </h1>
        <div className="text-[11px] font-bold flex justify-center flex-wrap gap-4 uppercase tracking-[0.05em] text-slate-500">
          <PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" />
          <span>•</span><span>{phone(pi)}</span><span>•</span>
          <PIField pi={pi} field="location" handlers={handlers} errors={errors} editable={editable} placeholder="Location" />
        </div>
      </header>
      <div className="space-y-10">
        <section>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-4 border-b border-slate-100 flex items-center justify-between">Executive Profile <div className="h-px flex-1 ml-4 bg-slate-100" /></h2>
          <PIField pi={pi} field="summary" handlers={handlers} errors={errors} editable={editable} multiline as="p" placeholder="Executive summary…" className="text-[12px] leading-relaxed italic text-slate-600 px-4 block" />
        </section>
        <section>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-4 border-b border-slate-100 flex items-center justify-between">Core Competencies <div className="h-px flex-1 ml-4 bg-slate-100" /></h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]}
            className="grid grid-cols-3 gap-y-2 gap-x-8 px-4"
            renderTag={(skill, onRemove) => (
              <div className="text-[10px] font-bold text-slate-700 flex items-center gap-2">
                <span className="w-1 h-1 bg-slate-300 rounded-full" /> {skill}
                {editable && onRemove && <button onClick={onRemove} className="ml-auto text-red-300 hover:text-red-500 text-[9px]">×</button>}
              </div>
            )}
          />
        </section>
        <section>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 border-b border-slate-100 flex items-center justify-between">Professional Experience <div className="h-px flex-1 ml-4 bg-slate-100" /></h2>
          <div className="space-y-8">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div>
                  <div className="flex justify-between font-bold text-[13px] mb-1">
                    <EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Job Title" />
                    <span className="text-slate-400 uppercase text-[10px] tracking-widest">
                      <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" /> — <DateField value={exp.endDate ?? ""} onChange={(v) => df("endDate", v)} editable={editable} allowPresent placeholder="End" />
                    </span>
                  </div>
                  <div className="text-[11px] font-bold italic text-slate-500 mb-3">
                    <EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" /> — <EditableField value={exp.location} onChange={(v) => ef("location", v)} editable={editable} placeholder="Location" />
                  </div>
                  <div className="px-2 text-[11px] text-slate-600">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
        <section>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-4 border-b border-slate-100 flex items-center justify-between">Education <div className="h-px flex-1 ml-4 bg-slate-100" /></h2>
          <EducationBlocks data={data} handlers={handlers} errors={errors} editable={editable}
            renderItem={(edu, i, ef) => (
              <div className="flex justify-between items-baseline mb-2 px-2">
                <div>
                  <EditableField value={edu.institution} onChange={(v) => ef("institution", v)} editable={editable} error={errors?.[`education.${i}.institution`]} placeholder="Institution" className="font-bold text-[11px]" />
                  <span className="text-[10px] text-slate-500 ml-2">— <EditableField value={edu.degree} onChange={(v) => ef("degree", v)} editable={editable} placeholder="Degree" /></span>
                </div>
                <DateField value={edu.endDate ?? ""} onChange={(v) => ef("endDate", v)} editable={editable} allowPresent placeholder="Year" className="text-[10px] font-bold text-slate-300" />
              </div>
            )}
          />
        </section>
      </div>
    </div>
  );
}

// ─── TEMPLATE 3: ACADEMIC GRADUATE ───────────────────────────────────────────
export function AcademicGraduate({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-900 min-h-[1056px] p-12 print:p-0 font-sans leading-tight">
      <header className="mb-10 text-center border-b-4 border-slate-900 pb-8">
        <h1 className="text-5xl font-black mb-4 uppercase tracking-[0.1em]">
          <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
          <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
        </h1>
        <div className="text-[11px] flex justify-center gap-4 text-slate-500 font-bold uppercase tracking-widest">
          <PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" />
          <span>|</span><span>{phone(pi)}</span><span>|</span>
          <PIField pi={pi} field="location" handlers={handlers} errors={errors} editable={editable} placeholder="Location" />
        </div>
      </header>
      <div className="space-y-10">
        <section>
          <h2 className="bg-slate-900 text-white text-[10px] font-black uppercase px-4 py-1 tracking-[0.3em] mb-4">Education</h2>
          <EducationBlocks data={data} handlers={handlers} errors={errors} editable={editable}
            renderItem={(edu, i, ef) => (
              <div className="px-4 mb-4">
                <div className="flex justify-between font-black text-[14px]">
                  <EditableField value={edu.institution} onChange={(v) => ef("institution", v)} editable={editable} error={errors?.[`education.${i}.institution`]} placeholder="Institution" />
                  <span className="text-slate-400">
                    <DateField value={edu.startDate} onChange={(v) => ef("startDate", v)} editable={editable} placeholder="Start" /> — <DateField value={edu.endDate ?? ""} onChange={(v) => ef("endDate", v)} editable={editable} allowPresent placeholder="End" />
                  </span>
                </div>
                <div className="font-bold text-slate-500 italic mt-1">
                  <EditableField value={edu.degree} onChange={(v) => ef("degree", v)} editable={editable} placeholder="Degree" /> / <EditableField value={edu.field} onChange={(v) => ef("field", v)} editable={editable} placeholder="Field" />
                </div>
                {(edu.gpa || editable) && <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">GPA: <EditableField value={edu.gpa ?? ""} onChange={(v) => ef("gpa", v)} editable={editable} placeholder="3.9" /></div>}
              </div>
            )}
          />
        </section>
        <section>
          <h2 className="bg-slate-900 text-white text-[10px] font-black uppercase px-4 py-1 tracking-[0.3em] mb-4 text-center">Core Competencies</h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="flex flex-wrap justify-center gap-2 px-8" renderTag={(skill, onRemove) => (
            <span className="relative group/stag bg-slate-100 border text-slate-700 font-bold px-3 py-1 rounded text-[10px] uppercase tracking-tighter flex items-center gap-1">
              {skill}
              {editable && onRemove && <button onClick={onRemove} className="text-red-300 hover:text-red-500 text-[9px] opacity-0 group-hover/stag:opacity-100">×</button>}
            </span>
          )} />
        </section>
        <section>
          <h2 className="bg-slate-900 text-white text-[10px] font-black uppercase px-4 py-1 tracking-[0.3em] mb-6">Internships & Professional Experience</h2>
          <div className="space-y-8 px-4">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="text-lg font-black">
                      <EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Job Title" /> <span className="text-slate-300 ml-2">@</span>{" "}
                      <EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" />
                    </h3>
                    <span className="text-[10px] font-black text-slate-400">
                      <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" /> - <DateField value={exp.endDate ?? ""} onChange={(v) => df("endDate", v)} editable={editable} allowPresent placeholder="End" />
                    </span>
                  </div>
                  <div className="ml-2 text-[11px] text-slate-600">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── TEMPLATE 4: PROFESSIONAL HYBRID ─────────────────────────────────────────
export function ProfessionalHybrid({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-900 min-h-[1056px] p-16 print:p-0 font-sans leading-relaxed">
      <header className="mb-10 flex justify-between items-start border-b pb-8">
        <div className="max-w-[60%]">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tighter leading-none mb-4 uppercase">
            <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
            <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
          </h1>
          <PIField pi={pi} field="summary" handlers={handlers} errors={errors} editable={editable} multiline as="p" placeholder="Professional summary…" className="text-[11px] text-slate-400 font-bold leading-relaxed block" />
        </div>
        <div className="text-right text-[10px] font-black space-y-1 uppercase tracking-widest text-slate-400">
          <div><PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" /></div>
          <div>{phone(pi)}</div>
          <div><PIField pi={pi} field="location" handlers={handlers} errors={errors} editable={editable} placeholder="Location" /></div>
          {(pi.linkedIn || editable) && <div className="text-slate-800 font-black"><PIField pi={pi} field="linkedIn" handlers={handlers} errors={errors} editable={editable} placeholder="LinkedIn" /></div>}
        </div>
      </header>
      <div className="space-y-12">
        <section>
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8 border-l-4 border-slate-900 pl-4">Professional Experience</h2>
          <div className="space-y-10">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
                      <EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Job Title" />
                    </h3>
                    <span className="text-[10px] font-bold text-slate-300 tracking-widest">
                      <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" /> — <DateField value={exp.endDate ?? ""} onChange={(v) => df("endDate", v)} editable={editable} allowPresent placeholder="End" />
                    </span>
                  </div>
                  <div className="text-[11px] font-black uppercase tracking-widest mb-4" style={{ color: palette.accent }}>
                    <EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" />
                  </div>
                  <div className="text-[11px] text-slate-600">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
        <section>
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8 border-l-4 border-slate-900 pl-4">Skills & Education</h2>
          <div className="grid grid-cols-12 gap-12">
            <div className="col-span-7">
              <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="flex flex-wrap gap-2 content-start" renderTag={(skill, onRemove) => (
                <span className="relative group/stag px-3 py-1 bg-slate-50 border rounded text-[10px] font-bold text-slate-600 flex items-center gap-1">
                  {skill}
                  {editable && onRemove && <button onClick={onRemove} className="text-red-300 hover:text-red-500 opacity-0 group-hover/stag:opacity-100">×</button>}
                </span>
              )} />
            </div>
            <div className="col-span-5 space-y-6">
              <EducationBlocks data={data} handlers={handlers} errors={errors} editable={editable}
                renderItem={(edu, i, ef) => (
                  <div>
                    <div className="font-extrabold text-[12px] text-slate-800 leading-tight mb-1"><EditableField value={edu.degree} onChange={(v) => ef("degree", v)} editable={editable} placeholder="Degree" /></div>
                    <div className="text-[10px] font-bold text-slate-400 italic mb-2"><EditableField value={edu.institution} onChange={(v) => ef("institution", v)} editable={editable} placeholder="Institution" /></div>
                    <div className="text-[9px] font-black uppercase tracking-tighter" style={{ color: palette.accent }}>
                      <DateField value={edu.startDate} onChange={(v) => ef("startDate", v)} editable={editable} placeholder="Start" /> — <DateField value={edu.endDate ?? ""} onChange={(v) => ef("endDate", v)} editable={editable} allowPresent placeholder="End" />
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── TEMPLATE 5: MEDICAL HEALTHCARE ──────────────────────────────────────────
export function MedicalHealthcare({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-800 min-h-[1056px] p-12 print:p-0 font-sans leading-normal">
      <header className="mb-8 border-l-8 border-emerald-600 pl-6">
        <h1 className="text-4xl font-black uppercase tracking-tight">
          <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
          <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
        </h1>
        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-2">Healthcare Professional / Clinical Specialist</p>
        <div className="text-[10px] flex gap-4 mt-1 text-slate-400 font-bold uppercase">
          <PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" />
          <span>{phone(pi)}</span>
          <PIField pi={pi} field="location" handlers={handlers} errors={errors} editable={editable} placeholder="Location" />
        </div>
      </header>
      <div className="space-y-8">
        <section>
          <h2 className="text-xs font-black uppercase bg-emerald-50 text-emerald-800 px-3 py-1 inline-block mb-3">Clinical Certifications & Licenses</h2>
          <div className="grid grid-cols-2 gap-4 px-4">
            <CertBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(cert, i, ef) => (
                <div className="text-[11px] border-b border-emerald-100 pb-1">
                  <EditableField value={cert.name} onChange={(v) => ef("name", v)} editable={editable} placeholder="Certification Name" className="font-bold" /> <span className="text-slate-400 italic">| <EditableField value={cert.issuer} onChange={(v) => ef("issuer", v)} editable={editable} placeholder="Issuer" /></span>
                </div>
              )}
            />
          </div>
        </section>
        <section>
          <h2 className="text-xs font-black uppercase bg-emerald-50 text-emerald-800 px-3 py-1 inline-block mb-4">Professional Experience</h2>
          <div className="space-y-6 px-4">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-[13px]">
                      <EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Job Title" /> <span className="text-emerald-600">— <EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" /></span>
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400">
                      <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" /> - <DateField value={exp.endDate ?? ""} onChange={(v) => df("endDate", v)} editable={editable} allowPresent placeholder="End" />
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 italic pl-4">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
        <section>
          <h2 className="text-xs font-black uppercase bg-emerald-50 text-emerald-800 px-3 py-1 inline-block mb-3">Skills</h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="flex flex-wrap gap-2 px-4" />
        </section>
      </div>
    </div>
  );
}

// ─── TEMPLATE 6: FINANCE ANALYST ─────────────────────────────────────────────
export function FinanceAnalyst({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-900 min-h-[1056px] p-16 print:p-0 font-serif leading-tight">
      <header className="border-y-2 border-slate-900 py-6 mb-10 flex justify-between items-center px-4">
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter">
          <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
          <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
        </h1>
        <div className="text-right text-[10px] font-black uppercase">
          <div><PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" /></div>
          <div>{phone(pi)}</div>
        </div>
      </header>
      <div className="space-y-10">
        <section>
          <h2 className="text-sm font-black uppercase border-b border-slate-300 pb-1 mb-4">Core Financial Competencies</h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="grid grid-cols-4 gap-2 text-[10px] font-bold text-slate-700 px-4" renderTag={(skill, onRemove) => (
            <div className="relative group/stag flex items-center gap-1">• {skill}{editable && onRemove && <button onClick={onRemove} className="text-red-400 hover:text-red-600 opacity-0 group-hover/stag:opacity-100 ml-1">×</button>}</div>
          )} />
        </section>
        <section>
          <h2 className="text-sm font-black uppercase border-b border-slate-300 pb-1 mb-6">Investment & Operational Experience</h2>
          <div className="space-y-8 px-4">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div>
                  <div className="flex justify-between font-bold text-[13px] mb-1">
                    <EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" />
                    <span className="text-slate-400">
                      <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" /> — <DateField value={exp.endDate ?? ""} onChange={(v) => df("endDate", v)} editable={editable} allowPresent placeholder="End" />
                    </span>
                  </div>
                  <div className="text-[11px] font-bold uppercase mb-3 text-slate-500"><EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Job Title" /></div>
                  <div className="text-[11px] text-slate-800">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
        <section>
          <h2 className="text-sm font-black uppercase border-b border-slate-300 pb-1 mb-4">Education</h2>
          <EducationBlocks data={data} handlers={handlers} errors={errors} editable={editable}
            renderItem={(edu, i, ef) => (
              <div className="flex justify-between items-baseline mb-2 px-4">
                <div>
                  <EditableField value={edu.institution} onChange={(v) => ef("institution", v)} editable={editable} placeholder="Institution" className="font-bold text-[11px]" />
                  <span className="text-[10px] text-slate-500 ml-2">— <EditableField value={edu.degree} onChange={(v) => ef("degree", v)} editable={editable} placeholder="Degree" /></span>
                </div>
                <DateField value={edu.endDate ?? ""} onChange={(v) => ef("endDate", v)} editable={editable} allowPresent placeholder="Year" className="text-[10px] font-bold text-slate-300" />
              </div>
            )}
          />
        </section>
      </div>
    </div>
  );
}

// ─── TEMPLATE 7: LEGAL PROFESSIONAL ──────────────────────────────────────────
export function LegalProfessional({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-black min-h-[1056px] p-16 print:p-0 font-serif leading-relaxed">
      <header className="text-center mb-12 border-b-4 border-double border-black pb-8">
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">
          <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
          <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
        </h1>
        <div className="text-[10px] font-bold flex justify-center gap-6">
          <span>{phone(pi)}</span>
          <PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" />
        </div>
      </header>
      <div className="space-y-12">
        <section>
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-center">Practice Areas</h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="flex justify-center flex-wrap gap-x-8 gap-y-2" renderTag={(skill, onRemove) => (
            <span className="relative group/stag text-[11px] font-medium italic text-slate-700 flex items-center gap-1">{skill}{editable && onRemove && <button onClick={onRemove} className="text-red-400 hover:text-red-600 opacity-0 group-hover/stag:opacity-100 text-[9px]">×</button>}</span>
          )} />
        </section>
        <section>
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 border-b border-black">Representative Experience</h2>
          <div className="space-y-10">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-bold text-[14px]"><EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Firm / Company" /></h3>
                    <span className="text-[10px] font-bold">
                      <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" /> - <DateField value={exp.endDate ?? ""} onChange={(v) => df("endDate", v)} editable={editable} allowPresent placeholder="End" />
                    </span>
                  </div>
                  <div className="text-[12px] font-bold italic mb-4"><EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Position" /></div>
                  <div className="space-y-3 px-4 text-[12px] text-slate-800">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
        <section>
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 border-b border-black">Education</h2>
          <EducationBlocks data={data} handlers={handlers} errors={errors} editable={editable}
            renderItem={(edu, i, ef) => (
              <div className="flex justify-between items-baseline mb-2 px-2">
                <div>
                  <EditableField value={edu.institution} onChange={(v) => ef("institution", v)} editable={editable} placeholder="Institution" className="font-bold text-[11px]" />
                  <span className="text-[10px] text-black ml-2">— <EditableField value={edu.degree} onChange={(v) => ef("degree", v)} editable={editable} placeholder="Degree" /></span>
                </div>
                <DateField value={edu.endDate ?? ""} onChange={(v) => ef("endDate", v)} editable={editable} allowPresent placeholder="Year" className="text-[10px] font-bold" />
              </div>
            )}
          />
        </section>
      </div>
    </div>
  );
}

// ─── TEMPLATE 8: SAAS PRODUCT LEAD ───────────────────────────────────────────
export function SaaSProductLead({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-900 min-h-[1056px] p-12 print:p-0 font-sans leading-snug">
      <header className="mb-12 flex justify-between items-end border-b-2 pb-6 border-slate-100">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-indigo-600 mb-1">
            <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-1" />
            <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
          </h1>
          <PIField pi={pi} field="summary" handlers={handlers} errors={errors} editable={editable} multiline as="p" placeholder="One-line tagline…" className="text-sm font-bold text-slate-400 uppercase tracking-widest block" />
        </div>
        <div className="text-right text-[10px] font-bold text-slate-400 space-y-1">
          <div><PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" /></div>
          <div>{phone(pi)}</div>
        </div>
      </header>
      <div className="space-y-12">
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-6">Growth & KPI Portfolio</h2>
          <div className="grid grid-cols-2 gap-8">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="font-black text-[14px] mb-1"><EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Job Title" /></div>
                  <div className="text-[10px] font-bold text-slate-400 mb-4 uppercase"><EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" /></div>
                  <div className="text-[11px] text-slate-600">{bulletsEl}</div>
                  <div className="text-[10px] text-slate-300 mt-2">
                    <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" /> - <DateField value={exp.endDate ?? ""} onChange={(v) => df("endDate", v)} editable={editable} allowPresent placeholder="End" />
                  </div>
                </div>
              )}
            />
          </div>
        </section>
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-6">Skills</h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="flex flex-wrap gap-2" />
        </section>
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-6">Education</h2>
          <EducationBlocks data={data} handlers={handlers} errors={errors} editable={editable}
            renderItem={(edu, i, ef) => (
              <div className="mb-3">
                <div className="font-bold text-[12px]"><EditableField value={edu.institution} onChange={(v) => ef("institution", v)} editable={editable} placeholder="Institution" /></div>
                <div className="text-[10px] text-slate-500"><EditableField value={edu.degree} onChange={(v) => ef("degree", v)} editable={editable} placeholder="Degree" /> in <EditableField value={edu.field} onChange={(v) => ef("field", v)} editable={editable} placeholder="Field" /></div>
              </div>
            )}
          />
        </section>
      </div>
    </div>
  );
}

// ─── TEMPLATES 9–25 (shared pattern, shorter for conciseness) ────────────────

export function ConsultantStrategy({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-900 min-h-[1056px] p-16 print:p-0 font-sans leading-relaxed">
      <header className="mb-16">
        <h1 className="text-3xl font-light tracking-wide text-slate-500 mb-2">
          <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
          <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
        </h1>
        <div className="h-1 w-20 bg-slate-900 mb-6" />
        <div className="text-[10px] text-slate-400 font-bold flex gap-4 mb-4"><PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" /><span>•</span><PIField pi={pi} field="location" handlers={handlers} errors={errors} editable={editable} placeholder="Location" /></div>
        <PIField pi={pi} field="summary" handlers={handlers} errors={errors} editable={editable} multiline as="p" placeholder="Professional summary…" className="text-[11px] font-medium text-slate-400 max-w-[80%] block" />
      </header>
      <div className="space-y-16">
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-10 border-b pb-2">Professional Engagements</h2>
          <div className="space-y-12">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" /> - <DateField value={exp.endDate ?? ""} onChange={(v) => df("endDate", v)} editable={editable} allowPresent placeholder="End" />
                  </div>
                  <div className="col-span-9">
                    <h3 className="text-lg font-bold mb-1"><EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Client / Company" /></h3>
                    <div className="text-xs font-medium text-slate-400 mb-4"><EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Role" /></div>
                    <div className="text-[11px] text-slate-600">{bulletsEl}</div>
                  </div>
                </div>
              )}
            />
          </div>
        </section>
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 border-b pb-2">Competencies</h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="flex flex-wrap gap-2" />
        </section>
      </div>
    </div>
  );
}

export function OperationsDirector({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-slate-50 text-slate-900 min-h-[1056px] p-8 print:p-0">
      <div className="bg-white min-h-full p-12 shadow-sm border border-slate-100">
        <header className="mb-12 flex justify-between items-center bg-slate-900 text-white p-10 -m-12 mb-16">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">
              <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2 text-white" />
              <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" className="text-white" />
            </h1>
          </div>
          <div className="text-right text-[10px] space-y-1">
            <div><PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" className="text-slate-300" /></div>
            <div className="text-slate-300">{phone(pi)}</div>
          </div>
        </header>
        <div className="space-y-12">
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest mb-6 border-b-4 border-slate-900 pb-2">Operational Vision</h2>
            <PIField pi={pi} field="summary" handlers={handlers} errors={errors} editable={editable} multiline as="p" placeholder="Summary…" className="text-[11px] leading-relaxed italic text-slate-500 block" />
          </section>
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest mb-8 border-b-4 border-slate-900 pb-2">Track Record</h2>
            <div className="space-y-10">
              <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
                renderItem={(exp, i, ef, df, bulletsEl) => (
                  <div>
                    <div className="flex justify-between font-black text-lg mb-1">
                      <EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" />
                      <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" className="text-slate-300 text-base font-normal" />
                    </div>
                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-4"><EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Title" /></div>
                    <div className="text-[11px] text-slate-600">{bulletsEl}</div>
                  </div>
                )}
              />
            </div>
          </section>
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest mb-4 border-b-4 border-slate-900 pb-2">Skills</h2>
            <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="flex flex-wrap gap-2" />
          </section>
        </div>
      </div>
    </div>
  );
}

export function SalesHero({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-800 min-h-[1056px] p-16 print:p-0 font-sans leading-snug">
      <header className="mb-16 border-b-8 border-rose-600 pb-10">
        <h1 className="text-6xl font-black italic tracking-tighter mb-4">
          <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
          <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
        </h1>
        <div className="text-[10px] flex gap-4 text-slate-400"><PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" /><span>•</span><PIField pi={pi} field="location" handlers={handlers} errors={errors} editable={editable} placeholder="Location" /></div>
      </header>
      <div className="space-y-16">
        <section>
          <h2 className="text-sm font-black uppercase mb-8 border-l-4 border-rose-600 pl-4">Career History</h2>
          <div className="space-y-10">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-black text-[14px]"><EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" /></h3>
                    <span className="text-[10px] font-black text-slate-300">
                      <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" /> - <DateField value={exp.endDate ?? ""} onChange={(v) => df("endDate", v)} editable={editable} allowPresent placeholder="End" />
                    </span>
                  </div>
                  <div className="text-[11px] font-bold mb-2 text-rose-600"><EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Title" /></div>
                  <div className="text-[11px] text-slate-500">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
        <section>
          <h2 className="text-sm font-black uppercase mb-6 border-l-4 border-rose-600 pl-4">Skills</h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="flex flex-wrap gap-2" />
        </section>
      </div>
    </div>
  );
}

export function ProjectManager({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-900 min-h-[1056px] p-12 print:p-0 font-sans leading-tight">
      <header className="mb-12 border-2 border-slate-900 p-10 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-wider">
            <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
            <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
          </h1>
        </div>
        <div className="text-right text-[10px] font-bold">
          <div><PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" /></div>
          <div><PIField pi={pi} field="location" handlers={handlers} errors={errors} editable={editable} placeholder="Location" /></div>
        </div>
      </header>
      <div className="space-y-12 px-4">
        <section>
          <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-4">Methodologies <div className="h-px flex-1 bg-slate-100" /></h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="flex flex-wrap gap-2" renderTag={(skill, onRemove) => (
            <span className="relative group/stag px-4 py-1.5 border-2 border-slate-900 text-[10px] font-black uppercase flex items-center gap-1">{skill}{editable && onRemove && <button onClick={onRemove} className="text-red-400 hover:text-red-600 opacity-0 group-hover/stag:opacity-100 ml-1">×</button>}</span>
          )} />
        </section>
        <section>
          <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-4">Strategic Deliverables <div className="h-px flex-1 bg-slate-100" /></h2>
          <div className="space-y-10">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div>
                  <div className="flex justify-between border-b border-slate-100 pb-2 mb-4">
                    <EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Project/Role" className="font-black text-[13px] uppercase" />
                    <span className="text-[10px] font-bold bg-slate-50 px-2 rounded">
                      <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" /> - <DateField value={exp.endDate ?? ""} onChange={(v) => df("endDate", v)} editable={editable} allowPresent placeholder="End" />
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 mb-3 ml-4"><EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Organization" /></div>
                  <div className="ml-4 text-[11px] text-slate-600">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export function CustomerSuccess({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-900 min-h-[1056px] p-16 print:p-0 font-sans leading-relaxed">
      <header className="mb-16">
        <h1 className="text-5xl font-extrabold text-blue-900 mb-4">
          <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
          <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
        </h1>
        <div className="h-2 w-32 bg-blue-100 rounded-full mb-6" />
        <PIField pi={pi} field="summary" handlers={handlers} errors={errors} editable={editable} multiline as="p" placeholder="Summary…" className="text-[11px] font-bold text-slate-400 leading-relaxed max-w-[70%] block" />
        <div className="text-[10px] text-slate-400 flex gap-4 mt-2"><PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" /><span>•</span><PIField pi={pi} field="location" handlers={handlers} errors={errors} editable={editable} placeholder="Location" /></div>
      </header>
      <div className="space-y-16">
        <section>
          <h2 className="text-sm font-black uppercase tracking-widest text-blue-900 mb-6">Success Portfolio</h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="grid grid-cols-3 gap-6" renderTag={(skill, onRemove) => (
            <div className="relative group/stag p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
              <div className="text-[10px] font-black uppercase text-blue-900">{skill}</div>
              {editable && onRemove && <button onClick={onRemove} className="absolute top-1 right-1 text-red-400 hover:text-red-600 text-[9px] opacity-0 group-hover/stag:opacity-100">×</button>}
            </div>
          )} />
        </section>
        <section>
          <h2 className="text-sm font-black uppercase tracking-widest text-blue-900 mb-6">Career Trajectory</h2>
          <div className="space-y-12">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div>
                  <div className="font-black text-xl text-blue-900 mb-1"><EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Job Title" /></div>
                  <div className="flex justify-between items-center text-[11px] font-bold text-blue-300 uppercase tracking-widest mb-4">
                    <EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" />
                    <span><DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" /> - <DateField value={exp.endDate ?? ""} onChange={(v) => df("endDate", v)} editable={editable} allowPresent placeholder="End" /></span>
                  </div>
                  <div className="text-[11px] text-slate-500">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export function CreativeTech({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-900 min-h-[1056px] p-12 print:p-0 font-sans leading-snug">
      <header className="mb-12">
        <h1 className="text-6xl font-black tracking-tighter uppercase mb-2">
          <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First" />
          <span className="text-orange-500">.</span>
        </h1>
        <h2 className="text-6xl font-black tracking-tighter uppercase mb-6 ml-8 text-slate-200">
          <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last" />
        </h2>
        <div className="text-[10px] font-black uppercase tracking-[0.5em] bg-slate-900 text-white p-2 inline-block ml-8">Technical Product Designer / Dev</div>
        <div className="text-[10px] text-slate-400 flex gap-4 mt-4 ml-8"><PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" /><span>{phone(pi)}</span></div>
      </header>
      <div className="space-y-12 ml-8">
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-6 underline decoration-slate-200 underline-offset-8">Stack & Systems</h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="flex flex-wrap gap-4" renderTag={(skill, onRemove) => (
            <span className="relative group/stag text-[11px] font-black border-b-2 border-slate-100 flex items-center gap-1">{skill}{editable && onRemove && <button onClick={onRemove} className="text-red-400 hover:text-red-600 opacity-0 group-hover/stag:opacity-100">×</button>}</span>
          )} />
        </section>
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-8 underline decoration-slate-200 underline-offset-8">Shipped Experience</h2>
          <div className="space-y-10">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" className="font-black text-lg" />
                    <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" className="text-[10px] font-black text-slate-200" />
                  </div>
                  <div className="text-[11px] font-bold text-orange-500 mb-4 uppercase"><EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Title" /></div>
                  <div className="text-[11px] text-slate-500">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export function RetailManager({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-900 min-h-[1056px] p-16 print:p-0 font-sans leading-relaxed">
      <header className="text-center mb-16 border-b-2 pb-10">
        <h1 className="text-4xl font-extrabold uppercase mb-2">
          <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
          <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
        </h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          <PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" /> | {phone(pi)} | <PIField pi={pi} field="location" handlers={handlers} errors={errors} editable={editable} placeholder="Location" />
        </p>
      </header>
      <div className="space-y-12">
        <section>
          <h2 className="text-xs font-black uppercase bg-slate-100 p-2 mb-8 text-center tracking-[0.2em]">Managerial Core Competencies</h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="grid grid-cols-2 gap-x-12 gap-y-2 px-8" renderTag={(skill, onRemove) => (
            <div className="relative group/stag text-[11px] font-bold text-slate-600 border-b border-slate-50 pb-1 flex justify-between items-center">{skill}{editable && onRemove && <button onClick={onRemove} className="text-red-400 hover:text-red-600 opacity-0 group-hover/stag:opacity-100">×</button>}</div>
          )} />
        </section>
        <section>
          <h2 className="text-xs font-black uppercase bg-slate-100 p-2 mb-10 text-center tracking-[0.2em]">Management Experience</h2>
          <div className="space-y-10 px-8">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div>
                  <div className="flex justify-between items-baseline border-b-2 border-slate-900 pb-1 mb-3">
                    <EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" className="font-black text-[14px] uppercase" />
                    <span className="text-[10px] font-bold uppercase">
                      <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" /> - <DateField value={exp.endDate ?? ""} onChange={(v) => df("endDate", v)} editable={editable} allowPresent placeholder="End" />
                    </span>
                  </div>
                  <div className="text-[11px] font-black uppercase text-slate-400 mb-4 tracking-widest"><EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Title" /></div>
                  <div className="ml-4 text-[11px] text-slate-600">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export function AIResearchLead({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-900 min-h-[1056px] p-16 print:p-0 font-sans leading-snug">
      <header className="mb-12 border-b-2 pb-8 border-slate-900">
        <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
          <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
          <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
        </h1>
        <div className="text-[10px] flex gap-4 text-slate-400 mt-2"><PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" /><span>{phone(pi)}</span></div>
      </header>
      <div className="space-y-12">
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-slate-300">Mathematical & Algorithm Base</h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="flex flex-wrap gap-x-8 gap-y-2" renderTag={(skill, onRemove) => (
            <span className="relative group/stag text-[11px] font-bold text-slate-700 flex items-center gap-1">[{skill}]{editable && onRemove && <button onClick={onRemove} className="text-red-400 hover:text-red-600 opacity-0 group-hover/stag:opacity-100">×</button>}</span>
          )} />
        </section>
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-slate-300">Research & Model Artifacts</h2>
          <div className="space-y-10">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div className="pl-6 border-l-2 border-slate-100">
                  <div className="flex justify-between font-bold text-[14px] mb-2">
                    <EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Lab / Company" />
                    <span className="text-slate-300">
                      <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" /> - <DateField value={exp.endDate ?? ""} onChange={(v) => df("endDate", v)} editable={editable} allowPresent placeholder="End" />
                    </span>
                  </div>
                  <p className="text-[11px] font-bold italic text-slate-500 mb-4"><EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Role" /></p>
                  <div className="text-[11px] text-slate-600 italic">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export function BackendSystems({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-800 min-h-[1056px] p-12 print:p-0 font-mono leading-tight">
      <header className="mb-12 bg-slate-50 p-10 border-b-4 border-slate-900">
        <h1 className="text-3xl font-black uppercase mb-2">
          <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
          <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
        </h1>
        <div className="text-[10px] text-slate-400"><PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" /> | <PIField pi={pi} field="location" handlers={handlers} errors={errors} editable={editable} placeholder="Location" /></div>
      </header>
      <div className="space-y-12 px-6">
        <section>
          <h2 className="text-xs font-black uppercase mb-4 text-slate-900">{"> "}system_stack</h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="grid grid-cols-3 gap-2" renderTag={(skill, onRemove) => (
            <div className="relative group/stag text-[10px] font-bold flex items-center gap-1">$ {skill}{editable && onRemove && <button onClick={onRemove} className="text-red-400 hover:text-red-600 opacity-0 group-hover/stag:opacity-100">×</button>}</div>
          )} />
        </section>
        <section>
          <h2 className="text-xs font-black uppercase mb-8 text-slate-900">{"> "}deployment_history</h2>
          <div className="space-y-10">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" className="font-black text-[13px] uppercase" />
                    <span className="text-[9px] font-bold text-slate-300">
                      <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" /> - <DateField value={exp.endDate ?? ""} onChange={(v) => df("endDate", v)} editable={editable} allowPresent placeholder="End" />
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 mb-4">Role: <EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Title" /></div>
                  <div className="text-[11px] text-slate-600 pl-4 border-l border-slate-200">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export function FrontendArchitect({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-900 min-h-[1056px] p-16 print:p-0 font-sans leading-relaxed">
      <header className="mb-16 flex justify-between items-start">
        <div className="max-w-[70%]">
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-4 text-indigo-600">
            <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
            <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
          </h1>
          <PIField pi={pi} field="summary" handlers={handlers} errors={errors} editable={editable} multiline as="p" placeholder="Summary…" className="text-xs font-bold text-slate-400 leading-relaxed italic block" />
        </div>
        <div className="text-right text-[10px] font-black uppercase space-y-1">
          <div><PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" /></div>
          <div>{phone(pi)}</div>
        </div>
      </header>
      <div className="space-y-12">
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-8 border-b pb-2">Design & Dev Stack</h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="flex flex-wrap gap-2" renderTag={(skill, onRemove) => (
            <span className="relative group/stag px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold tracking-tighter flex items-center gap-1">{skill}{editable && onRemove && <button onClick={onRemove} className="text-red-400 hover:text-red-600 opacity-0 group-hover/stag:opacity-100">×</button>}</span>
          )} />
        </section>
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-10 border-b pb-2">Product Shipments</h2>
          <div className="space-y-12">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div>
                  <div className="flex justify-between font-black text-xl mb-1">
                    <EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" />
                    <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" className="text-slate-200 font-normal text-base" />
                  </div>
                  <div className="text-xs font-bold text-indigo-500 mb-4"><EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Role" /></div>
                  <div className="text-[11px] text-slate-500">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export function FullStackScale({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-900 min-h-[1056px] p-12 print:p-0 font-sans leading-snug">
      <header className="mb-12 border-l-[12px] border-slate-900 pl-8 py-4">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">
          <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
          <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
        </h1>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" /> | <PIField pi={pi} field="location" handlers={handlers} errors={errors} editable={editable} placeholder="Location" />
        </div>
      </header>
      <div className="space-y-12">
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest mb-6 border-b-2 border-slate-100 pb-2">Full Lifecycle Stack</h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="grid grid-cols-2 gap-x-12 gap-y-2 px-4" renderTag={(skill, onRemove) => (
            <div className="relative group/stag text-[11px] font-bold text-slate-600 flex items-center gap-3"><span className="w-1.5 h-1.5 bg-slate-200 rounded-full" /> {skill}{editable && onRemove && <button onClick={onRemove} className="ml-auto text-red-400 hover:text-red-600 opacity-0 group-hover/stag:opacity-100">×</button>}</div>
          )} />
        </section>
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest mb-10 border-b-2 border-slate-100 pb-2">Engineering Trajectory</h2>
          <div className="space-y-12 px-4">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" className="font-black text-lg" />
                    <span className="text-[10px] font-bold text-slate-300">
                      <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" /> - <DateField value={exp.endDate ?? ""} onChange={(v) => df("endDate", v)} editable={editable} allowPresent placeholder="End" />
                    </span>
                  </div>
                  <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4"><EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Title" /></div>
                  <div className="ml-4 text-[11px] text-slate-600">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export function DataInsight({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-900 min-h-[1056px] p-16 print:p-0 font-serif leading-relaxed">
      <header className="mb-16 text-center">
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-4 border-b-2 border-slate-300 pb-4 inline-block px-12">
          <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
          <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
        </h1>
        <div className="text-[10px] font-bold text-slate-400 mt-2"><PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" /></div>
      </header>
      <div className="space-y-12">
        <section>
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] mb-6 text-center">Inference Engine</h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="flex justify-center flex-wrap gap-8" renderTag={(skill, onRemove) => (
            <span className="relative group/stag text-[11px] font-medium italic text-slate-700 flex items-center gap-1">{skill}{editable && onRemove && <button onClick={onRemove} className="text-red-400 hover:text-red-600 opacity-0 group-hover/stag:opacity-100">×</button>}</span>
          )} />
        </section>
        <section>
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] mb-10 border-b border-slate-100 pb-2">Case Studies & Insights</h2>
          <div className="space-y-10">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" className="font-bold text-[15px]" />
                    <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" className="text-[10px] font-bold text-slate-300 italic" />
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 mb-4"><EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Title" /></div>
                  <div className="px-6 text-[11px] text-slate-700">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export function CloudDevOps({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-800 min-h-[1056px] p-12 print:p-0 font-sans leading-snug">
      <header className="mb-12 flex justify-between items-baseline border-b-4 border-slate-900 pb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter">
          <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
          <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
        </h1>
        <div className="text-[9px] font-black bg-slate-900 text-white px-3 py-1 uppercase tracking-widest">Infra & Automation</div>
      </header>
      <div className="space-y-12">
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-4">01. Automation Stack <div className="h-px flex-1 bg-slate-100" /></h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="flex flex-wrap gap-2 px-4" renderTag={(skill, onRemove) => (
            <span className="relative group/stag bg-slate-50 border border-slate-100 px-3 py-1 rounded text-[10px] font-bold text-slate-600 flex items-center gap-1">{skill}{editable && onRemove && <button onClick={onRemove} className="text-red-400 hover:text-red-600 opacity-0 group-hover/stag:opacity-100">×</button>}</span>
          )} />
        </section>
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest mb-8 flex items-center gap-4">02. Site Reliability & CI/CD <div className="h-px flex-1 bg-slate-100" /></h2>
          <div className="space-y-10 px-4">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div>
                  <div className="flex justify-between font-black text-[13px] mb-1">
                    <EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" />
                    <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" className="text-slate-300 font-normal text-[10px]" />
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 mb-4 uppercase"><EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Title" /></div>
                  <div className="text-[11px] text-slate-500 border-l-2 border-slate-100 pl-4">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export function CyberSecurity({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-slate-900 text-white min-h-[1056px] p-12 print:bg-white print:text-slate-900">
      <header className="mb-12 border-b-2 border-slate-700 pb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-emerald-500 print:text-slate-900">
            <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
            <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
          </h1>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-slate-500 mt-2">Information Security & Threat Intelligence</p>
        </div>
        <div className="text-right text-[9px] font-black space-y-1 text-slate-400">
          <div><PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" className="text-slate-400" /></div>
          <div>SECURED HOST: <PIField pi={pi} field="location" handlers={handlers} errors={errors} editable={editable} placeholder="Location" className="text-slate-400" /></div>
        </div>
      </header>
      <div className="space-y-12">
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-6">{"// "}HARDENING_PROTOCOLS</h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="grid grid-cols-4 gap-4 px-4" renderTag={(skill, onRemove) => (
            <div className="relative group/stag border-b border-slate-800 text-[10px] font-bold py-1 flex items-center gap-1">_ {skill}{editable && onRemove && <button onClick={onRemove} className="ml-auto text-red-500 hover:text-red-400 opacity-0 group-hover/stag:opacity-100">×</button>}</div>
          )} />
        </section>
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-10">{"// "}INCIDENT_RESPONSE_LOG</h2>
          <div className="space-y-10 px-4">
            <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(exp, i, ef, df, bulletsEl) => (
                <div>
                  <div className="flex justify-between items-baseline mb-2 font-black">
                    <EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" className="text-[14px] text-white" />
                    <span className="text-slate-500 text-[10px] uppercase">
                      <DateField value={exp.startDate} onChange={(v) => df("startDate", v)} editable={editable} placeholder="Start" className="text-slate-500" /> - <DateField value={exp.endDate ?? ""} onChange={(v) => df("endDate", v)} editable={editable} allowPresent placeholder="End" className="text-slate-500" />
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 mb-4 underline decoration-slate-700 underline-offset-4"><EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Role" className="text-slate-300" /></div>
                  <div className="text-[11px] text-slate-300">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export function UniversalStarter({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-900 min-h-[1056px] p-12 print:p-0 font-sans leading-normal">
      <header className="mb-10 text-center border-b-2 pb-8 border-slate-100">
        <h1 className="text-5xl font-black tracking-tighter text-slate-800 mb-3">
          <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
          <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
        </h1>
        <div className="text-[10px] font-bold flex justify-center gap-6 text-slate-400 uppercase tracking-widest">
          <PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" />
          <span>{phone(pi)}</span>
          <PIField pi={pi} field="location" handlers={handlers} errors={errors} editable={editable} placeholder="Location" />
        </div>
        <PIField pi={pi} field="summary" handlers={handlers} errors={errors} editable={editable} multiline as="p" placeholder="Summary…" className="text-[11px] text-slate-500 mt-4 max-w-xl mx-auto block" />
      </header>
      <div className="space-y-10 max-w-4xl mx-auto">
        <section>
          <h2 className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 mb-6">Foundational Knowledge</h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="flex flex-wrap justify-center gap-2" renderTag={(skill, onRemove) => (
            <span className="relative group/stag bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-600 flex items-center gap-1">{skill}{editable && onRemove && <button onClick={onRemove} className="text-red-400 hover:text-red-600 opacity-0 group-hover/stag:opacity-100">×</button>}</span>
          )} />
        </section>
        <section>
          <h2 className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 mb-10 border-y py-4 border-slate-50">Academic & Personal Projects</h2>
          <div className="space-y-10">
            <ProjectBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(proj, i, ef, bulletsEl) => (
                <div>
                  <h3 className="text-center font-black text-lg mb-2"><EditableField value={proj.title} onChange={(v) => ef("title", v)} editable={editable} placeholder="Project Title" /></h3>
                  <div className="text-center text-[11px] text-slate-500 italic">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
        <section>
          <h2 className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 mb-10 border-y py-4 border-slate-50">Education</h2>
          <EducationBlocks data={data} handlers={handlers} errors={errors} editable={editable}
            renderItem={(edu, i, ef) => (
              <div className="text-center mb-4">
                <div className="font-black text-xl mb-1"><EditableField value={edu.institution} onChange={(v) => ef("institution", v)} editable={editable} placeholder="Institution" /></div>
                <div className="text-[11px] font-bold text-slate-400 mb-1 uppercase"><EditableField value={edu.degree} onChange={(v) => ef("degree", v)} editable={editable} placeholder="Degree" /> in <EditableField value={edu.field} onChange={(v) => ef("field", v)} editable={editable} placeholder="Field" /></div>
                <div className="text-[10px] font-black text-slate-200">
                  <DateField value={edu.startDate} onChange={(v) => ef("startDate", v)} editable={editable} placeholder="Start" /> - <DateField value={edu.endDate ?? ""} onChange={(v) => ef("endDate", v)} editable={editable} allowPresent placeholder="End" />
                </div>
              </div>
            )}
          />
        </section>
      </div>
    </div>
  );
}

export function TechnicalEngineer({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-900 min-h-[1056px] p-12 print:p-0 font-sans leading-tight">
      <header className="mb-10 border-b-4 border-slate-900 pb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-1">
            <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
            <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
          </h1>
          <PIField pi={pi} field="summary" handlers={handlers} errors={errors} editable={editable} multiline as="p" placeholder="Tagline…" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block" />
        </div>
        <PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" className="text-right text-[10px] font-bold text-slate-300 underline decoration-slate-100 underline-offset-4" />
      </header>
      <div className="space-y-12">
        <section>
          <h2 className="text-xs font-black uppercase bg-slate-900 text-white px-4 py-1 tracking-[0.3em] mb-6">Technical Proficiencies</h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="grid grid-cols-4 gap-4 px-4 font-mono" renderTag={(skill, onRemove) => (
            <div className="relative group/stag text-[10px] font-bold flex items-center gap-2"><span className="text-slate-200">/</span>{skill}{editable && onRemove && <button onClick={onRemove} className="text-red-400 hover:text-red-600 opacity-0 group-hover/stag:opacity-100">×</button>}</div>
          )} />
        </section>
        <section>
          <h2 className="text-xs font-black uppercase bg-slate-100 text-slate-900 px-4 py-1 tracking-[0.3em] mb-8">Lab & Academic Projects</h2>
          <div className="space-y-10 px-4">
            <ProjectBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(proj, i, ef, bulletsEl) => (
                <div>
                  <div className="flex justify-between items-baseline border-b border-slate-100 pb-2 mb-3">
                    <EditableField value={proj.title} onChange={(v) => ef("title", v)} editable={editable} placeholder="Project" className="font-black text-sm uppercase" />
                    {(proj.link || editable) && <EditableField value={proj.link ?? ""} onChange={(v) => ef("link", v)} editable={editable} placeholder="URL" className="text-[9px] font-bold text-slate-300 italic" />}
                  </div>
                  <div className="text-[11px] text-slate-600 pl-4 border-l-2 border-slate-100">{bulletsEl}</div>
                </div>
              )}
            />
          </div>
        </section>
        <section>
          <h2 className="text-xs font-black uppercase bg-slate-100 text-slate-900 px-4 py-1 tracking-[0.3em] mb-6">Education</h2>
          <div className="space-y-6 px-4">
            <EducationBlocks data={data} handlers={handlers} errors={errors} editable={editable}
              renderItem={(edu, i, ef) => (
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-black text-[13px] uppercase"><EditableField value={edu.institution} onChange={(v) => ef("institution", v)} editable={editable} placeholder="Institution" /></div>
                    <div className="text-[11px] font-bold text-slate-400 mt-1 italic"><EditableField value={edu.degree} onChange={(v) => ef("degree", v)} editable={editable} placeholder="Degree" /> in <EditableField value={edu.field} onChange={(v) => ef("field", v)} editable={editable} placeholder="Field" /></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-200 uppercase">
                    <DateField value={edu.startDate} onChange={(v) => ef("startDate", v)} editable={editable} placeholder="Start" /> - <DateField value={edu.endDate ?? ""} onChange={(v) => ef("endDate", v)} editable={editable} allowPresent placeholder="End" />
                  </span>
                </div>
              )}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export function NonTechGeneral({ data, palette, editable, handlers, errors, suggestions }: TemplateProps) {
  const pi = data.personalInfo;
  return (
    <div className="bg-white text-slate-900 min-h-[1056px] p-16 print:p-0 font-serif leading-relaxed">
      <header className="text-center mb-16 underline decoration-slate-100 decoration-8 underline-offset-[-2px]">
        <h1 className="text-4xl font-bold uppercase tracking-widest mb-4 inline-block px-12 relative z-10">
          <PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} placeholder="First Name" className="mr-2" />
          <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} placeholder="Last Name" />
        </h1>
        <div className="text-[11px] font-medium text-slate-500 italic mt-6">
          <PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} placeholder="Email" /> | {phone(pi)} | <PIField pi={pi} field="location" handlers={handlers} errors={errors} editable={editable} placeholder="Location" />
        </div>
        <PIField pi={pi} field="summary" handlers={handlers} errors={errors} editable={editable} multiline as="p" placeholder="Summary…" className="text-[11px] text-slate-500 mt-4 block max-w-xl mx-auto" />
      </header>
      <div className="space-y-16 max-w-3xl mx-auto">
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-center text-slate-300">Core Soft Competencies</h2>
          <SkillsEditor skills={data.skills} onAdd={(s) => handlers?.addSkill(s)} onRemove={(s) => handlers?.removeSkill(s)} editable={editable} suggestions={suggestions} error={errors?.["skills"]} className="grid grid-cols-2 gap-x-16 gap-y-4 px-8 text-center" renderTag={(skill, onRemove) => (
            <div className="relative group/stag text-[11px] font-bold text-slate-700 italic border-b border-slate-50 pb-2 flex items-center justify-between">"{skill}"{editable && onRemove && <button onClick={onRemove} className="text-red-400 hover:text-red-600 opacity-0 group-hover/stag:opacity-100 text-[9px]">×</button>}</div>
          )} />
        </section>
        <section>
          <h2 className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-10">Leadership & Academic Record</h2>
          <EducationBlocks data={data} handlers={handlers} errors={errors} editable={editable}
            renderItem={(edu, i, ef) => (
              <div className="text-center mb-6">
                <div className="font-bold text-2xl mb-2"><EditableField value={edu.institution} onChange={(v) => ef("institution", v)} editable={editable} placeholder="Institution" /></div>
                <div className="text-xs font-medium text-slate-400 mb-2 italic"><EditableField value={edu.degree} onChange={(v) => ef("degree", v)} editable={editable} placeholder="Degree" /> in <EditableField value={edu.field} onChange={(v) => ef("field", v)} editable={editable} placeholder="Field" /></div>
                <div className="text-[10px] font-black text-slate-200 uppercase tracking-tighter">
                  <DateField value={edu.startDate} onChange={(v) => ef("startDate", v)} editable={editable} placeholder="Start" /> - <DateField value={edu.endDate ?? ""} onChange={(v) => ef("endDate", v)} editable={editable} allowPresent placeholder="End" />
                </div>
              </div>
            )}
          />
        </section>
        <section>
          <h2 className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8">Experience</h2>
          <ExperienceBlocks data={data} handlers={handlers} errors={errors} editable={editable}
            renderItem={(exp, i, ef, df, bulletsEl) => (
              <div className="mb-8">
                <div className="font-bold text-lg text-center mb-1"><EditableField value={exp.company} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Organization" /></div>
                <div className="text-xs italic text-slate-500 text-center mb-3"><EditableField value={exp.title} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Role" /></div>
                <div className="text-[11px] text-slate-600">{bulletsEl}</div>
              </div>
            )}
          />
        </section>
      </div>
    </div>
  );
}

// ─── MS Word Classics ──────────────────────────────────────────────────────────

export function WordDarkContemporary({ data, editable, handlers, errors, suggestions }: TemplateProps) {
  const { personalInfo: pi, experience: exp, education: edu, skills, certifications } = data;
  return (
    <div className="w-[800px] h-[1131px] bg-slate-900 text-slate-200 overflow-hidden text-[12px] font-sans p-12 leading-relaxed">
      <div className="mb-6">
        <h1 className="text-4xl text-teal-500 font-serif mb-2"><PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} /> <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} /></h1>
        <div className="text-xs text-slate-400 space-x-2">
          <PIField pi={pi} field="location" handlers={handlers} errors={errors} editable={editable} />
          {pi.phone && <><span>|</span> <PIField pi={pi} field="phone" handlers={handlers} errors={errors} editable={editable} /></>}
          {pi.email && <><span>|</span> <PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} /></>}
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-serif text-teal-500 border-b border-teal-900 pb-1 mb-3">Profile</h2>
          <div className="text-slate-300 text-[11px] leading-relaxed"><PIField pi={pi} field="summary" handlers={handlers} errors={errors} editable={editable} multiline /></div>
        </section>

        <section>
          <h2 className="text-lg font-serif text-teal-500 border-b border-teal-900 pb-1 mb-3">Experience</h2>
          <EditableSection label="Experience" editable={editable} addLabel="Add Experience" onAdd={handlers?.addExperience}>
            {exp.map((e, i) => {
              const ef = (f: any, v: any) => handlers?.updateExperience(e.id, f, v);
              return (
                <EditableSectionItem key={e.id ?? i} editable={editable} onRemove={() => handlers?.removeExperience(e.id)}>
                  <div className="mb-4">
                    <div className="font-bold text-slate-100 uppercase text-[11px] mb-1">
                      <EditableField value={e.title || ""} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Role" /> | <EditableField value={e.company || ""} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" /> | <DateField value={e.startDate || ""} onChange={(v) => ef("startDate", v)} editable={editable} error={errors?.[`experience.${i}.startDate`]} /> - <DateField value={e.endDate || ""} onChange={(v) => ef("endDate", v)} editable={editable} error={errors?.[`experience.${i}.endDate`]} />
                    </div>
                    <EditableBulletList expId={e.id} bullets={e.bullets} onUpdate={handlers?.updateExperienceBullet} onAdd={handlers?.addExperienceBullet} onRemove={handlers?.removeExperienceBullet} editable={editable} errors={errors} index={i} suggestions={suggestions} />
                  </div>
                </EditableSectionItem>
              );
            })}
          </EditableSection>
        </section>

        <section>
          <h2 className="text-lg font-serif text-teal-500 border-b border-teal-900 pb-1 mb-3">Education</h2>
          <EditableSection label="Education" editable={editable} addLabel="Add Education" onAdd={handlers?.addEducation}>
            {edu.map((e, i) => {
              const ef = (f: any, v: any) => handlers?.updateEducation(e.id, f, v);
              return (
                <EditableSectionItem key={e.id ?? i} editable={editable} onRemove={() => handlers?.removeEducation(e.id)}>
                  <div className="mb-3">
                    <div className="font-bold text-slate-100 uppercase text-[11px] mb-1">
                      <EditableField value={e.degree || ""} onChange={(v) => ef("degree", v)} editable={editable} error={errors?.[`education.${i}.degree`]} placeholder="Degree" /> IN <EditableField value={e.field || ""} onChange={(v) => ef("field", v)} editable={editable} error={errors?.[`education.${i}.field`]} placeholder="Field" /> | <DateField value={e.startDate || ""} onChange={(v) => ef("startDate", v)} editable={editable} error={errors?.[`education.${i}.startDate`]} />
                    </div>
                    <div className="text-[11px] text-slate-400 uppercase"><EditableField value={e.institution || ""} onChange={(v) => ef("institution", v)} editable={editable} error={errors?.[`education.${i}.institution`]} placeholder="Institution" /></div>
                  </div>
                </EditableSectionItem>
              );
            })}
          </EditableSection>
        </section>

        <section>
          <h2 className="text-lg font-serif text-teal-500 border-b border-teal-900 pb-1 mb-3">Skills & Abilities</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-slate-300 text-[11px]">
            <SkillsEditor skills={skills} onAdd={(s) => handlers?.addSkill?.(s)} onRemove={(s) => handlers?.removeSkill?.(s)} editable={editable} />
          </div>
        </section>
      </div>
    </div>
  );
}

export function WordChronologicalClassic({ data, editable, handlers, errors, suggestions }: TemplateProps) {
  const { personalInfo: pi, experience: exp, education: edu, skills } = data;
  return (
    <div className="w-[800px] h-[1131px] bg-white text-black overflow-hidden font-serif p-12 text-[12px] leading-normal">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black mb-2 uppercase"><PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} /> <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} /></h1>
        <div className="text-xs space-x-2">
          <PIField pi={pi} field="location" handlers={handlers} errors={errors} editable={editable} />
          {pi.phone && <><span>|</span> <PIField pi={pi} field="phone" handlers={handlers} errors={errors} editable={editable} /></>}
          {pi.email && <><span>|</span> <PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} /></>}
        </div>
      </div>

      <div className="space-y-5">
        <section>
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">Objective</h2>
          <div className="text-[11px] leading-relaxed"><PIField pi={pi} field="summary" handlers={handlers} errors={errors} editable={editable} multiline /></div>
        </section>

        <section>
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">Experience</h2>
          <EditableSection label="Experience" editable={editable} addLabel="Add Experience" onAdd={handlers?.addExperience}>
            {exp.map((e, i) => {
              const ef = (f: any, v: any) => handlers?.updateExperience(e.id, f, v);
              return (
                <EditableSectionItem key={e.id ?? i} editable={editable} onRemove={() => handlers?.removeExperience(e.id)}>
                  <div className="mb-4">
                    <div className="flex justify-between font-bold text-[12px]">
                      <span><EditableField value={e.title || ""} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Title" /></span>
                      <span><DateField value={e.startDate || ""} onChange={(v) => ef("startDate", v)} editable={editable} error={errors?.[`experience.${i}.startDate`]} /> - <DateField value={e.endDate || ""} onChange={(v) => ef("endDate", v)} editable={editable} error={errors?.[`experience.${i}.endDate`]} /></span>
                    </div>
                    <div className="italic text-[11px] mb-1"><EditableField value={e.company || ""} onChange={(v) => ef("company", v)} editable={editable} error={errors?.[`experience.${i}.company`]} placeholder="Company" /></div>
                    <EditableBulletList expId={e.id} bullets={e.bullets} onUpdate={handlers?.updateExperienceBullet} onAdd={handlers?.addExperienceBullet} onRemove={handlers?.removeExperienceBullet} editable={editable} errors={errors} index={i} suggestions={suggestions} />
                  </div>
                </EditableSectionItem>
              );
            })}
          </EditableSection>
        </section>

        <section>
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">Education</h2>
          <EditableSection label="Education" editable={editable} addLabel="Add Education" onAdd={handlers?.addEducation}>
            {edu.map((e, i) => {
              const ef = (f: any, v: any) => handlers?.updateEducation(e.id, f, v);
              return (
                <EditableSectionItem key={e.id ?? i} editable={editable} onRemove={() => handlers?.removeEducation(e.id)}>
                  <div className="mb-3 flex justify-between">
                    <div>
                      <div className="font-bold"><EditableField value={e.institution || ""} onChange={(v) => ef("institution", v)} editable={editable} error={errors?.[`education.${i}.institution`]} placeholder="Institution" /></div>
                      <div className="italic"><EditableField value={e.degree || ""} onChange={(v) => ef("degree", v)} editable={editable} error={errors?.[`education.${i}.degree`]} placeholder="Degree" /> in <EditableField value={e.field || ""} onChange={(v) => ef("field", v)} editable={editable} error={errors?.[`education.${i}.field`]} placeholder="Field" /></div>
                    </div>
                    <div className="font-bold"><DateField value={e.startDate || ""} onChange={(v) => ef("startDate", v)} editable={editable} error={errors?.[`education.${i}.startDate`]} /> - <DateField value={e.endDate || ""} onChange={(v) => ef("endDate", v)} editable={editable} error={errors?.[`education.${i}.endDate`]} /></div>
                  </div>
                </EditableSectionItem>
              );
            })}
          </EditableSection>
        </section>
        
        <section>
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
             <SkillsEditor skills={skills} onAdd={(s) => handlers?.addSkill?.(s)} onRemove={(s) => handlers?.removeSkill?.(s)} editable={editable} />
          </div>
        </section>
      </div>
    </div>
  );
}

export function WordColorSidebar({ data, editable, handlers, errors, suggestions }: TemplateProps) {
  const { personalInfo: pi, experience: exp, education: edu, skills } = data;
  return (
    <div className="w-[800px] h-[1131px] bg-white text-slate-800 flex overflow-hidden font-sans">
      <div className="w-[260px] bg-sky-800 text-sky-50 pt-16 pb-12 px-8 flex flex-col space-y-10">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-sky-300 mb-4 border-b border-sky-400/30 pb-2">Contact</h2>
          <div className="space-y-3 text-[10px]">
            <div><PIField pi={pi} field="location" handlers={handlers} errors={errors} editable={editable} /></div>
            <div><PIField pi={pi} field="phone" handlers={handlers} errors={errors} editable={editable} /></div>
            <div><PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} /></div>
            <div><PIField pi={pi} field="linkedIn" handlers={handlers} errors={errors} editable={editable} placeholder="LinkedIn" /></div>
          </div>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-sky-300 mb-4 border-b border-sky-400/30 pb-2">Skills</h2>
          <div className="space-y-1 text-[10px]">
             <SkillsEditor skills={skills} onAdd={(s) => handlers?.addSkill?.(s)} onRemove={(s) => handlers?.removeSkill?.(s)} editable={editable} />
          </div>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-sky-300 mb-4 border-b border-sky-400/30 pb-2">Education</h2>
          <EditableSection label="Education" editable={editable} addLabel="Add Education" onAdd={handlers?.addEducation}>
            {edu.map((e, i) => {
              const ef = (f: any, v: any) => handlers?.updateEducation(e.id, f, v);
              return (
                <EditableSectionItem key={e.id ?? i} editable={editable} onRemove={() => handlers?.removeEducation(e.id)}>
                  <div className="mb-4 text-[10px]">
                    <div className="font-bold"><EditableField value={e.degree || ""} onChange={(v) => ef("degree", v)} editable={editable} /></div>
                    <div className="opacity-80"><EditableField value={e.institution || ""} onChange={(v) => ef("institution", v)} editable={editable} /></div>
                    <div className="opacity-60 text-[9px]"><DateField value={e.startDate || ""} onChange={(v) => ef("startDate", v)} editable={editable} /> - <DateField value={e.endDate || ""} onChange={(v) => ef("endDate", v)} editable={editable} /></div>
                  </div>
                </EditableSectionItem>
              );
            })}
          </EditableSection>
        </div>
      </div>
      <div className="flex-1 pt-16 pb-12 px-10">
        <h1 className="text-4xl font-light text-slate-900 mb-1"><PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} /></h1>
        <h1 className="text-4xl font-bold text-sky-800 mb-8"><PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} /></h1>
        
        <div className="text-[11px] leading-relaxed text-slate-600 mb-8">
           <PIField pi={pi} field="summary" handlers={handlers} errors={errors} editable={editable} multiline />
        </div>

        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-sky-800 mb-4 border-b border-slate-200 pb-2">Experience</h2>
          <EditableSection label="Experience" editable={editable} addLabel="Add Experience" onAdd={handlers?.addExperience}>
            {exp.map((e, i) => {
              const ef = (f: any, v: any) => handlers?.updateExperience(e.id, f, v);
              return (
                <EditableSectionItem key={e.id ?? i} editable={editable} onRemove={() => handlers?.removeExperience(e.id)}>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-[13px] text-slate-800"><EditableField value={e.title || ""} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Title" /></h3>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-sky-800 font-medium">
                        <DateField value={e.startDate || ""} onChange={(v) => ef("startDate", v)} editable={editable} /> - <DateField value={e.endDate || ""} onChange={(v) => ef("endDate", v)} editable={editable} />
                      </span>
                    </div>
                    <div className="text-sky-700 font-medium text-[11px] mb-2"><EditableField value={e.company || ""} onChange={(v) => ef("company", v)} editable={editable} placeholder="Company" /> | <EditableField value={e.location} onChange={(v) => ef("location", v)} editable={editable} placeholder="Location" /></div>
                    <div className="text-[11px] text-slate-600">
                      <EditableBulletList expId={e.id} bullets={e.bullets} onUpdate={handlers?.updateExperienceBullet} onAdd={handlers?.addExperienceBullet} onRemove={handlers?.removeExperienceBullet} editable={editable} errors={errors} index={i} suggestions={suggestions} />
                    </div>
                  </div>
                </EditableSectionItem>
              );
            })}
          </EditableSection>
        </section>
      </div>
    </div>
  );
}

export function WordInitialsGeometric({ data, editable, handlers, errors, suggestions }: TemplateProps) {
  const { personalInfo: pi, experience: exp, education: edu, skills } = data;
  const initials = `${(pi.firstName?.[0] || 'A').toUpperCase()}${(pi.lastName?.[0] || 'A').toUpperCase()}`;
  return (
    <div className="w-[800px] h-[1131px] bg-slate-50 text-slate-800 flex overflow-hidden font-sans">
      {/* Left thin column for geometric element and time marks */}
      <div className="w-[100px] flex flex-col items-center pt-16">
        <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md mb-8">
          {initials}
        </div>
      </div>
      
      {/* Main content body */}
      <div className="flex-1 pt-16 pr-16 pb-12">
        <h1 className="text-4xl text-emerald-800 font-bold mb-2"><PIField pi={pi} field="firstName" handlers={handlers} errors={errors} editable={editable} /> <PIField pi={pi} field="lastName" handlers={handlers} errors={errors} editable={editable} /></h1>
        <div className="text-[10px] text-slate-500 flex gap-3 mb-6">
          <PIField pi={pi} field="location" handlers={handlers} errors={errors} editable={editable} />
          {pi.phone && <><span>•</span> <PIField pi={pi} field="phone" handlers={handlers} errors={errors} editable={editable} /></>}
          {pi.email && <><span>•</span> <PIField pi={pi} field="email" handlers={handlers} errors={errors} editable={editable} /></>}
        </div>
        
        <div className="text-[11px] text-slate-600 leading-relaxed bg-white p-4 rounded border-l-4 border-emerald-500 shadow-sm mb-8">
           <PIField pi={pi} field="summary" handlers={handlers} errors={errors} editable={editable} multiline />
        </div>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center uppercase tracking-widest text-xs"><span className="w-6 h-px bg-emerald-500 mr-3"></span> Experience</h2>
          <EditableSection label="Experience" editable={editable} addLabel="Add Experience" onAdd={handlers?.addExperience}>
            {exp.map((e, i) => {
              const ef = (f: any, v: any) => handlers?.updateExperience(e.id, f, v);
              return (
                <EditableSectionItem key={e.id ?? i} editable={editable} onRemove={() => handlers?.removeExperience(e.id)}>
                  <div className="mb-5 bg-white p-4 rounded shadow-sm relative">
                    <div className="font-bold text-[12px] text-emerald-800"><EditableField value={e.title || ""} onChange={(v) => ef("title", v)} editable={editable} error={errors?.[`experience.${i}.title`]} placeholder="Title" /></div>
                    <div className="text-[11px] font-medium text-slate-600 mb-1"><EditableField value={e.company || ""} onChange={(v) => ef("company", v)} editable={editable} placeholder="Company" /></div>
                    <div className="text-[10px] text-slate-400 mb-3"><DateField value={e.startDate || ""} onChange={(v) => ef("startDate", v)} editable={editable} /> - <DateField value={e.endDate || ""} onChange={(v) => ef("endDate", v)} editable={editable} /></div>
                    <div className="text-[11px] text-slate-600">
                      <EditableBulletList expId={e.id} bullets={e.bullets} onUpdate={handlers?.updateExperienceBullet} onAdd={handlers?.addExperienceBullet} onRemove={handlers?.removeExperienceBullet} editable={editable} errors={errors} index={i} suggestions={suggestions} />
                    </div>
                  </div>
                </EditableSectionItem>
              );
            })}
          </EditableSection>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center uppercase tracking-widest text-xs"><span className="w-6 h-px bg-emerald-500 mr-3"></span> Education</h2>
          <div className="grid grid-cols-2 gap-4">
          <EditableSection label="Education" editable={editable} addLabel="Add Education" onAdd={handlers?.addEducation}>
            {edu.map((e, i) => {
              const ef = (f: any, v: any) => handlers?.updateEducation(e.id, f, v);
              return (
                <EditableSectionItem key={e.id ?? i} editable={editable} onRemove={() => handlers?.removeEducation(e.id)}>
                  <div className="bg-white p-4 rounded shadow-sm text-[11px]">
                      <div className="font-bold text-emerald-700 mb-1"><EditableField value={e.degree || ""} onChange={(v) => ef("degree", v)} editable={editable} placeholder="Degree" /></div>
                      <div className="text-slate-600 mb-2"><EditableField value={e.institution || ""} onChange={(v) => ef("institution", v)} editable={editable} placeholder="Institution" /></div>
                      <div className="text-slate-400 text-[10px]"><DateField value={e.startDate || ""} onChange={(v) => ef("startDate", v)} editable={editable} /> - <DateField value={e.endDate || ""} onChange={(v) => ef("endDate", v)} editable={editable} /></div>
                  </div>
                </EditableSectionItem>
              );
            })}
          </EditableSection>
          </div>
        </section>
        
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center uppercase tracking-widest text-xs"><span className="w-6 h-px bg-emerald-500 mr-3"></span> Skills</h2>
          <div className="flex flex-wrap gap-2 text-[10px]">
             <SkillsEditor skills={skills} onAdd={(s) => handlers?.addSkill?.(s)} onRemove={(s) => handlers?.removeSkill?.(s)} editable={editable} />
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ResumePreview({ data, templateId, editable, handlers, errors, suggestions }: Props) {
  const idValue = typeof templateId === "string" ? parseInt(templateId, 10) : templateId;
  const layoutId = Math.max(1, Math.min(29, idValue || 1));
  const palette = STRATEGIC_PALETTES[0];
  const props = { data, palette, editable, handlers, errors, suggestions };

  switch (layoutId) {
    case 1:  return <ModernTechLead {...props} />;
    case 2:  return <ExecutiveClassic {...props} />;
    case 3:  return <AcademicGraduate {...props} />;
    case 4:  return <ProfessionalHybrid {...props} />;
    case 5:  return <MedicalHealthcare {...props} />;
    case 6:  return <FinanceAnalyst {...props} />;
    case 7:  return <LegalProfessional {...props} />;
    case 8:  return <SaaSProductLead {...props} />;
    case 9:  return <ConsultantStrategy {...props} />;
    case 10: return <OperationsDirector {...props} />;
    case 11: return <SalesHero {...props} />;
    case 12: return <ProjectManager {...props} />;
    case 13: return <CustomerSuccess {...props} />;
    case 14: return <CreativeTech {...props} />;
    case 15: return <RetailManager {...props} />;
    case 16: return <AIResearchLead {...props} />;
    case 17: return <BackendSystems {...props} />;
    case 18: return <FrontendArchitect {...props} />;
    case 19: return <FullStackScale {...props} />;
    case 20: return <DataInsight {...props} />;
    case 21: return <CloudDevOps {...props} />;
    case 22: return <CyberSecurity {...props} />;
    case 23: return <UniversalStarter {...props} />;
    case 24: return <TechnicalEngineer {...props} />;
    case 25: return <NonTechGeneral {...props} />;
    case 26: return <WordDarkContemporary {...props} />;
    case 27: return <WordChronologicalClassic {...props} />;
    case 28: return <WordColorSidebar {...props} />;
    case 29: return <WordInitialsGeometric {...props} />;
    default: return <ModernTechLead {...props} />;
  }
}
