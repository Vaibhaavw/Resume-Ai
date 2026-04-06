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

export function getKeywordsForSector(sector: string): { keywords: string[]; categories: Record<string, string[]> } {
  const normalized = sector.toLowerCase().replace(/\s+/g, "");
  const data = SECTOR_KEYWORDS[normalized] || SECTOR_KEYWORDS["tech"];
  const keywords = Object.values(data.categories).flat();
  return { keywords, categories: data.categories };
}

export function calculateAtsScore(resumeText: string, sector: string): {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  breakdown: { keywordMatch: number; formatting: number; experience: number; education: number };
} {
  const { keywords } = getKeywordsForSector(sector);
  const textLower = resumeText.toLowerCase();
  
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  
  for (const kw of keywords) {
    if (textLower.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const keywordMatchRate = keywords.length > 0 ? matchedKeywords.length / keywords.length : 0;
  const keywordScore = Math.round(keywordMatchRate * 100);

  // Formatting check
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
  const hasPhone = /[\d\-\(\)\+\s]{10,}/.test(resumeText);
  const hasBullets = /[-•*]/.test(resumeText);
  const hasEducation = /education|degree|university|college|bachelor|master|phd/i.test(resumeText);
  const hasExperience = /experience|work|job|position|role|company|employer/i.test(resumeText);
  
  const formattingScore = Math.round(
    ((hasEmail ? 25 : 0) + (hasPhone ? 25 : 0) + (hasBullets ? 25 : 0) + (hasExperience ? 25 : 0))
  );
  const educationScore = hasEducation ? Math.round(75 + Math.random() * 25) : Math.round(40 + Math.random() * 30);
  const experienceScore = hasExperience ? Math.round(70 + Math.random() * 25) : Math.round(30 + Math.random() * 30);

  const overallScore = Math.round(
    keywordScore * 0.45 + formattingScore * 0.2 + experienceScore * 0.2 + educationScore * 0.15
  );

  const suggestions: string[] = [];
  if (keywordMatchRate < 0.3) {
    suggestions.push(`Add more sector-specific keywords. You're only matching ${Math.round(keywordMatchRate * 100)}% of key terms for ${sector}.`);
  }
  if (!hasBullets) {
    suggestions.push("Use bullet points to highlight achievements and responsibilities — ATS systems parse these better.");
  }
  if (missingKeywords.slice(0, 3).length > 0) {
    suggestions.push(`Consider adding these high-impact keywords: ${missingKeywords.slice(0, 3).join(", ")}.`);
  }
  if (!hasEmail || !hasPhone) {
    suggestions.push("Ensure your contact information (email, phone) is clearly listed at the top of the resume.");
  }
  if (overallScore < 60) {
    suggestions.push("Your resume needs significant improvement to pass ATS filters. Focus on keyword density and formatting.");
  } else if (overallScore < 75) {
    suggestions.push("You're close! Adding 5-10 more relevant keywords could push you past the 75% threshold.");
  }

  return {
    score: Math.min(100, Math.max(0, overallScore)),
    matchedKeywords: matchedKeywords.slice(0, 20),
    missingKeywords: missingKeywords.slice(0, 15),
    suggestions,
    breakdown: {
      keywordMatch: keywordScore,
      formatting: formattingScore,
      experience: experienceScore,
      education: educationScore,
    },
  };
}
