import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  GraduationCap,
  Briefcase,
  Maximize2,
  Stethoscope,
  TrendingUp,
  Scale,
  Rocket,
  Search,
  Settings,
  DollarSign,
  ClipboardList,
  HeartHandshake,
  Palette,
  Store,
  Brain,
  Terminal,
  Layers,
  Database,
  LineChart,
  Cloud,
  ShieldAlert,
  GraduationCap as StudentIcon,
  Monitor
} from "lucide-react";

// Strategic Engine Imports
import {
  ModernTechLead,
  ExecutiveClassic,
  AcademicGraduate,
  ProfessionalHybrid,
  MedicalHealthcare,
  FinanceAnalyst,
  LegalProfessional,
  SaaSProductLead,
  ConsultantStrategy,
  OperationsDirector,
  SalesHero,
  ProjectManager,
  CustomerSuccess,
  CreativeTech,
  RetailManager,
  AIResearchLead,
  BackendSystems,
  FrontendArchitect,
  FullStackScale,
  DataInsight,
  CloudDevOps,
  CyberSecurity,
  UniversalStarter,
  TechnicalEngineer,
  NonTechGeneral,
  WordDarkContemporary,
  WordChronologicalClassic,
  WordColorSidebar,
  WordInitialsGeometric,
  STRATEGIC_PALETTES
} from "@/components/ResumePreview";
import { MOCK_USER } from "@/components/mock-data";

/**
 * CATEGORY DEFINITIONS
 */
const CATEGORIES = [
  { id: "all", name: "All Strategies" },
  { id: "tech", name: "Software & AI" },
  { id: "leadership", name: "Management" },
  { id: "fresher", name: "Entry Level" },
  { id: "specialized", name: "Specialized" },
  { id: "word-classics", name: "MS Classics" },
];

/**
 * STRATEGIC TEMPLATE DEFINITIONS (FULL 25)
 */
const STRATEGIC_TEMPLATES = [
  { id: 1, category: "tech", name: "Modern Tech Lead", Component: ModernTechLead, icon: Zap, description: "Minimalist, specialized for Technical Projects.", accent: "#334155" },
  { id: 2, category: "leadership", name: "Executive Classic", Component: ExecutiveClassic, icon: ShieldCheck, description: "Traditional serif, dense and metric-focused.", accent: "#1e293b" },
  { id: 3, category: "fresher", name: "Academic Graduate", Component: AcademicGraduate, icon: GraduationCap, description: "Prioritizes Education and Internships for students.", accent: "#064e3b" },
  { id: 4, category: "leadership", name: "Professional Hybrid", Component: ProfessionalHybrid, icon: Briefcase, description: "Balanced design for general corporate roles.", accent: "#7f1d1d" },
  { id: 5, category: "specialized", name: "Medical Specialist", Component: MedicalHealthcare, icon: Stethoscope, description: "Focuses on Clinical Certs and Licensing.", accent: "#059669" },
  { id: 6, category: "specialized", name: "Finance Analyst", Component: FinanceAnalyst, icon: TrendingUp, description: "Rigid hierarchy for quantitative achievement.", accent: "#0f172a" },
  { id: 7, category: "specialized", name: "Legal Professional", Component: LegalProfessional, icon: Scale, description: "High-sobriety design for Casework & Bar status.", accent: "#000000" },
  { id: 8, category: "leadership", name: "SaaS Product Lead", Component: SaaSProductLead, icon: Rocket, description: "KPI-centric layout for product & revenue growth.", accent: "#4f46e5" },
  { id: 9, category: "leadership", name: "Consulting Strategy", Component: ConsultantStrategy, icon: Search, description: "Project-based view for high-impact engagements.", accent: "#64748b" },
  { id: 10, category: "leadership", name: "Operations Director", Component: OperationsDirector, icon: Settings, description: "Bold sections for process optimization metrics.", accent: "#111827" },
  { id: 11, category: "specialized", name: "Sales Sales Hero", Component: SalesHero, icon: DollarSign, description: "Revenue-focused design for quota achievers.", accent: "#e11d48" },
  { id: 12, category: "leadership", name: "Project Manager", Component: ProjectManager, icon: ClipboardList, description: "Lifecycle-focused with clear methodology blocks.", accent: "#0f172a" },
  { id: 13, category: "specialized", name: "Customer Success", Component: CustomerSuccess, icon: HeartHandshake, description: "Refined view for retention and growth metrics.", accent: "#2563eb" },
  { id: 14, category: "tech", name: "Creative Tech", Component: CreativeTech, icon: Palette, description: "Modern sans-serif with strong technical stack.", accent: "#f97316" },
  { id: 15, category: "specialized", name: "Retail Operations", Component: RetailManager, icon: Store, description: "Focuses on multi-unit staff and sales volume.", accent: "#334155" },
  { id: 16, category: "tech", name: "AI Research Lead", Component: AIResearchLead, icon: Brain, description: "Prioritizes Publications, Models, and Research Labs.", accent: "#0f172a" },
  { id: 17, category: "tech", name: "Backend Systems", Component: BackendSystems, icon: Terminal, description: "Emphasizes API design, latency, and DB scaling.", accent: "#334155" },
  { id: 18, category: "tech", name: "Frontend Architect", Component: FrontendArchitect, icon: Layers, description: "Modern design focused on Component Architecture.", accent: "#4f46e5" },
  { id: 19, category: "tech", name: "Full Stack Scale", Component: FullStackScale, icon: Database, description: "Balanced layout for microservices & end-to-end impact.", accent: "#1e293b" },
  { id: 20, category: "tech", name: "Data Insight", Component: DataInsight, icon: LineChart, description: "Statistical view for model impact and analytical case studies.", accent: "#64748b" },
  { id: 21, category: "tech", name: "Cloud DevOps Hero", Component: CloudDevOps, icon: Cloud, description: "Infra-focused design emphasizing CI/CD and SLA metrics.", accent: "#0f172a" },
  { id: 22, category: "tech", name: "Cybersecurity Analyst", Component: CyberSecurity, icon: ShieldAlert, description: "Audit-ready view for threat intel and hardening.", accent: "#10b981" },
  { id: 23, category: "fresher", name: "Universal Starter", Component: UniversalStarter, icon: StudentIcon, description: "Optimal for candidates with zero work experience.", accent: "#334155" },
  { id: 24, category: "fresher", name: "Technical Engineer", Component: TechnicalEngineer, icon: Monitor, description: "Hoists Lab Work and technical contests for freshers.", accent: "#1e293b" },
  { id: 25, category: "fresher", name: "Non-Tech General", Component: NonTechGeneral, icon: GraduationCap, description: "Emphasizes soft skills and volunteer leadership.", accent: "#7f1d1d" },
  { id: 26, category: "word-classics", name: "Word Dark", Component: WordDarkContemporary, icon: Palette, description: "The iconic dark mode modern template.", accent: "#0f172a" },
  { id: 27, category: "word-classics", name: "Word Classic Chronological", Component: WordChronologicalClassic, icon: Briefcase, description: "The definitive traditional Word resume.", accent: "#000000" },
  { id: 28, category: "word-classics", name: "Word Color Sidebar", Component: WordColorSidebar, icon: Layers, description: "Standard modern two-column profile.", accent: "#0369a1" },
  { id: 29, category: "word-classics", name: "Word Initials", Component: WordInitialsGeometric, icon: StudentIcon, description: "Built-in initials branding style.", accent: "#059669" },
];

function LiveTemplatePreview({ templateId }: { templateId: number }) {
  const template = STRATEGIC_TEMPLATES.find(t => t.id === templateId);
  if (!template) return null;

  const { Component } = template;
  const palette = STRATEGIC_PALETTES[0];

  return (
    <div className="relative w-full aspect-[8.5/11] bg-white rounded-xl overflow-hidden border border-slate-200 shadow-inner group/preview">
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: "800px",
          transform: "scale(0.35)",
          pointerEvents: "none"
        }}
      >
        <Component data={MOCK_USER} palette={palette} />
      </div>
      <div className="absolute inset-0 bg-slate-900/0 group-hover/preview:bg-slate-900/5 transition-all duration-300 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-2xl scale-0 group-hover/preview:scale-100 transition-transform duration-300">
          <Maximize2 className="w-5 h-5 text-slate-900" />
        </div>
      </div>
    </div>
  );
}

export default function Templates() {
  const [, setLocation] = useLocation();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const handleUseTemplate = (id: number) => {
    setLocation(`/resumes/new?templateId=${id}`);
  };

  const filteredTemplates = STRATEGIC_TEMPLATES.filter(t =>
    activeCategory === "all" || t.category === activeCategory
  );

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-8 py-16 lg:py-24 text-foreground">
        {/* Header */}
        <div className="text-center space-y-6 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border border-indigo-100"
          >
            <Sparkles className="w-3.5 h-3.5" />
            25+ Industry Strategic Resumes
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900"
          >
            The Elite Suite
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg font-medium max-w-2xl mx-auto leading-relaxed"
          >
            A massive library of 25 recruitment-grade layouts. Filter by your industry
            to find the perfect high-contrast, 95+ ATS architecture.
          </motion.p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border",
                activeCategory === cat.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200"
                  : "bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-600"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
          >
            {filteredTemplates.map((template, idx) => {
              const Icon = template.icon;
              return (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onMouseEnter={() => setHoveredId(template.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group flex flex-col bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-indigo-100 relative overflow-visible"
                >
                  <div className="mb-8 relative z-10">
                    <motion.div
                      animate={{ scale: hoveredId === template.id ? 1.05 : 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <LiveTemplatePreview templateId={template.id} />
                    </motion.div>
                  </div>

                  <div className="space-y-3 mb-8 px-2 flex-grow">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-50 text-slate-800">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                        {template.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      {template.description}
                    </p>
                  </div>

                  <Button
                    onClick={() => handleUseTemplate(template.id)}
                    className="w-full h-12 text-xs font-black uppercase tracking-[0.2em] bg-slate-900 hover:bg-indigo-600 text-white transition-all rounded-2xl shadow-xl shadow-slate-200 hover:shadow-indigo-200 border-none relative overflow-hidden group/btn"
                  >
                    <span className="relative z-10">Apply Strategy</span>
                  </Button>

                  <AnimatePresence>
                    {hoveredId === template.id && (
                      <motion.div
                        initial={{ scale: 0, rotate: 0, opacity: 0 }}
                        animate={{ scale: 1, rotate: -12, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -top-4 -right-4 z-20"
                      >
                        <div className="bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black shadow-2xl">
                          95+ ATS
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
