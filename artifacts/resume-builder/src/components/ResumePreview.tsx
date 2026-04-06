import { cn } from "@/lib/utils";

interface ResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn?: string | null;
    website?: string | null;
    summary: string;
  };
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string | null;
    gpa?: string | null;
  }>;
  experience: Array<{
    company: string;
    title: string;
    location: string;
    startDate: string;
    endDate?: string | null;
    bullets: string[];
  }>;
  skills: string[];
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

interface Props {
  data: ResumeData;
  templateId: number;
}

function ProfessionalClassic({ data }: { data: ResumeData }) {
  const name = `${data.personalInfo.firstName} ${data.personalInfo.lastName}`.trim();
  return (
    <div className="bg-white text-gray-900 font-sans text-[11px] leading-relaxed min-h-[1056px] shadow-xl resume-preview" style={{ fontFamily: "'Times New Roman', serif" }}>
      {/* Navy header */}
      <div className="bg-[#0F172A] text-white px-8 py-6">
        <h1 className="text-2xl font-bold tracking-wide mb-1">{name || "Your Name"}</h1>
        <div className="flex flex-wrap gap-4 text-xs text-blue-200">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          {data.personalInfo.linkedIn && <span>{data.personalInfo.linkedIn}</span>}
          {data.personalInfo.website && <span>{data.personalInfo.website}</span>}
        </div>
      </div>

      <div className="flex">
        {/* Left column */}
        <div className="w-2/3 px-8 py-6 border-r border-gray-200">
          {data.personalInfo.summary && (
            <section className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#0F172A] border-b-2 border-[#0F172A] pb-1 mb-3">Professional Summary</h2>
              <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
            </section>
          )}

          {data.experience.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#0F172A] border-b-2 border-[#0F172A] pb-1 mb-3">Experience</h2>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-gray-900">{exp.title}</div>
                      <div className="text-gray-700 font-semibold">{exp.company}</div>
                    </div>
                    <div className="text-right text-gray-500 text-[10px]">
                      <div>{exp.location}</div>
                      <div>{exp.startDate} — {exp.endDate || "Present"}</div>
                    </div>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {exp.bullets.map((b, j) => (
                      <li key={j} className="flex gap-2 text-gray-700">
                        <span className="text-[#0F172A] mt-0.5">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {data.education.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#0F172A] border-b-2 border-[#0F172A] pb-1 mb-3">Education</h2>
              {data.education.map((edu, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-bold">{edu.degree} in {edu.field}</div>
                      <div className="text-gray-700">{edu.institution}</div>
                    </div>
                    <div className="text-gray-500 text-[10px] text-right">
                      {edu.startDate} — {edu.endDate || "Present"}
                      {edu.gpa && <div>GPA: {edu.gpa}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="w-1/3 px-6 py-6">
          {data.skills.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#0F172A] border-b-2 border-[#0F172A] pb-1 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((skill, i) => (
                  <span key={i} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[10px] font-medium">{skill}</span>
                ))}
              </div>
            </section>
          )}

          {data.certifications.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#0F172A] border-b-2 border-[#0F172A] pb-1 mb-3">Certifications</h2>
              {data.certifications.map((cert, i) => (
                <div key={i} className="mb-3">
                  <div className="font-semibold text-gray-900 text-[10px]">{cert.name}</div>
                  <div className="text-gray-600 text-[10px]">{cert.issuer} · {cert.date}</div>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function ModernMinimal({ data }: { data: ResumeData }) {
  const name = `${data.personalInfo.firstName} ${data.personalInfo.lastName}`.trim();
  return (
    <div className="bg-white text-gray-900 font-sans text-[11px] leading-relaxed min-h-[1056px] shadow-xl resume-preview px-12 py-10" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-1">{name || "Your Name"}</h1>
        <div className="h-1 w-16 bg-blue-600 mb-3" />
        <div className="flex flex-wrap gap-4 text-gray-500 text-[10px]">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>·</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>·</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
        </div>
      </div>

      {data.personalInfo.summary && (
        <section className="mb-7">
          <p className="text-gray-600 leading-relaxed text-[11px]">{data.personalInfo.summary}</p>
        </section>
      )}

      {data.experience.length > 0 && (
        <section className="mb-7">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600 mb-4">Experience</h2>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-5">
              <div className="flex justify-between items-baseline mb-1">
                <div className="font-bold text-gray-900">{exp.title} · <span className="font-normal text-gray-700">{exp.company}</span></div>
                <div className="text-gray-400 text-[10px]">{exp.startDate} — {exp.endDate || "Present"}</div>
              </div>
              <div className="text-gray-400 text-[10px] mb-2">{exp.location}</div>
              <ul className="space-y-1">
                {exp.bullets.map((b, j) => (
                  <li key={j} className="flex gap-2 text-gray-700">
                    <span className="text-blue-500 mt-0.5 flex-shrink-0">→</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      <div className="grid grid-cols-2 gap-8">
        {data.education.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600 mb-4">Education</h2>
            {data.education.map((edu, i) => (
              <div key={i} className="mb-3">
                <div className="font-bold text-gray-900">{edu.institution}</div>
                <div className="text-gray-600">{edu.degree}, {edu.field}</div>
                <div className="text-gray-400 text-[10px]">{edu.startDate} — {edu.endDate || "Present"}</div>
              </div>
            ))}
          </section>
        )}

        {data.skills.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((skill, i) => (
                <span key={i} className="border border-gray-200 text-gray-700 px-2 py-0.5 rounded text-[10px]">{skill}</span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ExecutiveBold({ data }: { data: ResumeData }) {
  const name = `${data.personalInfo.firstName} ${data.personalInfo.lastName}`.trim();
  return (
    <div className="bg-white text-gray-900 font-sans text-[11px] leading-relaxed min-h-[1056px] shadow-xl resume-preview" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
      {/* Dark executive header */}
      <div className="bg-gray-900 text-white px-10 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{name || "Your Name"}</h1>
        <div className="h-0.5 w-full bg-blue-500 mb-3" />
        <div className="flex flex-wrap gap-5 text-gray-300 text-[10px]">
          {data.personalInfo.email && <span>✉ {data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>☏ {data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>⌖ {data.personalInfo.location}</span>}
        </div>
      </div>

      <div className="px-10 py-7">
        {data.personalInfo.summary && (
          <section className="mb-6 pb-4 border-b-2 border-gray-200">
            <h2 className="text-sm font-extrabold uppercase text-gray-900 mb-2 tracking-wider">Executive Profile</h2>
            <p className="text-gray-700 leading-relaxed italic">{data.personalInfo.summary}</p>
          </section>
        )}

        {data.experience.length > 0 && (
          <section className="mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-sm font-extrabold uppercase text-gray-900 mb-4 tracking-wider">Professional Experience</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-5">
                <div className="flex justify-between mb-1">
                  <div>
                    <div className="font-extrabold text-gray-900 text-sm">{exp.title}</div>
                    <div className="text-blue-700 font-semibold">{exp.company} · {exp.location}</div>
                  </div>
                  <div className="text-gray-500 text-[10px] text-right font-semibold">
                    {exp.startDate} — {exp.endDate || "Present"}
                  </div>
                </div>
                <ul className="mt-2 space-y-1">
                  {exp.bullets.map((b, j) => (
                    <li key={j} className="flex gap-2 text-gray-700">
                      <span className="text-blue-600 font-bold">▪</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        <div className="grid grid-cols-3 gap-6">
          {data.education.length > 0 && (
            <section>
              <h2 className="text-xs font-extrabold uppercase text-gray-900 mb-3 tracking-wider">Education</h2>
              {data.education.map((edu, i) => (
                <div key={i} className="mb-3">
                  <div className="font-bold">{edu.degree}, {edu.field}</div>
                  <div className="text-gray-700">{edu.institution}</div>
                  <div className="text-gray-400 text-[10px]">{edu.startDate} — {edu.endDate || "Present"}</div>
                </div>
              ))}
            </section>
          )}

          {data.skills.length > 0 && (
            <section className="col-span-2">
              <h2 className="text-xs font-extrabold uppercase text-gray-900 mb-3 tracking-wider">Core Competencies</h2>
              <div className="grid grid-cols-2 gap-1">
                {data.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-gray-700">
                    <span className="w-1 h-1 bg-blue-600 rounded-full flex-shrink-0" />
                    {skill}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResumePreview({ data, templateId }: Props) {
  const templates: Record<number, (data: ResumeData) => JSX.Element> = {
    1: (d) => <ProfessionalClassic data={d} />,
    2: (d) => <ModernMinimal data={d} />,
    3: (d) => <ExecutiveBold data={d} />,
    4: (d) => <ExecutiveBold data={d} />,
  };

  const render = templates[templateId] || templates[1];
  return render(data);
}
