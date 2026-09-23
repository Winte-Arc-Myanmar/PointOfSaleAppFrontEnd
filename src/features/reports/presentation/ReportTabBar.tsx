"use client";

import { cn } from "@/lib/utils";

export const REPORT_TAB_GROUPS = [
  {
    id: "sales",
    label: "Sales",
    tabs: [
      { id: "sales-summary", label: "Summary" },
      { id: "item-sales", label: "Items" },
      { id: "category", label: "Categories" },
      { id: "top-items", label: "Top items" },
      { id: "servers", label: "Servers" },
    ],
  },
  {
    id: "members",
    label: "Till & members",
    tabs: [
      { id: "other-income", label: "Income / expenses" },
      { id: "member-cards", label: "Guest cards" },
      { id: "loyalty", label: "Loyalty" },
    ],
  },
  {
    id: "day",
    label: "Business day",
    tabs: [
      { id: "daily", label: "Daily sales" },
      { id: "hour", label: "By hour" },
      { id: "z-report", label: "Z-report" },
    ],
  },
] as const;

export type ReportTabId = (typeof REPORT_TAB_GROUPS)[number]["tabs"][number]["id"];

const DAY_TAB_IDS: ReportTabId[] = ["daily", "hour", "z-report"];

export function isDayReportTab(id: ReportTabId): boolean {
  return DAY_TAB_IDS.includes(id);
}

function groupForTab(id: ReportTabId) {
  return REPORT_TAB_GROUPS.find((group) => group.tabs.some((tab) => tab.id === id)) ?? REPORT_TAB_GROUPS[0];
}

export function ReportTabBar({
  value,
  onChange,
  className,
}: {
  value: ReportTabId;
  onChange: (id: ReportTabId) => void;
  className?: string;
}) {
  const activeGroup = groupForTab(value);

  return (
    <div className={cn("space-y-3", className)}>
      <div role="tablist" aria-label="Report sections" className="flex flex-wrap gap-1 border-b border-border">
        {REPORT_TAB_GROUPS.map((group) => {
          const selected = group.id === activeGroup.id;
          return (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors focus-ring",
                selected
                  ? "border-mint text-foreground"
                  : "border-transparent text-muted hover:text-foreground",
              )}
              onClick={() => {
                if (!group.tabs.some((tab) => tab.id === value)) {
                  onChange(group.tabs[0].id);
                }
              }}
            >
              {group.label}
            </button>
          );
        })}
      </div>
      <div role="tablist" aria-label={activeGroup.label} className="flex flex-wrap gap-2">
        {activeGroup.tabs.map((tab) => {
          const selected = tab.id === value;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors focus-ring",
                selected
                  ? "border-mint bg-mint/15 font-medium text-foreground"
                  : "border-border text-muted hover:border-mint/40 hover:text-foreground",
              )}
              onClick={() => onChange(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
