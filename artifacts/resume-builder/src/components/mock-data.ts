import { ResumeData } from "./ResumePreview";

export const MOCK_USER: ResumeData = {
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    countryCode: "+1",
    phone: "555-012-3456",
    location: "New York, NY",
    linkedIn: "linkedin.com/in/johndoe",
    websites: ["github.com/johndoe", "johndoe.dev"],
    summary: "Strategic Senior Software Engineer with 8+ years of experience in architecting high-scalability cloud ecosystems. Proven track record of increasing delivery efficiency by 22% through STAR-method leadership and technical innovation."
  },
  education: [
    {
      institution: "Stanford University",
      degree: "Master of Science",
      field: "Computer Science",
      startDate: "2014",
      endDate: "2016",
      gpa: "3.9/4.0"
    }
  ],
  experience: [
    {
      company: "TechNova Solutions",
      title: "Senior Software Architect",
      location: "San Francisco, CA",
      startDate: "2019",
      endDate: "Present",
      bullets: [
        "Architected a distributed microservices ecosystem that increased system throughput by 45% while reducing latency by 120ms.",
        "Engineered a real-time data processing pipeline using Node.js and Kafka, resulting in a 30% reduction in operational overhead.",
        "Mentored a cross-functional team of 12 engineers, leading to a 15% increase in sprint velocity and 100% on-time project delivery."
      ]
    },
    {
      company: "CloudStream Inc.",
      title: "Full Stack Engineer",
      location: "Seattle, WA",
      startDate: "2016",
      endDate: "2019",
      bullets: [
        "Developed and optimized 50+ RESTful APIs, improving front-end load times by 40% for over 2M monthly active users.",
        "Implemented automated CI/CD workflows that reduced deployment errors by 25% and cut release cycles from 2 weeks to 3 days."
      ]
    }
  ],
  projects: [
    {
      title: "OpenSource ATS Optimizer",
      link: "github.com/johndoe/ats-opt",
      bullets: [
        "Built a semantic HTML5 resume parser that achieved a 98% accuracy rate against standard ATS benchmarks.",
        "Integrated AI-driven keyword analysis to provide real-time feedback on resume performance."
      ]
    }
  ],
  skills: [
    "TypeScript", "React", "Node.js", "GraphQL", "AWS", "Docker", "Kubernetes", "System Design", "Agile Leadership"
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2022"
    }
  ]
};
