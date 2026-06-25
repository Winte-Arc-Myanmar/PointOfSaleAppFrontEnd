import { Shell } from "@/presentation/components/layout/Shell";
import { BankStatementList } from "@/features/bank-statements/presentation/BankStatementList";

export default function BankStatementsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Import and manage bank statements with opening and closing balances per GL account.
        </p>
        <section>
          <h2 className="section-label mb-4">Bank statements</h2>
          <BankStatementList />
        </section>
      </div>
    </Shell>
  );
}
