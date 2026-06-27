import type { DiningTable } from "@/core/domain/entities/DiningTable";
import { FLOOR_PLAN_HEIGHT, FLOOR_PLAN_WIDTH } from "./dining-ui";

export const FLOOR_GRID_SIZE = 40;
const TILE_MARGIN = 40;

export function parseCoord(value: string | number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function hasFloorPosition(x: number, y: number): boolean {
  return x > 0 || y > 0;
}

export function snapCoord(value: number, grid = FLOOR_GRID_SIZE): number {
  return Math.round(value / grid) * grid;
}

export function clampFloorCoord(
  x: number,
  y: number
): { x: number; y: number } {
  return {
    x: Math.min(FLOOR_PLAN_WIDTH - TILE_MARGIN, Math.max(TILE_MARGIN, x)),
    y: Math.min(FLOOR_PLAN_HEIGHT - TILE_MARGIN, Math.max(TILE_MARGIN, y)),
  };
}

export function clientToFloorCoords(
  clientX: number,
  clientY: number,
  rect: DOMRect
): { x: number; y: number } {
  const x = ((clientX - rect.left) / rect.width) * FLOOR_PLAN_WIDTH;
  const y = ((clientY - rect.top) / rect.height) * FLOOR_PLAN_HEIGHT;
  return clampFloorCoord(snapCoord(x), snapCoord(y));
}

export type PositionedTable = {
  table: DiningTable;
  x: number;
  y: number;
  hasPosition: boolean;
};

export function resolveTablePositions(tables: DiningTable[]): PositionedTable[] {
  const withCoords = tables.map((table, index) => {
    const x = parseCoord(table.posX);
    const y = parseCoord(table.posY);
    const hasPosition = hasFloorPosition(x, y);
    return { table, x, y, hasPosition, index };
  });

  const allAtOrigin = withCoords.every((t) => !t.hasPosition);
  if (allAtOrigin && withCoords.length > 0) {
    const cols = Math.ceil(Math.sqrt(withCoords.length));
    return withCoords.map((item) => {
      const col = item.index % cols;
      const row = Math.floor(item.index / cols);
      return {
        table: item.table,
        x: 80 + col * 110,
        y: 80 + row * 110,
        hasPosition: true,
      };
    });
  }

  return withCoords.map(({ table, x, y, hasPosition }) => ({
    table,
    x,
    y,
    hasPosition,
  }));
}

export function suggestNextPosition(
  occupied: Array<{ x: number; y: number }>,
  step = 80
): { x: number; y: number } {
  const minX = TILE_MARGIN;
  const minY = TILE_MARGIN;
  const maxX = FLOOR_PLAN_WIDTH - TILE_MARGIN;
  const maxY = FLOOR_PLAN_HEIGHT - TILE_MARGIN;

  for (let y = minY; y <= maxY; y += step) {
    for (let x = minX; x <= maxX; x += step) {
      const snapped = clampFloorCoord(snapCoord(x), snapCoord(y));
      const taken = occupied.some(
        (p) =>
          Math.abs(p.x - snapped.x) < step * 0.6 && Math.abs(p.y - snapped.y) < step * 0.6
      );
      if (!taken) return snapped;
    }
  }

  return clampFloorCoord(FLOOR_PLAN_WIDTH / 2, FLOOR_PLAN_HEIGHT / 2);
}
