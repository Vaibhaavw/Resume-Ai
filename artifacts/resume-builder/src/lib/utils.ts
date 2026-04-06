import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getAtsScoreColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 75) return "text-blue-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

export function getAtsScoreBgColor(score: number): string {
  if (score >= 90) return "bg-green-100 text-green-800";
  if (score >= 75) return "bg-blue-100 text-blue-800";
  if (score >= 60) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case "premium": return "text-amber-600 bg-amber-50 border-amber-200";
    case "pro": return "text-blue-600 bg-blue-50 border-blue-200";
    default: return "text-slate-600 bg-slate-50 border-slate-200";
  }
}
