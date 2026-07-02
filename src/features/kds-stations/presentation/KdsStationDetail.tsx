"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FolderTree, Info, Monitor, UtensilsCrossed } from "lucide-react";
import { useKdsStation } from "@/presentation/hooks/useKdsStations";
import { useCategories } from "@/presentation/hooks/useCategories";
import { useLocations } from "@/presentation/hooks/useLocations";
import { useSections } from "@/presentation/hooks/useSections";
import { useTableSessions } from "@/presentation/hooks/useTableSessions";
import { useDiningZones } from "@/presentation/hooks/useDiningZones";
import { useDiningTables } from "@/presentation/hooks/useDiningTables";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import {
  DetailPageHeader,
  DetailRows,
  DetailSection,
  formatDate,
  safeText,
} from "@/presentation/components/detail";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

export function KdsStationDetail({ stationId }: { stationId: string }) {
  const { data: station, isLoading, error } = useKdsStation(stationId);
  const { data: categoriesResult } = useCategories({ page: 1, limit: 200 });
  const { data: locationsData } = useLocations({ page: 1, limit: 200 });
  const { data: sectionsData } = useSections({ page: 1, limit: 200 });
  const { data: openSessionsData } = useTableSessions({
    page: 1,
    limit: 200,
    openOnly: true,
    sortBy: "openedAt",
    sortOrder: "desc",
  });
  const { data: zonesData } = useDiningZones({ page: 1, limit: 200, sortBy: "sortOrder", sortOrder: "asc" });
  const { data: tablesData } = useDiningTables({ page: 1, limit: 200, sortBy: "tableNumber", sortOrder: "asc" });

  const categories = getPaginatedItems(categoriesResult);
  const locations = getPaginatedItems(locationsData);
  const sections = getPaginatedItems(sectionsData);
  const openSessions = getPaginatedItems(openSessionsData);
  const zones = getPaginatedItems(zonesData);
  const tables = getPaginatedItems(tablesData);

  const location = useMemo(
    () => (station ? locations.find((item) => String(item.id) === station.locationId) : null),
    [locations, station],
  );

  const routedCategories = useMemo(() => {
    if (!station) return [];
    const ids = new Set(station.routingRules.categoryIds);
    return categories.filter((category) => ids.has(String(category.id)));
  }, [categories, station]);

  const relatedSections = useMemo(
    () =>
      station
        ? sections.filter(
            (section) =>
              section.tenantId === station.tenantId && section.locationId === station.locationId,
          )
        : [],
    [sections, station],
  );

  const relatedOpenSessions = useMemo(
    () =>
      station
        ? openSessions.filter((session) => session.tenantId === station.tenantId)
        : [],
    [openSessions, station],
  );

  const relatedZones = useMemo(
    () => (station ? zones.filter((zone) => zone.tenantId === station.tenantId) : []),
    [zones, station],
  );

  const relatedTables = useMemo(
    () =>
      station
        ? tables.filter((table) => table.tenantId === station.tenantId)
        : [],
    [tables, station],
  );

  const overviewRows = useMemo(
    () =>
      station
        ? [
            { label: "Station ID", value: safeText(station.id), mono: true },
            { label: "Name", value: safeText(station.name) },
            {
              label: "Display color",
              value: (
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full border border-border"
                    style={{ backgroundColor: station.displayColor }}
                  />
                  <span className="font-mono text-xs">{station.displayColor}</span>
                </span>
              ),
            },
            { label: "Location", value: location?.name || safeText(station.locationId) },
            { label: "Tenant ID", value: safeText(station.tenantId), mono: true },
          ]
        : [],
    [location, station],
  );

  const recordRows = useMemo(
    () =>
      station
        ? [
            { label: "Created at", value: formatDate(station.createdAt ?? undefined) },
            { label: "Updated at", value: formatDate(station.updatedAt ?? undefined) },
          ]
        : [],
    [station],
  );

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading KDS station..." />;
  if (error || !station) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">KDS station not found or failed to load.</p>
        <Link href="/kds-stations">
          <Button variant="outline">Back to KDS Stations</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/kds-stations"
        backLabel="KDS Stations"
        title={safeText(station.name)}
        editHref={`/kds-stations/${station.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Station overview" icon={Monitor}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>

      <DetailSection title="Category routing" icon={FolderTree}>
        {routedCategories.length === 0 ? (
          <p className="text-sm text-muted">No categories routed to this station.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {routedCategories.map((category) => (
              <span
                key={category.id}
                className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection title="Dining floor context" icon={UtensilsCrossed}>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium mb-2">Service sections at this location</p>
            {relatedSections.length === 0 ? (
              <p className="text-muted">No sections configured for this location.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {relatedSections.map((section) => (
                  <Link
                    key={section.id}
                    href={`/sections/${section.id}`}
                    className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs hover:text-mint transition-colors"
                  >
                    <span
                      className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: section.color || "#9CA3AF" }}
                    />
                    {section.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-md border border-border p-3">
              <p className="text-xs text-muted">Dining zones (tenant)</p>
              <p className="text-lg font-semibold">{relatedZones.length}</p>
              <Link href="/dining-zones" className="text-xs text-mint hover:underline">
                View dining zones
              </Link>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-xs text-muted">Dining tables (tenant)</p>
              <p className="text-lg font-semibold">{relatedTables.length}</p>
              <Link href="/dining-tables" className="text-xs text-mint hover:underline">
                View dining tables
              </Link>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-xs text-muted">Open table sessions</p>
              <p className="text-lg font-semibold">{relatedOpenSessions.length}</p>
              <Link href="/table-sessions" className="text-xs text-mint hover:underline">
                View table sessions
              </Link>
            </div>
          </div>

          <p className="text-xs text-muted">
            KDS stations route kitchen tickets by menu category. Table sessions at this location
            generate order lines that flow to stations based on these category rules.
          </p>
        </div>
      </DetailSection>
    </div>
  );
}
