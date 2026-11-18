"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CategoryBarItem {
  label: string;
  value: number;
  color?: string;
}

interface CategoryBarChartProps {
  data: CategoryBarItem[];
  title: string;
  question: string;
  unit?: string;
  color?: string;
}

function CustomTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: CategoryBarItem }>;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-white border border-[#D2DCD5] rounded-[6px] px-3 py-2 shadow-sm text-sm">
      <div className="text-[#55615B] mb-0.5">{item.label}</div>
      <div className="font-semibold text-[#1E2925]">
        {payload[0].value.toLocaleString("id-ID")}
        {unit && <span className="text-[#55615B] ml-1 font-normal">{unit}</span>}
      </div>
    </div>
  );
}

export function CategoryBarChart({
  data,
  title,
  question,
  unit,
  color = "#3D9274",
}: CategoryBarChartProps) {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="bg-white border border-[#D2DCD5] rounded-[6px] p-4">
      <div className="text-xs text-[#55615B] font-medium uppercase tracking-wide mb-0.5">
        {title}
      </div>
      <div className="text-sm text-[#1E2925] font-semibold mb-4">{question}</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#D2DCD5"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#55615B" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 11, fill: "#55615B" }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.color ||
                  (entry.value === max ? "#173F35" : "#DDF3EC")
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
