"use client";

import { Label } from "@/presentation/components/ui/label";
import { cn } from "@/lib/utils";

type CategoryOption = {
  id: string;
  name: string;
};

export interface KdsCategoryRoutingPickerProps {
  categories: CategoryOption[];
  value: string[];
  onChange: (categoryIds: string[]) => void;
  disabled?: boolean;
}

export function KdsCategoryRoutingPicker({
  categories,
  value,
  onChange,
  disabled,
}: KdsCategoryRoutingPickerProps) {
  const toggle = (categoryId: string) => {
    if (disabled) return;
    if (value.includes(categoryId)) {
      onChange(value.filter((id) => id !== categoryId));
      return;
    }
    onChange([...value, categoryId]);
  };

  if (categories.length === 0) {
    return <p className="text-sm text-muted">No categories available.</p>;
  }

  return (
    <div className="space-y-2">
      <Label>Category routing</Label>
      <p className="text-xs text-muted">
        Orders from these menu categories will appear on this KDS station.
      </p>
      <div className="max-h-48 overflow-y-auto rounded-md border border-border p-3 space-y-2">
        {categories.map((category) => {
          const checked = value.includes(category.id);
          return (
            <label
              key={category.id}
              className={cn(
                "flex items-center gap-2 text-sm cursor-pointer",
                disabled && "opacity-60 cursor-not-allowed",
              )}
            >
              <input
                type="checkbox"
                className="size-4 rounded border-border"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(category.id)}
              />
              <span>{category.name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
