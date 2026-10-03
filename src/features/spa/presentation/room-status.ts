export const ROOM_STATUS: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: "Available", className: "bg-emerald-100 text-emerald-800" },
  OCCUPIED: { label: "In use", className: "bg-sky-100 text-sky-800" },
  CLEANING: { label: "Being cleaned", className: "bg-amber-100 text-amber-800" },
  OUT_OF_SERVICE: { label: "Out of service", className: "bg-muted text-muted-foreground" },
};
