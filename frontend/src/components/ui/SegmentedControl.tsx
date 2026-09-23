interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  "aria-label": string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ...rest
}: SegmentedControlProps<T>) {
  return (
    <div className="flex rounded-full bg-gray-100 p-1" role="group" {...rest}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
            value === option.value ? "bg-brand text-white" : "text-gray-500"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
