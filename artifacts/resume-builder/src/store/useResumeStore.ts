import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface ResumePersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  location: string;
  linkedIn: string;
  websites: string[];
  summary: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface ResumeProject {
  id: string;
  title: string;
  link: string;
  bullets: string[];
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeData {
  personalInfo: ResumePersonalInfo;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  skills: string[];
  certifications: ResumeCertification[];
}

export interface ValidationErrors {
  [key: string]: string;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export const defaultResumeData: ResumeData = {
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+91",
    phone: "",
    location: "",
    linkedIn: "",
    websites: [],
    summary: "",
  },
  experience: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
};

function validateResumeData(data: ResumeData): ValidationErrors {
  const errors: ValidationErrors = {};
  const pi = data.personalInfo;

  if (!pi.firstName.trim()) errors["personalInfo.firstName"] = "First name is required";
  if (!pi.lastName.trim()) errors["personalInfo.lastName"] = "Last name is required";
  if (!pi.email.trim()) errors["personalInfo.email"] = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pi.email)) errors["personalInfo.email"] = "Invalid email format";
  if (!pi.phone.trim()) errors["personalInfo.phone"] = "Phone is required";
  else if (!/^\d{10}$/.test(pi.phone.replace(/\D/g, ""))) errors["personalInfo.phone"] = "Phone must be 10 digits";
  if (!pi.location.trim()) errors["personalInfo.location"] = "Location is required";
  if (!pi.summary.trim()) errors["personalInfo.summary"] = "Summary is required";
  else if (pi.summary.trim().length < 50) errors["personalInfo.summary"] = "Summary should be at least 50 characters";

  data.experience.forEach((exp, i) => {
    if (!exp.company.trim()) errors[`experience.${i}.company`] = "Company is required";
    if (!exp.title.trim()) errors[`experience.${i}.title`] = "Job title is required";
    if (!exp.startDate) errors[`experience.${i}.startDate`] = "Start date is required";
    if (exp.bullets.length === 0 || exp.bullets.every(b => !b.trim()))
      errors[`experience.${i}.bullets`] = "At least one bullet is required";
    exp.bullets.forEach((b, j) => {
      if (!b.trim()) errors[`experience.${i}.bullets.${j}`] = "Bullet cannot be empty";
    });
  });

  data.education.forEach((edu, i) => {
    if (!edu.institution.trim()) errors[`education.${i}.institution`] = "Institution is required";
    if (!edu.degree.trim()) errors[`education.${i}.degree`] = "Degree is required";
    if (!edu.field.trim()) errors[`education.${i}.field`] = "Field of study is required";
    if (!edu.startDate) errors[`education.${i}.startDate`] = "Start date is required";
  });

  if (data.skills.length < 3) errors["skills"] = "Add at least 3 skills";

  return errors;
}

interface ResumeStore {
  resumeId: number | null;
  resumeTitle: string;
  sector: string;
  templateId: number;
  data: ResumeData;
  validationErrors: ValidationErrors;
  isDirty: boolean;
  atsResult: { score: number; matchedKeywords: string[]; missingKeywords: string[] } | null;

  // Setters
  setResumeId: (id: number | null) => void;
  setResumeTitle: (title: string) => void;
  setSector: (sector: string) => void;
  setTemplateId: (id: number) => void;
  setAtsResult: (result: ResumeStore["atsResult"]) => void;
  loadResume: (resumeId: number | null, title: string, sector: string, templateId: number, data: Partial<ResumeData>) => void;
  resetResume: () => void;

  // Personal info
  updatePersonalInfo: (field: keyof ResumePersonalInfo, value: string | string[]) => void;

  // Experience
  addExperience: () => string;
  removeExperience: (id: string) => void;
  updateExperience: (id: string, field: keyof ResumeExperience, value: string | string[]) => void;
  updateExperienceBullet: (expId: string, bulletIndex: number, value: string) => void;
  addExperienceBullet: (expId: string) => void;
  removeExperienceBullet: (expId: string, bulletIndex: number) => void;

  // Education
  addEducation: () => string;
  removeEducation: (id: string) => void;
  updateEducation: (id: string, field: keyof ResumeEducation, value: string) => void;

  // Projects
  addProject: () => string;
  removeProject: (id: string) => void;
  updateProject: (id: string, field: keyof ResumeProject, value: string | string[]) => void;
  updateProjectBullet: (projId: string, bulletIndex: number, value: string) => void;
  addProjectBullet: (projId: string) => void;
  removeProjectBullet: (projId: string, bulletIndex: number) => void;

  // Skills
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  setSkills: (skills: string[]) => void;

  // Certifications
  addCertification: () => string;
  removeCertification: (id: string) => void;
  updateCertification: (id: string, field: keyof ResumeCertification, value: string) => void;

  // Validation
  validate: () => boolean;
  clearValidationError: (key: string) => void;
}

function computeErrors(state: ResumeStore) {
  return validateResumeData(state.data);
}

export const useResumeStore = create<ResumeStore>()(
  subscribeWithSelector((set, get) => ({
    resumeId: null,
    resumeTitle: "My Resume",
    sector: "tech",
    templateId: 1,
    data: { ...defaultResumeData },
    validationErrors: {},
    isDirty: false,
    atsResult: null,

    setResumeId: (id) => set({ resumeId: id }),
    setResumeTitle: (title) => set({ resumeTitle: title, isDirty: true }),
    setSector: (sector) => set({ sector, isDirty: true }),
    setTemplateId: (id) => set({ templateId: id }),
    setAtsResult: (result) => set({ atsResult: result }),

    loadResume: (resumeId, title, sector, templateId, incoming) => {
      const data: ResumeData = {
        personalInfo: { ...defaultResumeData.personalInfo, ...incoming.personalInfo },
        experience: (incoming.experience || []).map((e: any) => ({ ...e, id: e.id || uid() })),
        education: (incoming.education || []).map((e: any) => ({ ...e, id: e.id || uid() })),
        projects: (incoming.projects || []).map((p: any) => ({ ...p, id: p.id || uid() })),
        skills: incoming.skills || [],
        certifications: (incoming.certifications || []).map((c: any) => ({ ...c, id: c.id || uid() })),
      };
      set({ resumeId, resumeTitle: title, sector, templateId, data, isDirty: false, validationErrors: {} });
    },

    resetResume: () =>
      set({ resumeId: null, resumeTitle: "My Resume", sector: "tech", templateId: 1, data: { ...defaultResumeData }, isDirty: false, validationErrors: {}, atsResult: null }),

    updatePersonalInfo: (field, value) =>
      set((s) => {
        const data = { ...s.data, personalInfo: { ...s.data.personalInfo, [field]: value } };
        const validationErrors = { ...s.validationErrors };
        delete validationErrors[`personalInfo.${field}`];
        return { data, isDirty: true, validationErrors };
      }),

    addExperience: () => {
      const id = uid();
      set((s) => ({
        data: {
          ...s.data,
          experience: [...s.data.experience, { id, company: "", title: "", location: "", startDate: "", endDate: "", bullets: [""] }],
        },
        isDirty: true,
      }));
      return id;
    },

    removeExperience: (id) =>
      set((s) => ({ data: { ...s.data, experience: s.data.experience.filter((e) => e.id !== id) }, isDirty: true })),

    updateExperience: (id, field, value) =>
      set((s) => {
        const experience = s.data.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e));
        const idx = s.data.experience.findIndex((e) => e.id === id);
        const validationErrors = { ...s.validationErrors };
        delete validationErrors[`experience.${idx}.${field}`];
        return { data: { ...s.data, experience }, isDirty: true, validationErrors };
      }),

    updateExperienceBullet: (expId, bulletIndex, value) =>
      set((s) => {
        const experience = s.data.experience.map((e) => {
          if (e.id !== expId) return e;
          const bullets = [...e.bullets];
          bullets[bulletIndex] = value;
          return { ...e, bullets };
        });
        return { data: { ...s.data, experience }, isDirty: true };
      }),

    addExperienceBullet: (expId) =>
      set((s) => {
        const experience = s.data.experience.map((e) => e.id === expId ? { ...e, bullets: [...e.bullets, ""] } : e);
        return { data: { ...s.data, experience }, isDirty: true };
      }),

    removeExperienceBullet: (expId, bulletIndex) =>
      set((s) => {
        const experience = s.data.experience.map((e) => {
          if (e.id !== expId) return e;
          return { ...e, bullets: e.bullets.filter((_, i) => i !== bulletIndex) };
        });
        return { data: { ...s.data, experience }, isDirty: true };
      }),

    addEducation: () => {
      const id = uid();
      set((s) => ({
        data: { ...s.data, education: [...s.data.education, { id, institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "" }] },
        isDirty: true,
      }));
      return id;
    },

    removeEducation: (id) =>
      set((s) => ({ data: { ...s.data, education: s.data.education.filter((e) => e.id !== id) }, isDirty: true })),

    updateEducation: (id, field, value) =>
      set((s) => ({
        data: { ...s.data, education: s.data.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)) },
        isDirty: true,
      })),

    addProject: () => {
      const id = uid();
      set((s) => ({
        data: { ...s.data, projects: [...s.data.projects, { id, title: "", link: "", bullets: [""] }] },
        isDirty: true,
      }));
      return id;
    },

    removeProject: (id) =>
      set((s) => ({ data: { ...s.data, projects: s.data.projects.filter((p) => p.id !== id) }, isDirty: true })),

    updateProject: (id, field, value) =>
      set((s) => ({
        data: { ...s.data, projects: s.data.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)) },
        isDirty: true,
      })),

    updateProjectBullet: (projId, bulletIndex, value) =>
      set((s) => {
        const projects = s.data.projects.map((p) => {
          if (p.id !== projId) return p;
          const bullets = [...p.bullets];
          bullets[bulletIndex] = value;
          return { ...p, bullets };
        });
        return { data: { ...s.data, projects }, isDirty: true };
      }),

    addProjectBullet: (projId) =>
      set((s) => ({
        data: { ...s.data, projects: s.data.projects.map((p) => p.id === projId ? { ...p, bullets: [...p.bullets, ""] } : p) },
        isDirty: true,
      })),

    removeProjectBullet: (projId, bulletIndex) =>
      set((s) => ({
        data: {
          ...s.data,
          projects: s.data.projects.map((p) => p.id === projId ? { ...p, bullets: p.bullets.filter((_, i) => i !== bulletIndex) } : p),
        },
        isDirty: true,
      })),

    addSkill: (skill) =>
      set((s) => {
        if (s.data.skills.includes(skill)) return s;
        const validationErrors = { ...s.validationErrors };
        if (s.data.skills.length >= 2) delete validationErrors["skills"];
        return { data: { ...s.data, skills: [...s.data.skills, skill] }, isDirty: true, validationErrors };
      }),

    removeSkill: (skill) =>
      set((s) => ({ data: { ...s.data, skills: s.data.skills.filter((sk) => sk !== skill) }, isDirty: true })),

    setSkills: (skills) => set((s) => ({ data: { ...s.data, skills }, isDirty: true })),

    addCertification: () => {
      const id = uid();
      set((s) => ({
        data: { ...s.data, certifications: [...s.data.certifications, { id, name: "", issuer: "", date: "" }] },
        isDirty: true,
      }));
      return id;
    },

    removeCertification: (id) =>
      set((s) => ({ data: { ...s.data, certifications: s.data.certifications.filter((c) => c.id !== id) }, isDirty: true })),

    updateCertification: (id, field, value) =>
      set((s) => ({
        data: { ...s.data, certifications: s.data.certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c)) },
        isDirty: true,
      })),

    validate: () => {
      const errors = validateResumeData(get().data);
      set({ validationErrors: errors });
      return Object.keys(errors).length === 0;
    },

    clearValidationError: (key) =>
      set((s) => {
        const validationErrors = { ...s.validationErrors };
        delete validationErrors[key];
        return { validationErrors };
      }),
  }))
);
