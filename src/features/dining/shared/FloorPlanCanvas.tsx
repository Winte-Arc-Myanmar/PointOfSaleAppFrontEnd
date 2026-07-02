"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { DiningZone } from "@/core/domain/entities/DiningZone";
import type { DiningTable } from "@/core/domain/entities/DiningTable";
import { cn } from "@/lib/utils";
import { DiningTableTile } from "./DiningTableTile";
import { FLOOR_PLAN_HEIGHT, FLOOR_PLAN_WIDTH } from "./dining-ui";
import { clientToFloorCoords, resolveTablePositions } from "./floor-plan-utils";

interface FloorPlanCanvasProps {
  zone?: DiningZone | null;
  tables: DiningTable[];
  onTableClick?: (table: DiningTable) => void;
  editable?: boolean;
  onTablePositionChange?: (table: DiningTable, x: number, y: number) => void;
  className?: string;
}

export function FloorPlanCanvas({
  zone,
  tables,
  onTableClick,
  editable = false,
  onTablePositionChange,
  className,
}: FloorPlanCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draftPositions, setDraftPositions] = useState<Record<string, { x: number; y: number }>>(
    {}
  );

  const positioned = useMemo(() => resolveTablePositions(tables), [tables]);

  const getDisplayPos = useCallback(
    (tableId: string, fallbackX: number, fallbackY: number) => {
      const draft = draftPositions[tableId];
      return draft ?? { x: fallbackX, y: fallbackY };
    },
    [draftPositions]
  );

  const startDrag = (table: DiningTable, x: number, y: number, pointerId: number, el: HTMLElement) => {
    if (!editable) return;
    el.setPointerCapture(pointerId);
    setDraggingId(String(table.id));
    setDraftPositions((prev) => ({
      ...prev,
      [String(table.id)]: prev[String(table.id)] ?? { x, y },
    }));
  };

  const moveDrag = (clientX: number, clientY: number) => {
    if (!draggingId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = clientToFloorCoords(clientX, clientY, rect);
    setDraftPositions((prev) => ({ ...prev, [draggingId]: { x, y } }));
  };

  const endDrag = (table: DiningTable, el: HTMLElement, pointerId: number) => {
    if (!editable || draggingId !== String(table.id)) return;
    el.releasePointerCapture(pointerId);
    const pos = draftPositions[String(table.id)];
    if (pos) {
      onTablePositionChange?.(table, pos.x, pos.y);
    }
    setDraggingId(null);
    setDraftPositions((prev) => {
      const next = { ...prev };
      delete next[String(table.id)];
      return next;
    });
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-auto rounded-xl border border-border bg-[#f8fafc] dark:bg-muted/20",
        editable && "ring-2 ring-mint/40",
        className
      )}
    >
      {editable && (
        <p className="absolute top-2 left-1/2 z-20 -translate-x-1/2 rounded-full bg-background/95 px-3 py-1 text-xs text-muted border border-border shadow-sm">
          Drag tables to rearrange — positions save when you release
        </p>
      )}
      <div
        ref={canvasRef}
        className={cn("relative mx-auto touch-none", editable && "select-none")}
        style={{ width: FLOOR_PLAN_WIDTH, height: FLOOR_PLAN_HEIGHT, minWidth: FLOOR_PLAN_WIDTH }}
      >
        {zone?.layoutSvg ? (
          <div
            className="absolute inset-0 pointer-events-none opacity-90"
            dangerouslySetInnerHTML={{ __html: zone.layoutSvg }}
          />
        ) : (
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        )}

        {positioned.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
            No tables on this floor yet.
          </div>
        ) : (
          positioned.map(({ table, x, y }) => {
            const display = getDisplayPos(String(table.id), x, y);
            const isDragging = draggingId === String(table.id);

            return (
              <div
                key={table.id}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2",
                  editable ? (isDragging ? "z-20 cursor-grabbing" : "z-10 cursor-grab") : "z-10"
                )}
                style={{ left: display.x, top: display.y }}
                onPointerDown={(e) => {
                  if (!editable) return;
                  e.stopPropagation();
                  startDrag(table, display.x, display.y, e.pointerId, e.currentTarget);
                }}
                onPointerMove={(e) => {
                  if (!editable || draggingId !== String(table.id)) return;
                  moveDrag(e.clientX, e.clientY);
                }}
                onPointerUp={(e) => endDrag(table, e.currentTarget, e.pointerId)}
                onPointerCancel={(e) => endDrag(table, e.currentTarget, e.pointerId)}
              >
                <DiningTableTile
                  table={{ ...table, posX: String(display.x), posY: String(display.y) }}
                  compact
                  onClick={editable ? undefined : () => onTableClick?.(table)}
                  className={cn(
                    editable && "ring-2 ring-transparent hover:ring-mint/50",
                    isDragging && "ring-mint shadow-lg scale-105"
                  )}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
