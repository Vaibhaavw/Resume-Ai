import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useLocation } from "wouter";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { 
  useGetCurrentUser, 
  useLoginUser, 
  useRegisterUser, 
  useLogoutUser,
  User,
  LoginBody,
  RegisterBody
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const TOKEN_KEY = "auth_token";

// Configure the API client to use the token
setAuthTokenGetter(() => localStorage.getItem(TOKEN_KEY));

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginBody) => Promise<void>;
  register: (data: RegisterBody) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: user, isLoading: isUserLoading, error } = useGetCurrentUser({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (error) {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
    }
  }, [error]);

  const loginMutation = useLoginUser();
  const registerMutation = useRegisterUser();
  const logoutMutation = useLogoutUser();

  const login = async (data: LoginBody) => {
    const res = await loginMutation.mutateAsync({ data });
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    queryClient.setQueryData([`/api/auth/me`], res.user);
    if (!res.user.onboardingCompleted) {
      setLocation("/onboarding");
    } else {
      setLocation("/dashboard");
    }
  };

  const register = async (data: RegisterBody) => {
    const res = await registerMutation.mutateAsync({ data });
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    queryClient.setQueryData([`/api/auth/me`], res.user);
    setLocation("/onboarding");
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    queryClient.clear();
    setLocation("/");
  };

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading: isUserLoading && !!token, login, register, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
