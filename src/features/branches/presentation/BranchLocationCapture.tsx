"use client";

import { useState } from "react";
import { Crosshair, MapPin } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Label } from "@/presentation/components/ui/label";
import type { ToastApi } from "@/presentation/providers/ToastProvider";

export interface BranchLocationCaptureProps {
  latitude: string;
  longitude: string;
  onCoordinatesChange: (lat: string, lng: string) => void;
  onClear: () => void;
  toast: ToastApi;
}

export function BranchLocationCapture({
  latitude,
  longitude,
  onCoordinatesChange,
  onClear,
  toast,
}: BranchLocationCaptureProps) {
  const [loading, setLoading] = useState(false);
  const hasCoords = Boolean(latitude?.trim() && longitude?.trim());

  function captureFromDevice() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Location is not supported in this browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onCoordinatesChange(
          String(pos.coords.latitude),
          String(pos.coords.longitude)
        );
        setLoading(false);
        toast.success("Location captured from this device.");
      },
      (err) => {
        setLoading(false);
        const denied = err.code === 1;
        toast.error(
          denied
            ? "Location permission denied. Allow access in your browser settings."
            : "Could not determine your location. Try again or skip this step."
        );
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 }
    );
  }

  const latN = Number(latitude);
  const lngN = Number(longitude);
  const coordSummary =
    hasCoords && Number.isFinite(latN) && Number.isFinite(lngN)
      ? `${latN.toFixed(6)}, ${lngN.toFixed(6)}`
      : hasCoords
        ? `${latitude}, ${longitude}`
        : null;

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/25 p-4">
      <div className="flex items-start gap-2.5">
        <MapPin className="mt-0.5 size-4 shrink-0 text-mint" aria-hidden />
        <div className="min-w-0 space-y-1">
          <Label className="text-foreground">Map location (optional)</Label>
          <p className="text-xs leading-relaxed text-muted">
            Capture GPS while you are at the branch. You do not need to type
            coordinates.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={loading}
          onClick={captureFromDevice}
          className="gap-1.5"
        >
          <Crosshair className="size-3.5 shrink-0" aria-hidden />
          {loading ? "Getting location…" : "Use current location"}
        </Button>
        {hasCoords ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted"
            onClick={onClear}
          >
            Clear location
          </Button>
        ) : null}
      </div>
      {coordSummary ? (
        <p
          className="w-fit max-w-full truncate rounded-md border border-border/80 bg-background/90 px-2 py-1.5 font-mono text-xs text-muted"
          title={coordSummary}
        >
          {coordSummary}
        </p>
      ) : (
        <p className="text-xs text-muted">
          No pin yet — save without coordinates or capture when you are on site.
        </p>
      )}
    </div>
  );
}
