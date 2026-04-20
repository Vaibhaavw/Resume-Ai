import React, { useState, useRef } from "react";
import {
  Upload,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Brain,
  Zap,
  ShieldCheck,
  RotateCcw,
  FileText,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useCalculateAtsScore,
  getGetSectorKeywordsQueryKey,
  useGetSectorKeywords
} from "@workspace/api-client-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Types ---
interface ScoreResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

// --- Internal Components ---

const SimpleScoreGauge = ({ score }: { score: number }) => {
  const data = [
    { name: "Score", value: score },
    { name: "Remaining", value: 100 - score },
  ];

  const getColor = (val: number) => {
    if (val >= 90) return "#10b981"; // emerald-500
    if (val >= 75) return "#3b82f6"; // blue-500
    if (val >= 60) return "#f59e0b"; // amber-500
    return "#ef4444"; // red-500
  };

  return (
    <div className="relative w-64 h-64 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={100}
            startAngle={180}
            endAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={getColor(score)} />
            <Cell fill="rgba(0,0,0,0.05)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-4 text-center">
        <span className="text-6xl font-black tracking-tighter" style={{ color: getColor(score) }}>
          {score}
        </span>
        <div className="text-xs font-bold uppercase tracking-widest opacity-40 mt-1">ATS Score</div>
      </div>
    </div>
  );
};

export default function AtsChecker() {
  const [sector] = useState("tech");
  const [resumeText, setResumeText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTargeted, setIsTargeted] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scoreMutation = useCalculateAtsScore();

  const handleScore = (extractedText: string) => {
    setError(null);
    scoreMutation.mutate({
      data: {
        resumeText: extractedText,
        sector
      }
    }, {
      onSuccess: (data) => setResult(data as ScoreResult),
      onError: (err: any) => setError(err.message || "Scoring engine failed. Please try again."),
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isTargeted && !jobDescription.trim()) {
      setError("Please provide a Job Description for targeted analysis.");
      return;
    }

    setFileName(file.name);
    setIsExtracting(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ats/extract", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      const data = await response.json();

      if (data.text?.trim()) {
        setResumeText(data.text);
        handleScore(data.text);
      } else {
        throw new Error("Empty resume text detected.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to process PDF.");
      setFileName("");
    } finally {
      setIsExtracting(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setFileName("");
    setResumeText("");
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4"
        >
          <ShieldCheck className="w-4 h-4" />
          AI-POWERED AUDIT ENGINE 2.0
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          ATS Score Optimizer
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Audit your resume against {isTargeted ? 'a specific role' : 'industry standards'} to maximize your interview chances.
        </p>
      </div>

      <div className="grid gap-8">
        <AnimatePresence mode="wait">
          {!result && !scoreMutation.isPending && !isExtracting ? (
            <motion.div
              key="upload-zone"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-6"
            >
              {/* Mode Toggle */}
              <div className="flex justify-center mb-6">
                <div className="bg-secondary/50 p-1 rounded-2xl flex gap-1">
                  <button
                    onClick={() => setIsTargeted(false)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                      !isTargeted ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Standard Audit
                  </button>
                  <button
                    onClick={() => setIsTargeted(true)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                      isTargeted ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Targeted Match
                  </button>
                </div>
              </div>

              {isTargeted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-3xl p-6 shadow-sm"
                >
                  <label className="block text-sm font-bold mb-3 px-1 uppercase tracking-widest opacity-60">
                    Paste Job Description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the requirements or job summary here..."
                    className="w-full h-40 bg-secondary/30 border border-border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  />
                </motion.div>
              )}

              <div
                onClick={() => fileInputRef.current?.click()}
                className="bg-card border-2 border-dashed border-border rounded-3xl p-16 text-center cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf"
                  className="hidden"
                />
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Upload Resume PDF</h2>
                <p className="text-muted-foreground mb-8">
                  {isTargeted ? 'Match your resume to the job above' : 'Start with a general compatibility scan'}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <span className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> PDF SUPPORTED
                  </span>
                  <span className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> AI SEMANTIC SCAN
                  </span>
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 text-destructive animate-in fade-in slide-in-from-top-4">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-semibold">{error}</span>
                </div>
              )}
            </motion.div>
          ) : (scoreMutation.isPending || isExtracting) ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card border border-border rounded-3xl p-20 text-center"
            >
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Analyzing Resume...</h3>
              <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Our AI Agent is reading your file and evaluating semantic compatibility across industry benchmarks.
              </p>
            </motion.div>
          ) : result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Main Score UI */}
              <div className="bg-card border border-border rounded-3xl p-10 overflow-hidden relative">
                <div className="grid md:grid-cols-2 items-center gap-12">
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-black uppercase tracking-widest text-sm mb-4">
                      <Zap className="w-4 h-4 fill-primary" />
                      {isTargeted ? 'Targeted Match Complete' : 'PDF Scanning Complete'}
                    </div>
                    <h2 className="text-4xl font-black mb-4">
                      {isTargeted ? 'Role Fit Analysis' : 'ATS Score Roadmap'}
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      We've analyzed your resume for <span className="text-foreground font-bold">{fileName}</span>
                      {isTargeted ? ' against your provided job description.' : '.'}
                      Follow the suggestions below to maximize your visibility.
                    </p>
                    <Button
                      variant="outline"
                      onClick={resetAnalysis}
                      className="rounded-xl font-bold gap-2 px-6 h-12"
                    >
                      <RotateCcw className="w-4 h-4" /> Start New Analysis
                    </Button>
                  </div>
                  <div className="bg-secondary/30 rounded-2xl p-4">
                    <SimpleScoreGauge score={result.score} />
                  </div>
                </div>
              </div>

              {/* Actionable Suggestions */}
              <div className="grid gap-4">
                <h3 className="text-xl font-black px-1 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Critical Enhancements
                </h3>
                {result.suggestions.map((suggestion, idx) => {
                  const [main, example] = suggestion.split("\nExample: ");
                  return (
                    <div
                      key={idx}
                      className="group bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 transition-all hover:border-primary/30"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-bold pt-2 flex-grow">{main}</p>
                      </div>

                      {example && (
                        <div className="ml-14 bg-secondary/50 border border-border/50 rounded-xl p-4 text-xs">
                          <div className="flex items-center gap-2 mb-2 font-black uppercase tracking-tighter text-[10px] text-primary/70">
                            <Sparkles className="w-3 h-3" /> AI Optimized Suggestions
                          </div>
                          <p className="text-muted-foreground italic leading-relaxed whitespace-pre-line">
                            {example}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Keywords Recap */}
              <div className="bg-card border border-border rounded-3xl p-8">
                <div className="flex items-center gap-2 mb-6 text-sm font-bold uppercase tracking-widest opacity-60">
                  <FileText className="w-4 h-4" />
                  Semantic Keyword Identifiers
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.matchedKeywords.map((kw, i) => (
                    <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-lg text-xs font-black">
                      {kw}
                    </span>
                  ))}
                  {result.missingKeywords.map((kw, i) => (
                    <span key={i} className="bg-red-50 text-red-700 border border-red-100 px-3 py-1.5 rounded-lg text-xs font-black opacity-60">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
