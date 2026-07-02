"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { DiningZone } from "@/core/domain/entities/DiningZone";
import type { DiningTable } from "@/core/domain/entities/DiningTable";
import { cn } from "@/lib/utils";
import { DiningTableTile } from "./DiningTableTile";
import { FLOOR_PLAN_HEIGHT, FLOOR_PLAN_WIDTH } from "./dining-ui";
import {
  clientToFloorCoords,
  hasFloorPosition,
  parseCoord,
  resolveTablePositions,
} from "./floor-plan-utils";

interface PreviewTable {
  tableNumber: string;
  maxSeats: number;
  shape: string;
  status: string;
}

interface FloorPlanPlacementEditorProps {
  zone?: DiningZone | null;
  posX: string | number;
  posY: string | number;
  onPositionChange: (x: number, y: number) => void;
  preview: PreviewTable;
  existingTables?: DiningTable[];
  excludeTableId?: string;
  className?: string;
}

export function FloorPlanPlacementEditor({
  zone,
  posX,
  posY,
  onPositionChange,
  preview,
  existingTables = [],
  excludeTableId,
  className,
}: FloorPlanPlacementEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const x = parseCoord(posX);
  const y = parseCoord(posY);
  const placed = hasFloorPosition(x, y);

  const others = useMemo(
    () => existingTables.filter((t) => String(t.id) !== String(excludeTableId)),
    [existingTables, excludeTableId]
  );

  const positionedOthers = useMemo(() => resolveTablePositions(others), [others]);

  const applyCoords = useCallback(
    (clientX: number, clientY: number) => {
      const el = canvasRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const { x: nx, y: ny } = clientToFloorCoords(clientX, clientY, rect);
      onPositionChange(nx, ny);
    },
    [onPositionChange]
  );

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-placement-tile]")) return;
    applyCoords(e.clientX, e.clientY);
  };

  const handlePreviewPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const handlePreviewPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    applyCoords(e.clientX, e.clientY);
  };

  const handlePreviewPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDragging(false);
    }
  };

  const previewTable: DiningTable = {
    id: "preview",
    tenantId: "",
    zoneId: "",
    tableNumber: preview.tableNumber || "?",
    maxSeats: preview.maxSeats || 4,
    posX: String(x),
    posY: String(y),
    shape: preview.shape,
    status: preview.status,
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted">
          Click the floor or drag the table tile to set its position.
        </p>
        {placed && (
          <span className="shrink-0 rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
            {x}, {y}
          </span>
        )}
      </div>

      <div className="relative w-full overflow-auto rounded-xl border border-border bg-[#f8fafc] dark:bg-muted/20">
        <div
          ref={canvasRef}
          role="application"
          aria-label="Floor plan placement"
          className={cn(
            "relative mx-auto touch-none select-none",
            dragging ? "cursor-grabbing" : "cursor-crosshair"
          )}
          style={{
            width: FLOOR_PLAN_WIDTH,
            height: FLOOR_PLAN_HEIGHT,
            minWidth: FLOOR_PLAN_WIDTH,
          }}
          onPointerDown={handleCanvasPointerDown}
        >
          {zone?.layoutSvg ? (
            <div
              className="absolute inset-0 pointer-events-none opacity-90"
              dangerouslySetInnerHTML={{ __html: zone.layoutSvg }}
            />
          ) : (
            <div
              className="absolute inset-0 opacity-60 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          )}

          {positionedOthers.map(({ table, x: ox, y: oy }) => (
            <div
              key={table.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 opacity-45 pointer-events-none"
              style={{ left: ox, top: oy }}
            >
              <DiningTableTile table={table} compact />
            </div>
          ))}

          {placed && (
            <div
              data-placement-tile
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 z-10",
                dragging ? "cursor-grabbing" : "cursor-grab"
              )}
              style={{ left: x, top: y }}
              onPointerDown={handlePreviewPointerDown}
              onPointerMove={handlePreviewPointerMove}
              onPointerUp={handlePreviewPointerUp}
              onPointerCancel={handlePreviewPointerUp}
            >
              <DiningTableTile
                table={previewTable}
                compact
                className="ring-2 ring-mint ring-offset-2 shadow-md"
              />
            </div>
          )}

          {!placed && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="rounded-lg bg-background/90 px-3 py-2 text-sm text-muted shadow-sm border border-border">
                Click anywhere on the floor to place this table
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
