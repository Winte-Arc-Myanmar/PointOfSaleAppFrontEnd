"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";

interface DetailPageHeaderProps {
  backHref: string;
  backLabel: string;
  title: string;
  /** When omitted, no edit button is shown (e.g. read-only ledger lines). */
  editHref?: string;
}

export function DetailPageHeader({
  backHref,
  backLabel,
  title,
  editHref,
}: DetailPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Link href={backHref}>
        <Button variant="ghost" size="icon" aria-label={`Back to ${backLabel}`}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>
      <h1 className="panel-header text-xl tracking-tight text-foreground flex-1 min-w-0">{title}</h1>
      {editHref ? (
        <Link href={editHref}>
          <Button>Edit</Button>
        </Link>
      ) : null}
    </div>
  );
}
