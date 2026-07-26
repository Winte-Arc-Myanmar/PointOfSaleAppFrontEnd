"use client";

import { useMemo, useState } from "react";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useGoodsReceivedNotes } from "@/presentation/hooks/useGoodsReceivedNotes";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { GrnLineList } from "./GrnLineList";

const GRN_LIST_LIMIT = 200;

export function GrnLinesPageWithGrnSelect() {
  const { data: notesData, isLoading } = useGoodsReceivedNotes({
    page: 1,
    limit: GRN_LIST_LIMIT,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const notes = getPaginatedItems(notesData);
  const [selectedId, setSelectedId] = useState<string>("");

  const sorted = useMemo(
    () =>
      [...notes].sort((a, b) =>
        (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
      ),
    [notes]
  );

  return (
    <div className="space-y-6">
      <div className="grid max-w-md gap-2">
        <Label htmlFor="grn-select">Goods received note</Label>
        <Select value={selectedId} onValueChange={setSelectedId} disabled={isLoading}>
          <SelectTrigger id="grn-select">
            <SelectValue
              placeholder={isLoading ? "Loading goods received notes..." : "Select goods received note"}
            />
          </SelectTrigger>
          <SelectContent>
            {sorted.map((n) => (
              <SelectItem key={n.id} value={String(n.id)}>
                {n.grnNumber} — {n.status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedId ? (
        <GrnLineList grnId={selectedId} />
      ) : (
        <p className="text-sm text-muted">
          Select a goods received note to view and manage its lines.
        </p>
      )}
    </div>
  );
}
