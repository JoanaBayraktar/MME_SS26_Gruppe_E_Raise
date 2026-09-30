import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

export function BackButton({ onClick, className = "" }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Zurück"
      className={`flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 ${className}`}
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}
