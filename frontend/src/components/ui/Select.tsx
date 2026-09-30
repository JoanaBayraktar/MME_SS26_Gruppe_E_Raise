import { forwardRef, SelectHTMLAttributes } from "react";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = "", children, ...props }, ref) => (
    <select
      ref={ref}
      className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light ${className}`}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
