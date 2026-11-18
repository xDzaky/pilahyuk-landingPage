"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useState } from "react";

interface TrendPoint {
  label: string;
  value: number;
  estimated?: boolean;
}

interface TrendChartProps {
  data: TrendPoint[];
  title: string;
  question: string; // The specific question this chart answers
  unit?: string;
  color?: string;
  ranges?: Array<{ label: string; days: number }>;
}

const DEFAULT_RANGES = [
  { label: "7H", days: 7 },
  { label: "30H", days: 30 },
  { label: "90H", days: 90 },
];

// Custom tooltip
function CustomTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: TrendPoint }>;
  label?: string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="bg-white border border-[#D2DCD5] rounded-[6px] px-3 py-2 shadow-sm text-sm">
      <div className="text-[#55615B] mb-0.5">{label}</div>
      <div className="font-semibold text-[#1E2925]">
        {payload[0].value.toLocaleString("id-ID")}
        {unit && <span className="text-[#55615B] ml-1 font-normal">{unit}</span>}
      </div>
      {point.estimated && (
        <div className="text-[#55615B] text-xs mt-0.5">~ Estimasi</div>
      )}
    </div>
  );
}

export function TrendChart({
  data,
  title,
  question,
  unit,
  color = "#3D9274",
  ranges = DEFAULT_RANGES,
}: TrendChartProps) {
  const [activeRange, setActiveRange] = useState(ranges[0].label);

  // Split data at estimated boundary
  const estimatedStartIdx = data.findIndex((d) => d.estimated);
  const hasEstimated = estimatedStartIdx !== -1;

  return (
    <div className="bg-white border border-[#D2DCD5] rounded-[6px] p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="text-xs text-[#55615B] font-medium uppercase tracking-wide">
            {title}
          </div>
          <div className="text-sm text-[#1E2925] font-semibold mt-0.5">
            {question}
          </div>
        </div>
        {/* Range selector */}
        <div className="flex gap-1 bg-[#F6F8F5] rounded-[6px] p-0.5">
          {ranges.map((r) => (
            <button
              key={r.label}
              onClick={() => setActiveRange(r.label)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeRange === r.label
                  ? "bg-white text-[#173F35] border border-[#D2DCD5]"
                  : "text-[#55615B] hover:text-[#1E2925]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend for estimated */}
      {hasEstimated && (
        <div className="flex items-center gap-3 mb-3 mt-2">
          <div className="flex items-center gap-1.5">
            <div
              className="w-6 h-0.5 rounded"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-[#55615B]">Aktual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-6 h-0.5 rounded border-t-2 border-dashed"
              style={{ borderColor: color }}
            />
            <span className="text-xs text-[#55615B]">Estimasi</span>
          </div>
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#D2DCD5"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#55615B" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#55615B" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          {hasEstimated && (
            <ReferenceLine
              x={data[estimatedStartIdx]?.label}
              stroke="#D2DCD5"
              strokeDasharray="4 4"
            />
          )}
          {/* Actual area */}
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${color.replace("#", "")})`}
            dot={false}
            activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
            strokeDasharray={undefined}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
