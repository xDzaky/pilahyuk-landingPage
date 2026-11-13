"use client";

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color?: string;
  showPct?: boolean;
}

export function ProgressBar({
  label,
  value,
  max,
  unit,
  color = "#3D9274",
  showPct = true,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#66736D]">{label}</span>
        <span className="font-semibold text-[#1E2925]">
          {value.toLocaleString("id-ID")}
          {unit && <span className="text-[#66736D] font-normal ml-0.5">{unit}</span>}
          {showPct && (
            <span className="text-[#66736D] font-normal ml-1">({pct}%)</span>
          )}
        </span>
      </div>
      <div className="h-2 bg-[#F6F8F5] rounded-full overflow-hidden border border-[#E1E8E3]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

interface MultiProgressProps {
  items: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  question?: string;
  unit?: string;
}

export function MultiProgress({ items, title, question, unit }: MultiProgressProps) {
  const max = Math.max(...items.map((i) => i.value));
  const DEFAULT_COLORS = ["#173F35", "#246B56", "#3D9274", "#66736D", "#DDF3EC"];

  return (
    <div className="bg-white border border-[#E1E8E3] rounded-2xl p-4">
      {title && (
        <div className="text-xs text-[#66736D] font-medium uppercase tracking-wide mb-0.5">
          {title}
        </div>
      )}
      {question && (
        <div className="text-sm text-[#1E2925] font-semibold mb-4">{question}</div>
      )}
      <div className="space-y-3">
        {items.map((item, i) => (
          <ProgressBar
            key={i}
            label={item.label}
            value={item.value}
            max={max}
            unit={unit}
            color={item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
          />
        ))}
      </div>
    </div>
  );
}
