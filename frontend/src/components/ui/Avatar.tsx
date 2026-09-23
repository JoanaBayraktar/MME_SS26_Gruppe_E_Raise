type AvatarVariant = "brand" | "neutral";

interface AvatarProps {
  name: string;
  variant?: AvatarVariant;
  className?: string;
}

const variantClasses: Record<AvatarVariant, string> = {
  brand: "bg-brand text-white",
  neutral: "bg-gray-200 text-gray-600",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Avatar({ name, variant = "neutral", className = "" }: AvatarProps) {
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {initials(name)}
    </span>
  );
}
