import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand text-white hover:opacity-90",
  secondary: "bg-brand-light text-brand hover:bg-brand-light/70",
  outline: "border border-gray-200 text-gray-700 hover:bg-gray-50",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`w-full rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
