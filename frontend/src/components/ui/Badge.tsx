import { HTMLAttributes } from "react";

export type BadgeTone = "neutral" | "brand" | "success" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-gray-100 text-gray-600",
  brand: "bg-brand-light text-brand",
  success: "bg-green-100 text-green-700",
  muted: "bg-gray-100 text-gray-400",
};

// Fragen-Status aus den User Stories auf einen Badge-Ton gemappt
export const FRAGE_STATUS_TONE: Record<"neu" | "gefragt" | "beantwortet" | "irrelevant", BadgeTone> = {
  neu: "neutral",
  gefragt: "brand",
  beantwortet: "success",
  irrelevant: "muted",
};

export function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
