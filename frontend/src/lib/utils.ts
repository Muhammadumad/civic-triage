import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateString: string, live?: boolean): string {
  if (!dateString) return "Recently";
  try {
    const date = new Date(dateString);
    const now = live ? new Date() : new Date("2026-10-13T14:50:00.000Z");
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 0 || diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

export function getScoreColorClass(score: number): string {
  if (score >= 70) return "text-rose-400 bg-rose-500/15 border-rose-500/40";
  if (score >= 40) return "text-amber-400 bg-amber-500/15 border-amber-500/40";
  return "text-blue-400 bg-blue-500/15 border-blue-500/30";
}
