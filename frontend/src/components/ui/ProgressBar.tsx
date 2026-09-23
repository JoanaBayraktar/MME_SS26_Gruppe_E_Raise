const PERCENTAGE_MIN = 0;
const PERCENTAGE_MAX = 100;

function clampPercentage(value: number) {
  return Math.min(PERCENTAGE_MAX, Math.max(PERCENTAGE_MIN, value));
}

interface ProgressBarProps {
  label: string;
  percentage: number;
  highlight?: boolean;
}

export function ProgressBar({ label, percentage, highlight = false }: ProgressBarProps) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-gray-900">{label}</span>
        <span className={highlight ? "font-semibold text-brand" : "font-semibold text-gray-900"}>
          {percentage}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${highlight ? "bg-brand" : "bg-gray-300"}`}
          style={{ width: `${clampPercentage(percentage)}%` }}
        />
      </div>
    </div>
  );
}
