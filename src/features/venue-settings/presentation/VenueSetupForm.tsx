"use client";

import { useState } from "react";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useUpdateVenueSettings, useVenueSettings } from "@/presentation/hooks/useVenueSettings";
import { apiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import type { RoomPaymentTiming, VenueSettingUpdate } from "@/core/domain/entities/VenueSetting";

type Draft = Required<VenueSettingUpdate>;

function SwitchRow({
  title,
  hint,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4 py-3", disabled && "opacity-50")}>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-emerald-500" : "bg-muted-foreground/30",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-background/80 px-5 py-4 shadow-sm">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

const TIMING: { value: RoomPaymentTiming; title: string; hint: string }[] = [
  {
    value: "PAY_WHEN_ORDERING",
    title: "Pay when ordering",
    hint: "Starting a room, adding time and every food or drink order is paid on the spot, by tapping the member card.",
  },
  {
    value: "PAY_AT_END",
    title: "Pay at the end",
    hint: "The bill stays open while the guest is here and is paid in full when the room is closed, by cash, card, member card or any payment method you use.",
  },
];

export function VenueSetupForm() {
  const toast = useToast();
  const { data: saved, isLoading, error, refetch } = useVenueSettings();
  const update = useUpdateVenueSettings();
  const [edits, setEdits] = useState<Partial<Draft>>({});

  if (isLoading) {
    return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  }
  if (error || !saved) {
    return (
      <div className="space-y-3">
        <p className="text-red-500">{apiErrorMessage(error, "Couldn't load the venue setup.")}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const draft: Draft = {
    spaEnabled: saved.spaEnabled,
    spaMenuOrdering: saved.spaMenuOrdering,
    ktvEnabled: saved.ktvEnabled,
    ktvMenuOrdering: saved.ktvMenuOrdering,
    paymentTiming: saved.paymentTiming,
    ...edits,
  };
  const set = (patch: Partial<Draft>) => setEdits({ ...edits, ...patch });
  const changed = (Object.keys(draft) as (keyof Draft)[]).filter((k) => draft[k] !== saved[k]);

  const save = () => {
    const patch = Object.fromEntries(changed.map((k) => [k, draft[k]])) as VenueSettingUpdate;
    update.mutate(patch, {
      onSuccess: () => {
        setEdits({});
        toast.success("Venue setup saved.");
      },
      onError: (err) => toast.error(apiErrorMessage(err, "Couldn't save the venue setup.")),
    });
  };

  return (
    <div className="max-w-2xl space-y-5">
      <Card title="SPA">
        <SwitchRow
          title="Use SPA rooms"
          hint="Turn off if your business has no SPA. Staff and tablets can't start a treatment."
          checked={draft.spaEnabled}
          onChange={(v) => set({ spaEnabled: v })}
        />
        <SwitchRow
          title="Guests can order food and drinks during a treatment"
          hint="Turn off to sell treatments only."
          checked={draft.spaMenuOrdering}
          disabled={!draft.spaEnabled}
          onChange={(v) => set({ spaMenuOrdering: v })}
        />
      </Card>

      <Card title="KTV">
        <SwitchRow
          title="Use KTV rooms"
          hint="Turn off if your business has no KTV. Staff and tablets can't start a room."
          checked={draft.ktvEnabled}
          onChange={(v) => set({ ktvEnabled: v })}
        />
        <SwitchRow
          title="Guests can order food and drinks"
          hint="Turn off to sell room time only. The room tablet then shows no menu."
          checked={draft.ktvMenuOrdering}
          disabled={!draft.ktvEnabled}
          onChange={(v) => set({ ktvMenuOrdering: v })}
        />
      </Card>

      <section className="space-y-3 rounded-2xl border border-border bg-background/80 px-5 py-4 shadow-sm">
        <h2 className="text-base font-semibold">When do guests pay?</h2>
        <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
          {TIMING.map((option) => {
            const selected = draft.paymentTiming === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => set({ paymentTiming: option.value })}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  selected ? "border-mint bg-mint/15" : "border-border hover:border-mint/60",
                )}
              >
                <p className="text-sm font-semibold">{option.title}</p>
                <p className="mt-1 text-xs text-muted">{option.hint}</p>
              </button>
            );
          })}
        </div>
        {draft.paymentTiming === "PAY_AT_END" ? (
          <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
            Open-bill ordering is still being finished. Until it is released, the POS keeps taking
            payment when ordering.
          </p>
        ) : null}
      </section>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={save} disabled={changed.length === 0 || update.isPending}>
          {update.isPending ? "Saving..." : "Save changes"}
        </Button>
        {changed.length === 0 ? <span className="text-xs text-muted">No unsaved changes</span> : null}
      </div>
    </div>
  );
}
