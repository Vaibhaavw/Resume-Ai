import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

interface Props {
  children: ReactNode;
  requireOnboarding?: boolean;
}

export default function ProtectedRoute({ children, requireOnboarding = false }: Props) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setTimeout(() => setLocation("/login"), 0);
    return null;
  }

  if (requireOnboarding && !user.onboardingCompleted) {
    setTimeout(() => setLocation("/onboarding"), 0);
    return null;
  }

  if (!requireOnboarding && user.onboardingCompleted === false && window.location.pathname !== "/onboarding") {
    // Let them through if explicitly going to non-dashboard routes
  }

  return <>{children}</>;
}
