/**
 * Excel import and export.
 * Domain layer - no framework dependencies.
 */

export type SheetKind = "users" | "products" | "stock" | "spa-rooms" | "ktv-rooms";

export type RowAction = "create" | "update" | "unchanged" | "error";

export interface ImportRowResult {
  rowNumber: number;
  key: string;
  action: RowAction;
  messages: string[];
}

export interface ImportResult {
  kind: SheetKind;
  committed: boolean;
  summary: Record<RowAction, number>;
  rows: ImportRowResult[];
}
