"use client";

import { useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import type { ImportResult, RowAction, SheetKind } from "@/core/domain/entities/DataTransfer";
import { Button } from "@/presentation/components/ui/button";
import { Modal } from "@/presentation/components/modal/Modal";
import { useToast } from "@/presentation/providers/ToastProvider";
import {
  useImportCommit,
  useImportPreview,
  useSheetDownload,
} from "@/presentation/hooks/useDataTransfer";
import { getHttpErrorMessage } from "@/lib/http-error";
import { cn } from "@/lib/utils";

const ACTION_LABEL: Record<RowAction, string> = {
  create: "New",
  update: "Update",
  unchanged: "No change",
  error: "Error",
};

const ACTION_STYLE: Record<RowAction, string> = {
  create: "bg-mint/15 text-mint",
  update: "bg-sky-500/15 text-sky-400",
  unchanged: "bg-muted/15 text-muted",
  error: "bg-red-500/15 text-red-400",
};

/** A download that failed arrives as a Blob; read the API's message out of it. */
async function errorMessage(error: unknown, fallback: string): Promise<string> {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (data instanceof Blob) {
    try {
      const body = JSON.parse(await data.text()) as { error?: { message?: string } };
      if (body.error?.message) return body.error.message;
    } catch {
      // Not JSON; fall through to the generic message.
    }
  }
  return getHttpErrorMessage(error, fallback);
}

function saveFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

/** Template, Export and Import for one kind of data, with a preview before saving. */
export function ExcelTransferButtons({
  kind,
  label,
}: {
  kind: SheetKind;
  /** What the rows are, for the buttons' titles: "users", "products", "stock". */
  label?: string;
}) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const download = useSheetDownload();
  const preview = useImportPreview();
  const commit = useImportCommit();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [saved, setSaved] = useState(false);
  const what = label ?? kind;

  const get = (which: "template" | "export") =>
    download.mutate(
      { kind, what: which },
      {
        onSuccess: (blob) =>
          saveFile(
            blob,
            which === "template"
              ? `${kind}-template.xlsx`
              : `${kind}-${new Date().toISOString().slice(0, 10)}.xlsx`,
          ),
        onError: async (error) =>
          toast.error(await errorMessage(error, "Could not download the file.")),
      },
    );

  const choose = (chosen: File | undefined) => {
    if (input.current) input.current.value = "";
    if (!chosen) return;
    setFile(chosen);
    setShowAll(false);
    setSaved(false);
    preview.mutate(
      { kind, file: chosen },
      {
        onSuccess: setResult,
        onError: (error) =>
          toast.error(getHttpErrorMessage(error, "Could not read the file.")),
      },
    );
  };

  const close = () => {
    setResult(null);
    setFile(null);
    setSaved(false);
  };

  const save = () => {
    if (!file) return;
    commit.mutate(
      { kind, file },
      {
        onSuccess: (saved) => {
          if (!saved.committed) {
            setResult(saved);
            toast.error("Nothing was saved: fix the rows marked Error and upload again.");
            return;
          }
          toast.success(
            `Saved: ${saved.summary.create} new, ${saved.summary.update} updated.`,
          );
          if (kind === "users" && saved.summary.create > 0) {
            setResult(saved);
            setSaved(true);
            return;
          }
          close();
        },
        onError: (error) =>
          toast.error(getHttpErrorMessage(error, "Could not save the file.")),
      },
    );
  };

  const summary = result?.summary;
  const changes = summary ? summary.create + summary.update : 0;
  const rows = result
    ? showAll
      ? result.rows
      : result.rows.filter((row) => row.action !== "unchanged")
    : [];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={download.isPending}
        onClick={() => get("template")}
        title={`Download an empty ${what} sheet to fill in`}
      >
        <FileSpreadsheet className="mr-1.5 size-4" />
        Template
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={download.isPending}
        onClick={() => get("export")}
        title={`Download all ${what} as Excel`}
      >
        <Download className="mr-1.5 size-4" />
        Export
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={preview.isPending}
        onClick={() => input.current?.click()}
        title={`Upload an Excel file of ${what}`}
      >
        <Upload className="mr-1.5 size-4" />
        {preview.isPending ? "Checking..." : "Import"}
      </Button>
      <input
        ref={input}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={(event) => choose(event.target.files?.[0])}
      />

      <Modal
        isOpen={Boolean(result)}
        onClose={close}
        title={`Import ${what}`}
        description={file?.name}
        maxWidth="2xl"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <p className="text-xs text-muted">
              {saved
                ? "Saved. Give each new user their User ID to sign in with."
                : summary?.error
                  ? "Fix the rows marked Error in the file and upload it again. Nothing is saved until every row is right."
                  : "Nothing has been saved yet."}
            </p>
            {saved ? (
              <Button type="button" onClick={close}>
                Done
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={Boolean(summary?.error) || changes === 0 || commit.isPending}
                  onClick={save}
                >
                  {commit.isPending ? "Saving..." : `Save ${changes} row${changes === 1 ? "" : "s"}`}
                </Button>
              </div>
            )}
          </div>
        }
      >
        {summary ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(ACTION_LABEL) as RowAction[]).map((action) => (
                <span
                  key={action}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-semibold",
                    ACTION_STYLE[action],
                  )}
                >
                  {ACTION_LABEL[action]} · {summary[action]}
                </span>
              ))}
            </div>
            <div className="max-h-[55vh] overflow-y-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background text-left text-xs uppercase text-muted">
                  <tr>
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2">Result</th>
                    <th className="px-3 py-2">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {rows.map((row) => (
                    <tr key={row.rowNumber} className="align-top">
                      <td className="px-3 py-2 text-muted">{row.rowNumber}</td>
                      <td className="px-3 py-2 font-medium break-all">{row.key}</td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            "rounded px-2 py-0.5 text-xs font-semibold",
                            ACTION_STYLE[row.action],
                          )}
                        >
                          {ACTION_LABEL[row.action]}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted">
                        {row.messages.join(" · ")}
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-sm text-muted">
                        Every row matches what is already saved.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            {summary.unchanged ? (
              <button
                type="button"
                className="text-xs text-muted underline underline-offset-2 hover:text-foreground"
                onClick={() => setShowAll((all) => !all)}
              >
                {showAll
                  ? "Hide rows with no change"
                  : `Show ${summary.unchanged} row${summary.unchanged === 1 ? "" : "s"} with no change`}
              </button>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
