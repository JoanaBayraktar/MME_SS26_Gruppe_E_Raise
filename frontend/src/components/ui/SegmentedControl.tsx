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
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const optionWidthPercent = 100 / options.length;

  return (
    <div className="relative flex rounded-full bg-gray-100 p-1" role="group" {...rest}>
      <span
        aria-hidden="true"
        className="absolute inset-y-1 rounded-full bg-brand transition-transform duration-300 ease-out"
        style={{
          width: `${optionWidthPercent}%`,
          transform: `translateX(${selectedIndex * 100}%)`,
        }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`relative z-10 flex-1 rounded-full py-2 text-sm font-medium transition-colors duration-300 ${
            value === option.value ? "text-white" : "text-gray-500"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
