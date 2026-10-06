"use client";

import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { useKtvRooms } from "@/presentation/hooks/useKtvRooms";
import { useSpaRooms } from "@/presentation/hooks/useSpa";
import { useDiningTables } from "@/presentation/hooks/useDiningTables";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import type { ProductTerms, RentalPlace } from "@/core/domain/entities/Product";
import type { PosType } from "@/core/domain/entities/PosReport";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import { AREA_LABEL, KIND_OPTIONS, PLACE_AREA, PLACE_LABEL } from "./product-kind-text";

type Place = { id: string; label: string };

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        selected ? "border-mint bg-mint/15 font-medium" : "border-border text-muted hover:border-mint/60",
      )}
    >
      {children}
    </button>
  );
}

const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

function PlaceChips({
  places,
  isLoading,
  value,
  onChange,
  emptyText,
}: {
  places: Place[];
  isLoading: boolean;
  value: string[];
  onChange: (ids: string[]) => void;
  emptyText: string;
}) {
  const { t } = useLanguage();
  if (isLoading) return <p className="text-sm text-muted">…</p>;
  if (!places.length) return <p className="text-sm text-muted">{emptyText}</p>;
  return (
    <div className="flex flex-wrap gap-2">
      <Chip selected={value.length === 0} onClick={() => onChange([])}>
        {t("addProduct.allOfThem")}
      </Chip>
      {places.map((p) => (
        <Chip key={p.id} selected={value.includes(p.id)} onClick={() => onChange(toggle(value, p.id))}>
          {p.label}
        </Chip>
      ))}
    </div>
  );
}

type PickerProps = { tenantId: string; value: string[]; onChange: (ids: string[]) => void };

const roomLabel = (r: { roomNumber: string; name: string | null }) =>
  r.name ? `${r.roomNumber} · ${r.name}` : r.roomNumber;

function KtvRoomPicker({ tenantId, ...props }: PickerProps) {
  const { data, isLoading } = useKtvRooms({ page: 1, limit: 200 });
  const places = getPaginatedItems(data)
    .filter((r) => !tenantId || String(r.tenantId) === tenantId)
    .map((r) => ({ id: String(r.id), label: roomLabel(r) }));
  return <PlaceChips {...props} places={places} isLoading={isLoading} emptyText="No KTV rooms yet." />;
}

function SpaRoomPicker({ tenantId, ...props }: PickerProps) {
  const { data, isLoading } = useSpaRooms({ page: 1, limit: 200 });
  const places = getPaginatedItems(data)
    .filter((r) => !tenantId || String(r.tenantId) === tenantId)
    .map((r) => ({ id: String(r.id), label: roomLabel(r) }));
  return <PlaceChips {...props} places={places} isLoading={isLoading} emptyText="No SPA rooms yet." />;
}

function TablePicker({ tenantId, ...props }: PickerProps) {
  const { data, isLoading } = useDiningTables({ page: 1, limit: 500 });
  const places = getPaginatedItems(data)
    .filter((t) => !tenantId || String(t.tenantId) === tenantId)
    .map((t) => ({ id: String(t.id), label: t.tableNumber }));
  return <PlaceChips {...props} places={places} isLoading={isLoading} emptyText="No tables yet." />;
}

const PICKERS: Record<RentalPlace, (props: PickerProps) => React.ReactElement> = {
  KTV_ROOM: KtvRoomPicker,
  SPA_ROOM: SpaRoomPicker,
  TABLE: TablePicker,
};

/** The rooms or tables of one kind, as chips: All, or only those picked. */
export function PlacePicker({ rents, ...props }: PickerProps & { rents: RentalPlace }) {
  const Picker = PICKERS[rents];
  return <Picker {...props} />;
}

export function ProductKindFields({
  value,
  onChange,
  tenantId,
  error,
}: {
  value: ProductTerms;
  onChange: (value: ProductTerms) => void;
  tenantId: string;
  error?: string | null;
}) {
  const set = (patch: Partial<ProductTerms>) => onChange({ ...value, ...patch });
  const Picker = value.rents ? PICKERS[value.rents] : null;

  return (
    <section className="space-y-4 rounded-xl border border-border p-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">What is it?</p>
        <div role="radiogroup" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {KIND_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={value.kind === o.value}
              onClick={() =>
                set({
                  kind: o.value,
                  ...(o.value === "RENTAL" && value.soldBy === "EACH"
                    ? { soldBy: "TIME", timeBlockMinutes: value.timeBlockMinutes ?? 60 }
                    : {}),
                })
              }
              className={cn(
                "rounded-lg border p-3 text-left",
                value.kind === o.value ? "border-mint bg-mint/15" : "border-border hover:border-mint/60",
              )}
            >
              <span className="block text-sm font-medium">{o.title}</span>
              <span className="block text-xs text-muted">{o.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {value.kind === "RENTAL" ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Rents</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PLACE_LABEL) as RentalPlace[]).map((place) => (
              <Chip
                key={place}
                selected={value.rents === place}
                onClick={() =>
                  set({
                    rents: place,
                    rentalPlaceIds: value.rents === place ? value.rentalPlaceIds : [],
                    soldAt: value.soldAt.length ? value.soldAt : [PLACE_AREA[place]],
                  })
                }
              >
                {PLACE_LABEL[place]}
              </Chip>
            ))}
          </div>
          {Picker ? (
            <div className="space-y-1">
              <p className="text-xs text-muted">Which ones? All, or only those you pick (e.g. VIP rooms).</p>
              <Picker
                tenantId={tenantId}
                value={value.rentalPlaceIds}
                onChange={(rentalPlaceIds) => set({ rentalPlaceIds })}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-sm font-medium">Sold at</p>
        <div className="flex flex-wrap gap-2">
          <Chip selected={value.soldAt.length === 0} onClick={() => set({ soldAt: [] })}>
            Everywhere
          </Chip>
          {(Object.keys(AREA_LABEL) as PosType[]).map((area) => (
            <Chip key={area} selected={value.soldAt.includes(area)} onClick={() => set({ soldAt: toggle(value.soldAt, area) })}>
              {AREA_LABEL[area]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Sold by</p>
        <div className="flex flex-wrap gap-2">
          <Chip selected={value.soldBy === "EACH"} onClick={() => set({ soldBy: "EACH" })}>
            Each
          </Chip>
          <Chip
            selected={value.soldBy === "TIME"}
            onClick={() => set({ soldBy: "TIME", timeBlockMinutes: value.timeBlockMinutes ?? 60 })}
          >
            Time
          </Chip>
        </div>
        {value.soldBy === "TIME" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-1">
              <Label htmlFor="time-block">Minutes per unit</Label>
              <Input
                id="time-block"
                type="number"
                min={1}
                max={1440}
                value={value.timeBlockMinutes ?? ""}
                onChange={(e) => set({ timeBlockMinutes: e.target.value ? Number(e.target.value) : null })}
              />
              <p className="text-xs text-muted">60 = the price is per hour.</p>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="minimum-blocks">Minimum units</Label>
              <Input
                id="minimum-blocks"
                type="number"
                min={1}
                max={100}
                value={value.minimumBlocks ?? 1}
                onChange={(e) => set({ minimumBlocks: e.target.value ? Number(e.target.value) : null })}
              />
            </div>
          </div>
        ) : null}
      </div>

      {value.kind === "SERVICE" ? (
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border border-input"
            checked={value.askWhoServed}
            onChange={(e) => set({ askWhoServed: e.target.checked })}
          />
          Ask who served (e.g. pick the hostess or therapist at the till)
        </label>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
