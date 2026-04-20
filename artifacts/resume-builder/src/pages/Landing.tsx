import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles, BarChart3, FileText, Zap, Shield, ArrowRight, Star } from "lucide-react";

const features = [
  {
    icon: <Sparkles className="w-6 h-6 text-blue-400" />,
    title: "AI-Powered Content",
    desc: "Our AI engine rewrites your experience and summary to maximize impact and use proven high-performance language.",
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-green-400" />,
    title: "ATS Score Analysis",
    desc: "Get a real-time ATS compatibility score (0-100%) with keyword matching and actionable improvement suggestions.",
  },
  {
    icon: <FileText className="w-6 h-6 text-purple-400" />,
    title: "24+ Sector-Specific Designs",
    desc: "Professionally designed templates for Tech, Finance, Healthcare, and more. Optimized for modern recruiters.",
  },
  {
    icon: <Zap className="w-6 h-6 text-amber-400" />,
    title: "Instant PDF & Word Export",
    desc: "Export your resume in both PDF and Word formats, ready to submit to any job application instantly.",
  },
  {
    icon: <Shield className="w-6 h-6 text-red-400" />,
    title: "Sector-Specific Optimization",
    desc: "Tailored keyword databases for Tech, Healthcare, Finance, Marketing, Engineering, Legal, and more.",
  },
  {
    icon: <Star className="w-6 h-6 text-yellow-400" />,
    title: "Live Preview",
    desc: "Watch your resume update in real time as you type. No more blind editing — see exactly what employers see.",
  },
];

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    ats: "80-85%",
    color: "border-slate-200",
    features: ["All 24 Sector Templates", "AI Resume Enhancement", "ATS Score Analysis", "PDF Export"],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    ats: "90-95%",
    color: "border-blue-500 ring-2 ring-blue-500",
    features: ["All Templates & AI Features", "Premium ATS Logic", "PDF & Word Export", "Priority Support"],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Premium",
    price: "$24",
    period: "per month",
    ats: "98%+",
    color: "border-amber-400",
    features: ["Unlimited Resumes", "95%+ ATS Score Guarantee", "LinkedIn Profile Optimizer", "Cover letter generator"],
    cta: "Go Premium",
    popular: false,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">ResumeAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" data-testid="button-nav-login">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" data-testid="button-nav-register">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100" data-testid="badge-hero">
            AI-Powered Resume Builder
          </Badge>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-none">
            Land your dream job{" "}
            <span className="text-primary">with a resume</span>
            <br />
            that beats ATS.
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            Build a professionally optimized resume in minutes. Our AI analyzes your content, scores it against industry ATS systems, and helps you reach 90%+ compatibility — so your resume gets seen by humans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-base font-semibold" data-testid="button-cta-primary">
                Build My Resume — Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" data-testid="button-cta-login">
                Sign In
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">No credit card required. Free forever plan available.</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to get hired</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built for modern job seekers. Powered by AI. Optimized for every ATS system on the market.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-shadow"
                data-testid={`card-feature-${i}`}
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg">Start free. Upgrade when you need more power.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tiers.map((tier, i) => (
              <div
                key={i}
                className={`bg-card rounded-2xl p-8 border relative ${tier.color} ${tier.popular ? "shadow-lg" : ""}`}
                data-testid={`card-pricing-${tier.name.toLowerCase()}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-white border-0">Most Popular</Badge>
                  </div>
                )}
                <div className="mb-6">
                  <p className="font-semibold text-muted-foreground text-sm uppercase tracking-wider mb-2">{tier.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground text-sm">/ {tier.period}</span>
                  </div>
                  <p className="text-sm text-primary font-semibold mt-2">ATS Score Guarantee: {tier.ats}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                    data-testid={`button-pricing-${tier.name.toLowerCase()}`}
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm">ResumeAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ResumeAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
