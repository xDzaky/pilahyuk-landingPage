"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface StatusDonutChartProps {
  data: DonutSlice[];
  title: string;
  question: string;
  centerLabel?: string;
  centerValue?: string;
}

const DEFAULT_COLORS = [
  "#173F35",
  "#246B56",
  "#3D9274",
  "#DDF3EC",
  "#55615B",
];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DonutSlice }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-white border border-[#D2DCD5] rounded-[6px] px-3 py-2 shadow-sm text-sm">
      <div className="text-[#55615B] mb-0.5">{item.label}</div>
      <div className="font-semibold text-[#1E2925]">
        {item.value.toLocaleString("id-ID")}
      </div>
    </div>
  );
}

export function StatusDonutChart({
  data,
  title,
  question,
  centerLabel,
  centerValue,
}: StatusDonutChartProps) {
  // Max 5 slices
  const slices = data.slice(0, 5).map((d, i) => ({
    ...d,
    color: d.color || DEFAULT_COLORS[i],
  }));
  const total = slices.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white border border-[#D2DCD5] rounded-[6px] p-4">
      <div className="text-xs text-[#55615B] font-medium uppercase tracking-wide mb-0.5">
        {title}
      </div>
      <div className="text-sm text-[#1E2925] font-semibold mb-4">{question}</div>

      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="relative shrink-0">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={slices}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={56}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {slices.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          {centerValue && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-lg font-bold text-[#1E2925] leading-none">
                {centerValue}
              </div>
              {centerLabel && (
                <div className="text-[10px] text-[#55615B] mt-0.5">{centerLabel}</div>
              )}
            </div>
          )}
        </div>

        {/* Text legend */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {slices.map((item, i) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={i} className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="text-xs text-[#55615B] truncate flex-1">
                  {item.label}
                </div>
                <div className="text-xs font-semibold text-[#1E2925] shrink-0">
                  {pct}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
