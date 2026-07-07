"use client";

import Link from "next/link";
import { BadgePercent, CalendarClock, Info, ListTree } from "lucide-react";
import { usePricingSchedule } from "@/presentation/hooks/usePricingSchedules";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

const DAY_LABELS: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

function formatDays(days: number[]) {
  if (!days.length) return "—";
  return days.map((d) => DAY_LABELS[d] ?? String(d)).join(", ");
}

export function PricingScheduleDetail({ scheduleId }: { scheduleId: string }) {
  const { data: schedule, isLoading, error } = usePricingSchedule(scheduleId);

  if (isLoading) {
    return (
      <AppLoader fullScreen={false} size="md" message="Loading pricing schedule..." />
    );
  }

  if (error || !schedule) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Pricing schedule not found or failed to load.</p>
        <Link href="/pricing-schedules">
          <Button variant="outline">Back to Pricing Schedules</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "ID", value: safeText(schedule.id), mono: true },
    { label: "Tenant ID", value: safeText(schedule.tenantId), mono: true },
    { label: "Name", value: safeText(schedule.name) },
    { label: "Starts at", value: formatDate(schedule.startsAt) },
    { label: "Ends at", value: formatDate(schedule.endsAt) },
    { label: "Days of week", value: formatDays(schedule.daysOfWeek) },
    { label: "Daily window", value: `${schedule.startTime} – ${schedule.endTime}` },
    { label: "Priority", value: safeText(schedule.priority) },
    { label: "Status", value: schedule.isActive ? "Active" : "Inactive" },
  ];

  const recordRows = [
    { label: "Created at", value: formatDate(schedule.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(schedule.updatedAt ?? undefined) },
    { label: "Deleted at", value: formatDate(schedule.deletedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/pricing-schedules"
        backLabel="Pricing Schedules"
        title={safeText(schedule.name)}
        editHref={`/pricing-schedules/${schedule.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={CalendarClock}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>

      <DetailSection title="Pricing rules" icon={BadgePercent}>
        {schedule.rules && schedule.rules.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Variant ID</th>
                  <th className="px-3 py-2 text-left font-medium">Category ID</th>
                  <th className="px-3 py-2 text-left font-medium">Adjustment type</th>
                  <th className="px-3 py-2 text-left font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {schedule.rules.map((rule, index) => (
                  <tr key={`${rule.variantId ?? rule.categoryId}-${index}`} className="border-t border-border">
                    <td className="px-3 py-2 font-mono">{safeText(rule.variantId)}</td>
                    <td className="px-3 py-2 font-mono">{safeText(rule.categoryId)}</td>
                    <td className="px-3 py-2">{safeText(rule.adjustmentType)}</td>
                    <td className="px-3 py-2">{rule.adjustmentValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">No pricing rules configured.</p>
        )}
      </DetailSection>

      <DetailSection title="Linked catalog" icon={ListTree}>
        <p className="text-sm text-muted">
          Rules can target specific variants or categories. Use the product and category sections to
          manage those catalog items.
        </p>
        <div className="mt-3 flex flex-wrap gap-4">
          <Link href="/products" className="text-sm text-mint hover:underline">
            View products
          </Link>
          <Link href="/categories" className="text-sm text-mint hover:underline">
            View categories
          </Link>
        </div>
      </DetailSection>
    </div>
  );
}
