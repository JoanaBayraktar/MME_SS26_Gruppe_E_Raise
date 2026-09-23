import { InputHTMLAttributes } from "react";
import { Check } from "lucide-react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Checkbox({ label, className = "", ...props }: CheckboxProps) {
  return (
    <label className={`relative inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700 ${className}`}>
      <input type="checkbox" className="peer sr-only" {...props} />
      <span className="h-5 w-5 shrink-0 rounded-md border border-gray-300 bg-white transition peer-checked:border-brand peer-checked:bg-brand" />
      <Check
        className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 peer-checked:opacity-100"
        strokeWidth={3}
      />
      {label}
    </label>
  );
}
