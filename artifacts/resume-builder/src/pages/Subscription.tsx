import { useGetSubscription } from "@workspace/api-client-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { CheckCircle, Zap, Crown, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    icon: <Shield className="w-5 h-5 text-slate-500" />,
    ats: "60-75%",
    color: "border-border",
    features: [
      "3 basic templates",
      "ATS score analysis",
      "PDF export",
      "Basic sector keyword matching",
      "Up to 3 resumes",
    ],
    cta: "Current Plan",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$12",
    period: "per month",
    icon: <Zap className="w-5 h-5 text-blue-500" />,
    ats: "75-90%",
    color: "border-primary ring-2 ring-primary/20",
    features: [
      "10 premium templates",
      "75-90% ATS optimization",
      "AI bullet point suggestions",
      "PDF & Word export",
      "Up to 15 resumes",
      "Priority email support",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$24",
    period: "per month",
    icon: <Crown className="w-5 h-5 text-amber-500" />,
    ats: "95%+",
    color: "border-amber-300",
    features: [
      "All templates (10+)",
      "95%+ ATS score guarantee",
      "AI content rewrites",
      "Cover letter generator (coming soon)",
      "Unlimited resumes",
      "Dedicated account manager",
    ],
    cta: "Go Premium",
  },
];

export default function Subscription() {
  const { user, updateUser } = useAuth();
  const { data: status } = useGetSubscription();
  const { toast } = useToast();

  const currentTier = user?.tier || "free";

  const handleUpgrade = (planId: string) => {
    toast({
      title: "Payment integration coming soon",
      description: `Stripe payment for the ${planId} plan will be available shortly. Contact us to upgrade manually.`,
    });
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Subscription</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your plan and unlock more templates and features.
          </p>
        </div>

        {/* Current plan status */}
        {status && (
          <div className="bg-card border border-border rounded-xl p-5 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {plans.find(p => p.id === currentTier)?.icon}
              </div>
              <div>
                <p className="font-semibold">
                  Current plan:{" "}
                  <span className="text-primary capitalize">{currentTier}</span>
                </p>
                {status.renewsAt && (
                  <p className="text-sm text-muted-foreground">
                    Renews on {new Date(status.renewsAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <Badge variant="outline" className="capitalize">{currentTier}</Badge>
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentTier === plan.id;
            const isDowngrade =
              (currentTier === "premium" && (plan.id === "pro" || plan.id === "free")) ||
              (currentTier === "pro" && plan.id === "free");

            return (
              <div
                key={plan.id}
                className={cn(
                  "bg-card rounded-2xl p-7 border relative",
                  plan.color,
                  isCurrentPlan ? "bg-primary/5" : ""
                )}
                data-testid={`card-plan-${plan.id}`}
              >
                {plan.popular && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-white border-0 shadow-sm">Most Popular</Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-green-600 text-white border-0 shadow-sm">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Current Plan
                    </Badge>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                  {plan.icon}
                  <span className="font-bold text-lg">{plan.name}</span>
                </div>

                <div className="mb-2">
                  <span className="text-4xl font-black">{plan.price}</span>
                  {plan.period !== "forever" && (
                    <span className="text-muted-foreground text-sm ml-1">/ {plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-primary font-semibold mb-5">
                  ATS Guarantee: {plan.ats}
                </p>

                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <Button variant="outline" className="w-full" disabled>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Current Plan
                  </Button>
                ) : isDowngrade ? (
                  <Button variant="outline" className="w-full text-muted-foreground" disabled>
                    Downgrade
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.id)}
                    data-testid={`button-upgrade-${plan.id}`}
                  >
                    {plan.cta}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature comparison */}
        <div className="mt-10 bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold">Feature Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Feature</th>
                  <th className="text-center px-6 py-3">Free</th>
                  <th className="text-center px-6 py-3 text-primary">Pro</th>
                  <th className="text-center px-6 py-3 text-amber-600">Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Templates", "3", "10", "All"],
                  ["ATS Score", "✓", "✓", "✓"],
                  ["PDF Export", "✓", "✓", "✓"],
                  ["Word Export", "—", "✓", "✓"],
                  ["AI Suggestions", "—", "✓", "✓"],
                  ["AI Rewrites", "—", "—", "✓"],
                  ["Resumes", "3", "15", "Unlimited"],
                  ["Priority Support", "—", "✓", "✓"],
                ].map(([feature, free, pro, premium], i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-6 py-3 font-medium">{feature}</td>
                    <td className="text-center px-6 py-3 text-muted-foreground">{free}</td>
                    <td className="text-center px-6 py-3">{pro}</td>
                    <td className="text-center px-6 py-3">{premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
