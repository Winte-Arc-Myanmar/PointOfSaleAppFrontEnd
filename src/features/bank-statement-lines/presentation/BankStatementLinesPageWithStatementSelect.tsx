"use client";

import { useMemo, useState } from "react";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useBankStatements } from "@/presentation/hooks/useBankStatements";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { formatDate } from "@/presentation/components/detail";
import { BankStatementLineList } from "./BankStatementLineList";

const STATEMENT_LIST_LIMIT = 200;

export function BankStatementLinesPageWithStatementSelect() {
  const { data: statementsData, isLoading } = useBankStatements({
    page: 1,
    limit: STATEMENT_LIST_LIMIT,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const statements = getPaginatedItems(statementsData);
  const [selectedId, setSelectedId] = useState<string>("");

  const sorted = useMemo(
    () =>
      [...statements].sort((a, b) =>
        (b.statementDate ?? "").localeCompare(a.statementDate ?? "")
      ),
    [statements]
  );

  return (
    <div className="space-y-6">
      <div className="grid max-w-md gap-2">
        <Label htmlFor="bank-statement-select">Bank statement</Label>
        <Select value={selectedId} onValueChange={setSelectedId} disabled={isLoading}>
          <SelectTrigger id="bank-statement-select">
            <SelectValue
              placeholder={isLoading ? "Loading statements..." : "Select bank statement"}
            />
          </SelectTrigger>
          <SelectContent>
            {sorted.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {formatDate(s.statementDate)} — {s.closingBalance}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedId ? (
        <BankStatementLineList bankStatementId={selectedId} />
      ) : (
        <p className="text-sm text-muted">
          Select a bank statement to view and manage its lines.
        </p>
      )}
    </div>
  );
}
