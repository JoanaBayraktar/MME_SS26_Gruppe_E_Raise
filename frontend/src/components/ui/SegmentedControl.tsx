import { useLayoutEffect, useRef, useState } from "react";

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  "aria-label": string;
  className?: string;
  // Für stark unterschiedlich lange Labels (z. B. "Alle" vs. "Beendet"):
  // Buttons behalten ihre natürliche Breite statt gleich breiter Segmente,
  // sonst wirkt die Pille bei kurzen Labels unproportional groß.
  sizeToContent?: boolean;
}

interface PillRect {
  left: number;
  width: number;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = "",
  sizeToContent = false,
  ...rest
}: SegmentedControlProps<T>) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [measuredPill, setMeasuredPill] = useState<PillRect | null>(null);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  useLayoutEffect(() => {
    if (!sizeToContent) return;
    const selectedButton = buttonRefs.current[selectedIndex];
    if (selectedButton) {
      setMeasuredPill({ left: selectedButton.offsetLeft, width: selectedButton.offsetWidth });
    }
  }, [sizeToContent, selectedIndex]);

  return (
    <div className={`relative flex rounded-full bg-gray-100 p-1 ${className}`} role="group" {...rest}>
      {sizeToContent ? (
        measuredPill && (
          <span
            aria-hidden="true"
            className="absolute inset-y-1 rounded-full bg-brand transition-all duration-300 ease-out"
            style={{ left: measuredPill.left, width: measuredPill.width }}
          />
        )
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-y-1 rounded-full bg-brand transition-transform duration-300 ease-out"
          style={{
            width: `${100 / options.length}%`,
            transform: `translateX(${selectedIndex * 100}%)`,
          }}
        />
      )}
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={(el) => (buttonRefs.current[index] = el)}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`relative z-10 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
            sizeToContent ? "" : "flex-1"
          } ${value === option.value ? "text-white" : "text-gray-500"}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
