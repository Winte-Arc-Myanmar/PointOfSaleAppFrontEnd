"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/presentation/providers/LanguageProvider";

export interface TablePaginationProps {
  /** Current page (1-based). */
  page: number;
  pageCount: number;
  pageSize: number;
  /** Total row count from the paginated API response. */
  totalItems: number;
  onPageChange: (page: number) => void;
  canPreviousPage?: boolean;
  canNextPage?: boolean;
  isLoading?: boolean;
  className?: string;
  /** Always show pager (e.g. server lists). Default: true when pageCount > 1 or totalItems > pageSize. */
  forceShow?: boolean;
}

export function TablePagination({
  page,
  pageCount,
  pageSize,
  totalItems,
  onPageChange,
  canPreviousPage,
  canNextPage,
  isLoading = false,
  className,
  forceShow = false,
}: TablePaginationProps) {
  const { t } = useLanguage();

  const safePageCount = Math.max(1, pageCount);
  const safePage = Math.min(Math.max(1, page), safePageCount);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalItems);

  const prevDisabled =
    isLoading || (canPreviousPage !== undefined ? !canPreviousPage : safePage <= 1);
  const nextDisabled =
    isLoading || (canNextPage !== undefined ? !canNextPage : safePage >= safePageCount);

  const shouldShow =
    forceShow || safePageCount > 1 || totalItems > pageSize || safePage > 1;

  if (!shouldShow) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 px-2 py-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="page-description text-sm">
        {t("common.showingResults")
          .replace("{start}", String(start))
          .replace("{end}", String(end))
          .replace("{total}", String(totalItems))}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={prevDisabled}
          onClick={() => onPageChange(safePage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          {t("common.previous")}
        </Button>
        <span className="page-description text-sm">
          {t("common.page")} {safePage} {t("common.of")} {safePageCount}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={nextDisabled}
          onClick={() => onPageChange(safePage + 1)}
        >
          {t("common.next")}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
