import { Shell } from "@/presentation/components/layout/Shell";
import { BankStatementList } from "@/features/bank-statements/presentation/BankStatementList";

export default function BankStatementsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage bank statements.</p>
        <section>
          <h2 className="section-label mb-4">Bank statements</h2>
          <BankStatementList />
        </section>
      </div>
    </Shell>
  );
}
