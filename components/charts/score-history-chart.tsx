"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_INK } from "./palette";

export interface ScoreHistoryPoint {
  label: string;
  score: number;
  methodologyVersion: string;
}

/** Overall score per snapshot (single series → no legend; title names it). */
export function ScoreHistoryChart({ points }: { points: ScoreHistoryPoint[] }) {
  return (
    <figure className="space-y-2">
      <div
        className="h-48 w-full"
        role="img"
        aria-label={`Green Transparency Score history: ${points.map((p) => `${p.label} ${Math.round(p.score)}`).join(", ")}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 12, right: 16, bottom: 0, left: -20 }}>
            <CartesianGrid vertical={false} stroke={CHART_INK.grid} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: CHART_INK.axis, fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: CHART_INK.axis, fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [typeof value === "number" ? Math.round(value) : "—", "Score"]}
              contentStyle={{ borderRadius: 8, borderColor: CHART_INK.grid, fontSize: 13 }}
            />
            <Line
              type="linear"
              dataKey="score"
              stroke={CHART_INK.primary}
              strokeWidth={2}
              dot={{ r: 4, fill: CHART_INK.primary, stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">
        <table>
          <thead>
            <tr>
              <th>Snapshot</th>
              <th>Score</th>
              <th>Methodology</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.label}>
                <td>{p.label}</td>
                <td>{Math.round(p.score)}</td>
                <td>v{p.methodologyVersion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}
