import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCompleteOnboarding } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

const sectors = [
  { id: "tech", label: "Technology", desc: "Software, IT, Data, AI", emoji: "💻" },
  { id: "healthcare", label: "Healthcare", desc: "Medical, Nursing, Pharma", emoji: "🏥" },
  { id: "finance", label: "Finance", desc: "Banking, Investment, Accounting", emoji: "📊" },
  { id: "marketing", label: "Marketing", desc: "Digital, Brand, Content", emoji: "📢" },
  { id: "education", label: "Education", desc: "Teaching, Training, Academia", emoji: "🎓" },
  { id: "legal", label: "Legal", desc: "Law, Compliance, Paralegal", emoji: "⚖️" },
  { id: "engineering", label: "Engineering", desc: "Civil, Mechanical, Chemical", emoji: "⚙️" },
  { id: "sales", label: "Sales", desc: "B2B, Retail, Account Management", emoji: "📈" },
];

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  location: z.string().min(2, "Location is required"),
  summary: z.string().min(50, "Summary should be at least 50 characters").max(500, "Keep summary under 500 characters"),
});

type ProfileData = z.infer<typeof profileSchema>;

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedSector, setSelectedSector] = useState("");
  const onboardingMutation = useCompleteOnboarding();

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: user?.email || "",
      phone: "",
      location: "",
      summary: "",
    },
  });

  const watchedData = form.watch();

  const previewData = {
    personalInfo: {
      firstName: watchedData.firstName || "Your Name",
      lastName: watchedData.lastName || "",
      email: watchedData.email || "email@example.com",
      phone: watchedData.phone || "+1 (555) 000-0000",
      location: watchedData.location || "City, State",
      linkedIn: null,
      website: null,
      summary: watchedData.summary || "Your professional summary will appear here as you type...",
    },
    education: [],
    experience: [],
    skills: [],
    certifications: [],
    projects: [],
  };

  const handleSectorSelect = (sectorId: string) => {
    setSelectedSector(sectorId);
    setStep(2);
  };

  const onSubmit = (data: ProfileData) => {
    if (!selectedSector) {
      toast({ title: "Please select a sector", variant: "destructive" });
      return;
    }

    onboardingMutation.mutate({
      data: {
        sector: selectedSector,
        personalInfo: data,
        templateId: undefined,
      }
    }, {
      onSuccess: () => {
        updateUser({ sector: selectedSector, onboardingCompleted: true });
        toast({ title: "Welcome to ResumeAI!", description: "Your profile has been created." });
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        toast({
          title: "Something went wrong",
          description: err?.data?.error || "Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold">ResumeAI</span>
        <span className="text-muted-foreground text-sm ml-auto">
          Step {step} of 2
        </span>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(step / 2) * 100}%` }}
        />
      </div>

      {step === 1 && (
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-3">What's your working sector?</h1>
            <p className="text-muted-foreground text-lg">
              We'll optimize your resume with industry-specific keywords to maximize your ATS score.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sectors.map((sector) => (
              <button
                key={sector.id}
                onClick={() => handleSectorSelect(sector.id)}
                data-testid={`card-sector-${sector.id}`}
                className={cn(
                  "p-6 rounded-xl border-2 text-left transition-all hover:border-primary hover:shadow-md bg-card",
                  selectedSector === sector.id ? "border-primary shadow-md" : "border-border"
                )}
              >
                <div className="text-3xl mb-3">{sector.emoji}</div>
                <div className="font-semibold mb-1">{sector.label}</div>
                <div className="text-xs text-muted-foreground">{sector.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex justify-center min-h-[calc(100vh-72px)]">
          {/* Form */}
          <div className="w-full max-w-2xl px-8 py-12 overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setStep(1)}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold">Tell us about yourself</h2>
                <p className="text-muted-foreground text-sm">
                  We'll use this to create your first resume in the <strong className="capitalize">{selectedSector}</strong> sector.
                </p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane" {...field} data-testid="input-first-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Smith" {...field} data-testid="input-last-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jane@example.com" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 000-0000" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="New York, NY" {...field} data-testid="input-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Summary</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`Describe your professional background, key skills, and career goals in 2-3 sentences. Tailor it to ${selectedSector} roles for better ATS matching.`}
                          rows={4}
                          {...field}
                          data-testid="textarea-summary"
                        />
                      </FormControl>
                      <div className="flex justify-between">
                        <FormMessage />
                        <span className="text-xs text-muted-foreground">{field.value.length}/500</span>
                      </div>
                    </FormItem>
                  )}
                />


                <Button
                  type="submit"
                  className="w-full h-11 mt-4"
                  disabled={onboardingMutation.isPending}
                  data-testid="button-complete-onboarding"
                >
                  {onboardingMutation.isPending ? "Creating your resume..." : (
                    <>Complete Setup <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </form>
            </Form>
          </div>

        </div>
      )}
    </div>
  );
}
