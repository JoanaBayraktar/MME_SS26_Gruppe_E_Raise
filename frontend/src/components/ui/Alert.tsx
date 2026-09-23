import { HTMLAttributes } from "react";
import { CheckCircle2, AlertTriangle, Info, LucideIcon } from "lucide-react";

export type AlertTone = "success" | "error" | "info";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
}

const toneConfig: Record<AlertTone, { classes: string; icon: LucideIcon }> = {
  success: { classes: "bg-green-50 text-green-700", icon: CheckCircle2 },
  error: { classes: "bg-red-50 text-red-700", icon: AlertTriangle },
  info: { classes: "bg-brand-light text-brand", icon: Info },
};

export function Alert({ tone = "info", className = "", children, ...props }: AlertProps) {
  const { classes, icon: Icon } = toneConfig[tone];

  return (
    <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${classes} ${className}`} {...props}>
      <Icon className="h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
