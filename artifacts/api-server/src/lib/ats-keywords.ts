export const SECTOR_KEYWORDS: Record<string, { categories: Record<string, string[]> }> = {
  tech: {
    categories: {
      languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "SQL", "C++", "Ruby", "Kotlin"],
      frameworks: ["React", "Node.js", "Express", "Django", "Spring", "Vue", "Angular", "FastAPI", "Next.js", "GraphQL"],
      cloud: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD", "DevOps", "Microservices"],
      databases: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "DynamoDB"],
      practices: ["Agile", "Scrum", "TDD", "REST API", "Git", "Code Review", "System Design", "Machine Learning"],
    },
  },
  healthcare: {
    categories: {
      clinical: ["Patient Care", "Clinical Assessment", "Medical Documentation", "HIPAA", "EMR", "EHR"],
      certifications: ["RN", "LPN", "BLS", "ACLS", "CNA", "CPR", "Board Certified"],
      specialties: ["Pharmacology", "Surgical", "ICU", "Emergency", "Pediatrics", "Oncology"],
      soft: ["Compassion", "Communication", "Critical Thinking", "Teamwork", "Patient Advocacy"],
      systems: ["Epic", "Cerner", "Meditech", "Allscripts", "ICD-10", "CPT Coding"],
    },
  },
  finance: {
    categories: {
      skills: ["Financial Analysis", "Financial Modeling", "Valuation", "DCF", "M&A", "Due Diligence"],
      tools: ["Excel", "Bloomberg", "FactSet", "SAP", "QuickBooks", "Tableau", "Power BI"],
      certifications: ["CFA", "CPA", "CFP", "FRM", "Series 7", "Series 63"],
      domains: ["Investment Banking", "Private Equity", "Risk Management", "Compliance", "Portfolio Management"],
      accounting: ["GAAP", "IFRS", "Auditing", "Tax", "Cash Flow", "P&L", "Balance Sheet"],
    },
  },
  marketing: {
    categories: {
      digital: ["SEO", "SEM", "PPC", "Google Analytics", "Google Ads", "Facebook Ads", "Email Marketing"],
      content: ["Content Marketing", "Copywriting", "Brand Strategy", "Social Media", "Content Strategy"],
      tools: ["HubSpot", "Salesforce", "Marketo", "Mailchimp", "Hootsuite", "Adobe Creative Suite"],
      analytics: ["A/B Testing", "Conversion Optimization", "KPI", "ROI", "Data-Driven", "Market Research"],
      soft: ["Creativity", "Strategic Thinking", "Leadership", "Communication", "Project Management"],
    },
  },
  education: {
    categories: {
      teaching: ["Curriculum Development", "Lesson Planning", "Differentiated Instruction", "Assessment"],
      management: ["Classroom Management", "Student Engagement", "Parent Communication", "IEP"],
      technology: ["EdTech", "Google Classroom", "Canvas", "Blackboard", "Online Learning", "LMS"],
      certifications: ["Teaching License", "ESL Certification", "Special Education", "Gifted Certification"],
      skills: ["Critical Thinking", "Mentoring", "Collaboration", "Communication", "Leadership"],
    },
  },
  legal: {
    categories: {
      practice: ["Legal Research", "Contract Drafting", "Litigation", "Due Diligence", "Compliance"],
      specialties: ["Corporate Law", "M&A", "IP Law", "Employment Law", "Real Estate", "Tax Law"],
      tools: ["Westlaw", "LexisNexis", "DocuSign", "Relativity", "iManage"],
      certifications: ["Bar Admission", "JD", "LLM", "Paralegal Certification"],
      skills: ["Negotiation", "Communication", "Attention to Detail", "Research", "Writing"],
    },
  },
  engineering: {
    categories: {
      technical: ["AutoCAD", "SolidWorks", "MATLAB", "FEA", "CAD", "CAM", "Six Sigma"],
      domains: ["Mechanical Engineering", "Civil Engineering", "Electrical Engineering", "Chemical Engineering"],
      skills: ["Project Management", "Problem Solving", "Design", "Testing", "Quality Assurance"],
      certifications: ["PE License", "PMP", "Six Sigma Black Belt", "ISO 9001"],
      software: ["ANSYS", "Pro/E", "Revit", "Primavera", "MS Project", "Python", "MATLAB"],
    },
  },
  sales: {
    categories: {
      skills: ["Sales Strategy", "Account Management", "Lead Generation", "CRM", "Pipeline Management"],
      tools: ["Salesforce", "HubSpot", "ZoomInfo", "LinkedIn Sales Navigator", "Outreach", "Gong"],
      metrics: ["Quota Achievement", "Revenue Growth", "ARR", "MRR", "Churn", "NPS", "CLV"],
      techniques: ["Solution Selling", "SPIN Selling", "Consultative Selling", "Negotiation", "Cold Calling"],
      soft: ["Communication", "Persistence", "Relationship Building", "Strategic Thinking", "Leadership"],
    },
  },
};

export const SOFT_SKILLS = [
  "leadership", "communication", "teamwork", "collaboration", "problem solving",
  "critical thinking", "adaptability", "time management", "creativity", "emotional intelligence",
  "conflict resolution", "mentoring", "strategic thinking", "agile", "presentation"
];

export const IMPACT_VERBS = [
  "spearheaded", "engineered", "optimized", "increased", "reduced", "delivered",
  "implemented", "orchestrated", "transformed", "generated", "leveraged"
];

export function getKeywordsForSector(sector: string): { keywords: string[]; categories: Record<string, string[]> } {
  const data = SECTOR_KEYWORDS[sector as keyof typeof SECTOR_KEYWORDS] || SECTOR_KEYWORDS["tech"];
  const keywords = Object.values(data.categories).flat();
  return { keywords, categories: data.categories };
}

export function calculateAtsScore(resumeText: string, sector: string, jobDescription?: string): {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  suitability?: string;
  detailCheck?: {
    skillsMatch: "match" | "partial" | "gap";
    experienceMatch: "match" | "partial" | "gap";
    educationMatch: "match" | "partial" | "gap";
  };
  breakdown: { 
    keywordMatch: number; formatting: number; experience: number; 
    education: number; customization: number; impact: number; softSkills: number 
  };
} {
  const { keywords: sectorKeywords } = getKeywordsForSector(sector);
  const textLower = resumeText.toLowerCase();
  
  // --- Smart JD Keyword Extraction ---
  let targetKeywords = sectorKeywords;
  const jdMissingFromResume: string[] = [];
  let isStrictTargeted = false;

  if (jobDescription && jobDescription.length > 20) {
    isStrictTargeted = true;
    const jdLower = jobDescription.toLowerCase();
    
    // --- Smart JD Keyword Extraction with Massive Stopwords ---
    const stopwords = new Set([
      "the", "we", "and", "this", "ideal", "key", "apply", "good", "ability", "work", 
      "responsibilities", "qualifications", "preferred", "essential", "required", "strong", 
      "knowledge", "experience", "skills", "candidate", "role", "involves", "developing", 
      "maintaining", "designing", "implement", "they", "bridge", "ensure", "including", 
      "using", "such", "field", "proven", "excellent", "attention", "detail", "communication",
      "written", "verbal", "minimum", "years", "plus", "related", "computer", "science",
      "technology", "information", "build", "stay", "develop", "participate", "contribute",
      "sharing", "team", "collaborate", "optimize", "ensuring", "job", "title", "summary", 
      "description", "location", "employment", "type", "full-time", "on-site", "join", 
      "focus", "building", "high-quality", "opportunity", "enabling", "better", "closely",
      "understand", "occasionally", "assist", "minor", "updates", "troubleshooting",
      "awareness", "write", "verify", "integrity", "issues", "various", "various", "must-have"
    ]);

    // Better Regex to catch .NET, C#, C++, etc.
    const dynamicJdKeywords = (jobDescription.match(/\b(\.NET|C#|C\+\+|[A-Z][a-zA-Z0-9.#+]*|MVC|SQL|API|WCF|XML|CSS|UI|UX|JSON|HTML5|CSS3|Angular|Vue\.js)\b/g) || [])
      .filter(kw => !stopwords.has(kw.toLowerCase()) && kw.length > 1);
    
    const knownJdKeywords = sectorKeywords.filter(kw => jdLower.includes(kw.toLowerCase()));
    
    // Combine and deduplicate
    targetKeywords = Array.from(new Set([...dynamicJdKeywords, ...knownJdKeywords]));
  }

  // 1. Keyword Match (Hard Skills) - 30% Weight
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  for (const kw of targetKeywords) {
    const regex = new RegExp(`\\b${kw.toLowerCase().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'g');
    if (regex.test(textLower)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  // If in Targeted Match, the missingKeywords ARE the jdMissingFromResume
  if (isStrictTargeted) {
    jdMissingFromResume.push(...missingKeywords);
  }

  const keywordScore = targetKeywords.length > 0 ? Math.min(100, Math.round((matchedKeywords.length / Math.min(targetKeywords.length, 15)) * 100)) : 0;

  // 2. Formatting & Structure - 15% Weight
  const segments = ["education", "experience", "skills", "summary", "contact", "projects", "certifications"];
  const foundSegments = segments.filter(s => textLower.includes(s));
  const hasContactInfo = /[a-zA-Z0-9._%+-]+@/.test(resumeText) && /[\d\-\(\)\+\s]{10,}/.test(resumeText);
  const formattingScore = Math.round(
    (foundSegments.length / segments.length) * 60 + (hasContactInfo ? 40 : 0)
  );

  // 3. Experience & 4. Education - 10% Each
  const experienceDepth = (resumeText.match(/\b(senior|lead|manager|director|vp|head|years|since|until)\b/gi) || []).length;
  const experienceScore = Math.min(100, (experienceDepth * 8) + 30);
  const hasAcademicDegree = /\b(bachelor|master|phd|b\.s|m\.s|university|college|graduate)\b/i.test(resumeText);
  const educationScore = hasAcademicDegree ? 95 : 40;

  // 5. High-Accuracy Impact (Metric Detection) - 15% Weight
  const metrics = (resumeText.match(/(\d+(?:%|\+|\s?k|\s?m|\s?b|\s?units|x)|(?:\$|£|€)\s?\d+)/gi) || []);
  const metricVariety = new Set(metrics).size;
  let impactScore = (metricVariety * 15) + (textLower.match(/\b(increased|reduced|delivered|generated|optimized|spearheaded)\b/g)?.length || 0) * 8;
  impactScore = Math.min(100, Math.max(0, impactScore));

  // 6. Soft Skills Semantic Scan - 10% Weight
  let softSkillsMatched = 0;
  for (const skill of SOFT_SKILLS) {
    if (textLower.includes(skill)) softSkillsMatched++;
  }
  const softSkillsScore = Math.min(100, Math.round((softSkillsMatched / 4) * 100));

  // 7. Customization (Targeted Match Bias) - 10% Weight
  let customizationScore = 55; // Baseline
  
  // --- Targeted Match Variables ---
  let suitability: string | undefined;
  let detailCheck: any | undefined;

  if (isStrictTargeted && jobDescription) {
    const jdLower = jobDescription.toLowerCase();
    
    // Check which JD-specific keywords are in the resume
    const jdMatches = targetKeywords.filter(kw => textLower.includes(kw.toLowerCase()));
    
    customizationScore = targetKeywords.length > 0
      ? Math.round((jdMatches.length / targetKeywords.length) * 100)
      : 80;

    // --- Experience Gap Analysis ---
    const jdYearsMatch = jdLower.match(/(\d+)\+?\s*years/);
    const jdSeniority = /\b(senior|lead|staff|principal|manager|head|director)\b/i.test(jdLower);
    const resSeniority = /\b(senior|lead|staff|principal|manager|head|director)\b/i.test(textLower);
    
    let expStatus: "match" | "partial" | "gap" = "match";
    const requiredYears = jdYearsMatch ? parseInt(jdYearsMatch[1]) : 0;
    
    // Logic: If they ask for 5+ years and you don't have senior titles OR it's an internship
    if (requiredYears >= 3 && !resSeniority) {
      expStatus = requiredYears > 5 ? "gap" : "partial";
    }
    if (textLower.includes("intern") && requiredYears > 2) {
      expStatus = "gap";
    }

    // --- Education Gap Analysis ---
    const jdMasterReq = /\b(master|ms|ma|mba|postgrad)\b/i.test(jdLower);
    const resMaster = /\b(master|ms|ma|mba|postgrad)\b/i.test(textLower);
    
    let eduStatus: "match" | "partial" | "gap" = "match";
    if (jdMasterReq && !resMaster) eduStatus = "gap";
    else if (!hasAcademicDegree) eduStatus = "partial";

    detailCheck = {
      skillsMatch: customizationScore > 80 ? "match" : (customizationScore > 40 ? "partial" : "gap"),
      experienceMatch: expStatus,
      educationMatch: eduStatus,
    };
  }

  // FINAL SCORING (Weighted Model)
  let overallScore = Math.round(
    (keywordScore * 0.30) + 
    (formattingScore * 0.15) + 
    (experienceScore * 0.10) + 
    (educationScore * 0.10) + 
    (impactScore * 0.15) + 
    (softSkillsScore * 0.10) + 
    (customizationScore * 0.10)
  );

  if (jobDescription) {
    if (overallScore > 85) suitability = "Highly Suitable";
    else if (overallScore > 70) suitability = "Strong Match";
    else if (overallScore > 50) suitability = "Moderate Match";
    else suitability = "Potential Gap";
  }

  // --- Contextual Example Helpers ---
  const sentences = resumeText.split(/[.!?]\s+/).filter(s => s.length > 10);
  const findWeakSentence = (type: "metric" | "verb") => {
    if (type === "metric") {
      return sentences.find(s => !/(\d|%|\$)/.test(s))?.trim();
    }
    return sentences.find(s => s.toLowerCase().startsWith("helped") || s.toLowerCase().startsWith("worked") || s.toLowerCase().startsWith("responsible"))?.trim();
  };

  const suggestions: string[] = [];
  
  // 1. Impact Suggestion
  if (impactScore < 70) {
    const weak = findWeakSentence("metric");
    let msg = "Quantifiable Impact: Add specific metrics (%, $, numbers) to demonstrate tangible achievements.";
    if (weak) msg += `\nExample: "${weak.slice(0, 40)}..." → "${weak.slice(0, 30)}... increasing efficiency by 20%."`;
    suggestions.push(msg);
  }

  // 2. Keyword Suggestion
  if (keywordScore < 80) {
    const missing = missingKeywords.slice(0, 2);
    let msg = `Skill Density: Increase frequency of key technical terms like ${missing.join(", ")} to improve searchability.`;
    if (missing.length > 0) {
      msg += `\nExample: "Experienced in software development..." → "Experienced in software development using ${missing.join(" and ")}..."`;
    }
    suggestions.push(msg);
  }
  
  // 3. Targeted Suggestion (Deep Gap Analysis)
  if (jobDescription && jobDescription.length > 20) {
    if (jdMissingFromResume.length > 0) {
      const topMissing = jdMissingFromResume.slice(0, 3);
      let msg = `Targeted Match: Your resume is missing critical technical terms found in the Job Description: ${topMissing.join(", ")}.`;
      
      // AI Generated Gap Closure Suggestion
      msg += `\nExample: "Professional with experience in ${sector}..." → "Strategic ${sector} specialist with deep expertise in ${topMissing.join(", ")} and related modern architectures."`;
      suggestions.push(msg);
    } else if (customizationScore > 90) {
      suggestions.push("Role Alignment: Your technical stack perfectly matches this job description! Ensure your professional summary highlights your most relevant achievement for this specific role.");
    }
  }

  // 4. Formatting Suggestion
  if (formattingScore < 90) {
    suggestions.push("Document Structure: Ensure clear headings and consistent bullet point usage for better parsing.");
  }

  // 5. Verb Suggestion
  if (overallScore < 75) {
    const weak = findWeakSentence("verb");
    let msg = "Executive Presence: Use high-impact action verbs (e.g., spearheaded, optimized) to describe your roles.";
    if (weak) {
      msg += `\nExample: "${weak.slice(0, 40)}..." → "Spearheaded ${weak.toLowerCase().replace(/^(helped|worked|responsible for|developed|designed)\s+/i, "")}..."`;
    } else {
      msg += `\nExample: "Worked on API development..." → "Engineered and optimized high-performance API architectures..."`;
    }
    suggestions.push(msg);
  }

  return {
    score: Math.min(100, Math.max(0, overallScore)),
    matchedKeywords: Array.from(new Set(matchedKeywords)).slice(0, 15),
    missingKeywords: Array.from(new Set([...missingKeywords, ...jdMissingFromResume])).slice(0, 10),
    suggestions,
    suitability,
    detailCheck,
    breakdown: {
      keywordMatch: keywordScore,
      formatting: formattingScore,
      experience: experienceScore,
      education: educationScore,
      customization: customizationScore,
      impact: impactScore,
      softSkills: softSkillsScore,
    },
  };
}
