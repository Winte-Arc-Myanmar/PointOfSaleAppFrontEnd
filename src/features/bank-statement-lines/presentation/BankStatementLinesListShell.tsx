"use client";

import Link from "next/link";
import { Shell } from "@/presentation/components/layout/Shell";
import { Button } from "@/presentation/components/ui/button";
import { useBankStatement } from "@/presentation/hooks/useBankStatements";
import { formatDate } from "@/presentation/components/detail";
import { BankStatementLineList } from "./BankStatementLineList";

export function BankStatementLinesListShell({
  bankStatementId,
}: {
  bankStatementId: string;
}) {
  const { data: statement } = useBankStatement(bankStatementId);
  const statementLabel = statement
    ? `Statement ${formatDate(statement.statementDate)}`
    : bankStatementId;

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/bank-statement-lines">
            <Button variant="outline" size="sm">
              All statements
            </Button>
          </Link>
          <Link href={`/bank-statements/${bankStatementId}`}>
            <Button variant="outline" size="sm">
              Bank statement
            </Button>
          </Link>
          <p className="page-description mb-0">
            Lines for: <span className="font-semibold text-foreground">{statementLabel}</span>
          </p>
        </div>
        <section>
          <h2 className="section-label mb-4">Bank statement lines</h2>
          <BankStatementLineList bankStatementId={bankStatementId} />
        </section>
      </div>
    </Shell>
  );
}
