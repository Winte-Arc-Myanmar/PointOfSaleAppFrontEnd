import type { DataTableColumn } from "@/presentation/components/data-table";
import type { Section } from "@/core/domain/entities/Section";

type SectionTableColumnOptions = {
  locationNames?: Record<string, string>;
  onView?: (section: Section) => void;
};

export function getSectionTableColumns(
  options: SectionTableColumnOptions = {}
): DataTableColumn<Section>[] {
  const { onView, locationNames = {} } = options;
  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[180px]",
      render: (s) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground hover:text-mint transition-colors"
            onClick={() => onView(s)}
          >
            {s.name}
          </button>
        ) : (
          <span className="font-medium text-foreground">{s.name}</span>
        ),
    },
    {
      key: "color",
      header: "Color",
      className: "min-w-[120px]",
      render: (s) => (
        <div className="inline-flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full border border-border"
            style={{ backgroundColor: s.color }}
          />
          <span className="font-mono text-xs text-muted">{s.color}</span>
        </div>
      ),
    },
    {
      key: "locationId",
      header: "Outlet",
      className: "min-w-[220px] max-w-[260px]",
      render: (r) => locationNames[r.locationId] ?? "—",
    },
  ];
}
