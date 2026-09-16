"use client";

import Link from "next/link";
import { Network, Printer } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { DetailSection } from "@/presentation/components/detail";
import { useKitchenPrinters } from "@/presentation/hooks/useKitchenPrinters";
import { usePrinterPreferences } from "@/presentation/hooks/usePrinterPreferences";
import { useToast } from "@/presentation/providers/ToastProvider";

export function KitchenPrinterConnection({
  defaultPrinterId,
  compact = false,
}: {
  defaultPrinterId?: string;
  compact?: boolean;
}) {
  const toast = useToast();
  const { preferences, setKitchenPrinterId } = usePrinterPreferences();
  const { data: printersResult, isLoading } = useKitchenPrinters({
    page: 1,
    limit: 200,
    sortBy: "name",
    sortOrder: "asc",
  });
  const printers = printersResult?.items ?? [];
  const selectedId =
    defaultPrinterId ?? preferences.kitchen.printerId ?? "";
  const selectedPrinter = printers.find(
    (printer) => String(printer.id) === String(selectedId),
  );

  return (
    <DetailSection title="Kitchen printer" icon={Printer}>
      <p className="mb-4 text-sm text-muted">
        Choose which network kitchen printer this POS terminal should use. Kitchen
        printers are Wi‑Fi or Ethernet devices (IP:port). Tickets are sent from the
        server over the LAN — the browser cannot open raw TCP 9100 itself.
      </p>

      <div className="grid gap-2">
        <Label>Active kitchen printer</Label>
        <Select
          value={selectedId || undefined}
          onValueChange={(value) => {
            setKitchenPrinterId(value);
            const printer = printers.find((item) => String(item.id) === value);
            toast.success(
              printer
                ? `This terminal will use ${printer.name}.`
                : "Kitchen printer assigned.",
            );
          }}
          disabled={isLoading || Boolean(defaultPrinterId)}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={isLoading ? "Loading printers..." : "Select kitchen printer"}
            />
          </SelectTrigger>
          <SelectContent>
            {printers.map((printer) => (
              <SelectItem key={String(printer.id)} value={String(printer.id)}>
                {printer.name} ({printer.ipAddress}:{printer.port})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-background/80 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Network target</p>
            {selectedPrinter ? (
              <>
                <p className="font-mono text-sm text-foreground">
                  {selectedPrinter.ipAddress}:{selectedPrinter.port}
                </p>
                <p className="text-sm text-muted">
                  Status: {selectedPrinter.isActive ? "Active" : "Inactive"}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">No kitchen printer selected yet.</p>
            )}
            <p className="text-xs text-muted">
              Kitchen tickets are sent over Wi‑Fi/Ethernet to this IP from the server
              when orders are fired. Verify the printer is online on your LAN.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedPrinter ? (
              <Link href={`/kitchen-printers/${selectedPrinter.id}`}>
                <Button type="button" variant="outline">
                  <Network className="size-4" />
                  Open printer record
                </Button>
              </Link>
            ) : null}
            {!compact ? (
              <Link href="/kitchen-printers">
                <Button type="button" variant="ghost">Manage printers</Button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </DetailSection>
  );
}
