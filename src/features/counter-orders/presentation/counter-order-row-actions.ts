import type { DataTableAction } from "@/presentation/components/data-table";
import type { SalesOrder } from "@/core/domain/entities/SalesOrder";
import { Eye, PackageCheck } from "lucide-react";

type CounterOrderRowActionOptions = {
  onView?: (order: SalesOrder) => void;
  onPickup?: (order: SalesOrder) => void;
};

export function getCounterOrderRowActions(
  options: CounterOrderRowActionOptions = {},
): DataTableAction<SalesOrder>[] {
  const actions: DataTableAction<SalesOrder>[] = [];

  if (options.onView) {
    actions.push({
      label: "View",
      icon: Eye,
      onClick: options.onView,
    });
  }

  if (options.onPickup) {
    actions.push({
      label: "Mark picked up",
      icon: PackageCheck,
      onClick: options.onPickup,
    });
  }

  return actions;
}
