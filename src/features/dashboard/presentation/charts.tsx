"use client";

import type { ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { formatMoney } from "@/features/reports/presentation/report-utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const CHART_COLORS = [
  "#16a34a",
  "#0f766e",
  "#ca8a04",
  "#2563eb",
  "#c026d3",
  "#ea580c",
  "#64748b",
  "#dc2626",
];

export function chartAmount(value: string | number | null | undefined): number {
  const n = typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(n) ? n : 0;
}

function compactNumber(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(Math.round(value));
}

function chartValue(value: unknown, kind: "money" | "count"): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return kind === "count" ? n.toLocaleString() : formatMoney(n);
}

const axisTick = { fill: "var(--color-muted)", fontSize: 12 };
const tooltipStyle = {
  background: "var(--color-background)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  color: "var(--color-foreground)",
};

export function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed text-sm text-muted">
      {label}
    </div>
  );
}

export function ChartCard({
  title,
  children,
  height = 300,
}: {
  title: string;
  children: ReactElement;
  height?: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function MoneyBarChart({
  data,
  bars,
  layout = "horizontal",
  valueFormat = "money",
}: {
  data: Array<Record<string, string | number>>;
  bars: Array<{ key: string; name: string; color: string }>;
  layout?: "horizontal" | "vertical";
  valueFormat?: "money" | "count";
}) {
  const vertical = layout === "vertical";
  return (
    <BarChart
      data={data}
      layout={vertical ? "vertical" : "horizontal"}
      margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
    >
      <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
      {vertical ? (
        <>
          <XAxis type="number" tick={axisTick} tickFormatter={compactNumber} />
          <YAxis type="category" dataKey="name" width={128} tick={axisTick} />
        </>
      ) : (
        <>
          <XAxis dataKey="name" tick={axisTick} interval={0} angle={data.length > 8 ? -35 : 0} textAnchor={data.length > 8 ? "end" : "middle"} height={data.length > 8 ? 70 : 30} />
          <YAxis tick={axisTick} tickFormatter={compactNumber} width={48} />
        </>
      )}
      <Tooltip formatter={(value) => chartValue(value, valueFormat)} contentStyle={tooltipStyle} />
      {bars.length > 1 ? <Legend /> : null}
      {bars.map((bar) => (
        <Bar key={bar.key} dataKey={bar.key} name={bar.name} fill={bar.color} radius={vertical ? [0, 4, 4, 0] : [4, 4, 0, 0]} />
      ))}
    </BarChart>
  );
}

export function SharePieChart({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  return (
    <PieChart>
      <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={2}>
        {data.map((entry, index) => (
          <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
        ))}
      </Pie>
      <Tooltip formatter={(value) => chartValue(value, "money")} contentStyle={tooltipStyle} />
      <Legend />
    </PieChart>
  );
}
