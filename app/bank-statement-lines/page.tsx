import { Shell } from "@/presentation/components/layout/Shell";
import { BankStatementLinesPageWithStatementSelect } from "@/features/bank-statement-lines/presentation/BankStatementLinesPageWithStatementSelect";

export default function BankStatementLinesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Manage individual transactions on bank statements for reconciliation.
        </p>
        <section>
          <h2 className="section-label mb-4">Bank statement lines</h2>
          <BankStatementLinesPageWithStatementSelect />
        </section>
      </div>
    </Shell>
  );
}
