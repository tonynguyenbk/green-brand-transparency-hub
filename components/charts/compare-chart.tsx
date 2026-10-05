"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_INK, SERIES_COLORS } from "./palette";

export interface CompareChartSeries {
  key: string;
  name: string;
}

/**
 * Grouped bars: one group per transparency dimension, one bar per brand.
 * Values are pre-computed on the server; this component only renders them.
 */
export function CompareChart({
  data,
  series,
  caption,
}: {
  data: Record<string, string | number | null>[];
  series: CompareChartSeries[];
  caption: string;
}) {
  return (
    <figure className="space-y-2">
      <div className="h-80 w-full" role="img" aria-label={caption}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barGap={2}
            barCategoryGap="22%"
            margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
          >
            <CartesianGrid vertical={false} stroke={CHART_INK.grid} />
            <XAxis
              dataKey="dimension"
              tickLine={false}
              axisLine={{ stroke: CHART_INK.grid }}
              tick={{ fill: CHART_INK.axis, fontSize: 12 }}
              interval={0}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: CHART_INK.axis, fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "oklch(0.95 0.006 95)" }}
              formatter={(value) => (typeof value === "number" ? Math.round(value) : "—")}
              contentStyle={{ borderRadius: 8, borderColor: CHART_INK.grid, fontSize: 13 }}
            />
            <Legend
              iconType="circle"
              itemSorter={null}
              wrapperStyle={{ fontSize: 13, paddingTop: 8 }}
            />
            {series.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.name}
                fill={SERIES_COLORS[i % SERIES_COLORS.length]}
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
                stroke="#fff"
                strokeWidth={1}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="text-muted-foreground text-xs">
        {caption} Exact values are listed in the table above.
      </figcaption>
    </figure>
  );
}
