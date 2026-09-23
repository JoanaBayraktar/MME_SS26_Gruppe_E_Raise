import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-brand">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        {description && <p className="mt-1 max-w-xs text-sm text-gray-500">{description}</p>}
      </div>
    </div>
  );
}
