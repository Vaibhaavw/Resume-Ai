import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";

// Page imports
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Resumes from "@/pages/Resumes";
import ResumeEditor from "@/pages/ResumeEditor";
import AtsChecker from "@/pages/AtsChecker";
import Templates from "@/pages/Templates";
import Subscription from "@/pages/Subscription";
import Settings from "@/pages/Settings";

// Initialize auth token getter
import "@/lib/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />

      {/* Onboarding — auth required, no onboarding required */}
      <Route path="/onboarding">
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      </Route>

      {/* Protected routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/resumes/new">
        <ProtectedRoute>
          <ResumeEditor />
        </ProtectedRoute>
      </Route>

      <Route path="/resumes/:id">
        <ProtectedRoute>
          <ResumeEditor />
        </ProtectedRoute>
      </Route>

      <Route path="/resumes">
        <ProtectedRoute>
          <Resumes />
        </ProtectedRoute>
      </Route>

      <Route path="/ats-checker">
        <ProtectedRoute>
          <AtsChecker />
        </ProtectedRoute>
      </Route>

      <Route path="/templates">
        <ProtectedRoute>
          <Templates />
        </ProtectedRoute>
      </Route>

      <Route path="/subscription">
        <ProtectedRoute>
          <Subscription />
        </ProtectedRoute>
      </Route>

      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
