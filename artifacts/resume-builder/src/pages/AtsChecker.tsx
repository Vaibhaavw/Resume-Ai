import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCalculateAtsScore, useGetSectorKeywords, getGetSectorKeywordsQueryKey } from "@workspace/api-client-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn, getAtsScoreColor } from "@/lib/utils";
import { BarChart3, CheckCircle, XCircle, Lightbulb, Upload } from "lucide-react";

const SECTORS = [
  { value: "tech", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "marketing", label: "Marketing" },
  { value: "education", label: "Education" },
  { value: "legal", label: "Legal" },
  { value: "engineering", label: "Engineering" },
  { value: "sales", label: "Sales" },
];

interface ScoreResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  breakdown: {
    keywordMatch: number;
    formatting: number;
    experience: number;
    education: number;
  };
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 90 ? "#22c55e" : score >= 75 ? "#3b82f6" : score >= 60 ? "#eab308" : "#ef4444";
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted" />
        <circle
          cx="72" cy="72" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black" style={{ color }}>{score}</span>
        <span className="text-xs text-muted-foreground font-medium">/ 100</span>
      </div>
    </div>
  );
}

function BreakdownBar({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? "bg-green-500" : value >= 60 ? "bg-blue-500" : value >= 40 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-semibold w-8 text-right">{value}%</span>
    </div>
  );
}

export default function AtsChecker() {
  const [sector, setSector] = useState("tech");
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const scoreMutation = useCalculateAtsScore();

  const { data: keywords } = useGetSectorKeywords(sector, {
    query: { queryKey: getGetSectorKeywordsQueryKey(sector) }
  });

  const handleScore = () => {
    if (!resumeText.trim()) return;
    scoreMutation.mutate({ data: { resumeText, sector } }, {
      onSuccess: (data) => setResult(data as ScoreResult),
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setResumeText(ev.target?.result as string || "");
    };
    reader.readAsText(file);
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">ATS Score Checker</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Paste your resume text to get an instant compatibility score and improvement suggestions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input panel */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Target Sector</label>
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger data-testid="select-sector">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-shrink-0 pt-6">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                  data-testid="button-upload-file"
                >
                  <Upload className="w-4 h-4" />
                  Upload PDF/TXT
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt,.pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Resume Text</label>
              <Textarea
                placeholder="Paste your resume text here, or upload a file above..."
                rows={16}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="resize-none font-mono text-xs"
                data-testid="textarea-resume"
              />
              <p className="text-xs text-muted-foreground mt-1">{resumeText.length} characters</p>
            </div>

            <Button
              onClick={handleScore}
              disabled={!resumeText.trim() || scoreMutation.isPending}
              className="w-full h-11"
              data-testid="button-analyze"
            >
              {scoreMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analyze ATS Score
                </span>
              )}
            </Button>

            {/* Sector keywords preview */}
            {keywords && (
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="text-sm font-semibold mb-3">Key terms for {sector}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.keywords.slice(0, 20).map((kw, i) => (
                    <span key={i} className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs">{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results panel */}
          <div>
            {!result ? (
              <div className="bg-card border border-border rounded-xl p-10 text-center h-full flex flex-col items-center justify-center">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No analysis yet</h3>
                <p className="text-muted-foreground text-sm">
                  Paste your resume text and click "Analyze ATS Score" to get your compatibility score.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Score gauge */}
                <div className="bg-card border border-border rounded-xl p-6 text-center">
                  <ScoreGauge score={result.score} />
                  <p className={cn("text-2xl font-bold mt-3", getAtsScoreColor(result.score))}>
                    {result.score >= 90 ? "Excellent" : result.score >= 75 ? "Good" : result.score >= 60 ? "Fair" : "Needs Work"}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">ATS Compatibility Score</p>
                </div>

                {/* Score breakdown */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-semibold mb-4 text-sm">Score Breakdown</h3>
                  <div className="space-y-3">
                    <BreakdownBar label="Keyword Match" value={result.breakdown.keywordMatch} />
                    <BreakdownBar label="Formatting" value={result.breakdown.formatting} />
                    <BreakdownBar label="Experience" value={result.breakdown.experience} />
                    <BreakdownBar label="Education" value={result.breakdown.education} />
                  </div>
                </div>

                {/* Keywords */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold">Matched ({result.matchedKeywords.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matchedKeywords.map((kw, i) => (
                        <Badge key={i} className="bg-green-100 text-green-800 text-xs border-0">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-semibold">Missing ({result.missingKeywords.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingKeywords.slice(0, 12).map((kw, i) => (
                        <Badge key={i} className="bg-red-100 text-red-800 text-xs border-0">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                {result.suggestions.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-semibold">Improvement Suggestions</span>
                    </div>
                    <ul className="space-y-2">
                      {result.suggestions.map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-amber-500 flex-shrink-0">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
