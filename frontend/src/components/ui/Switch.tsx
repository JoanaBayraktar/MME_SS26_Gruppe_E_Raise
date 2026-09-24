import { forwardRef, InputHTMLAttributes } from "react";

interface SwitchProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({ className = "", ...props }, ref) => (
  <label className={`relative inline-flex shrink-0 cursor-pointer items-center ${className}`}>
    <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
    <span className="h-7 w-12 rounded-full bg-gray-200 transition-colors peer-checked:bg-brand" />
    <span className="absolute left-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
  </label>
));
Switch.displayName = "Switch";
