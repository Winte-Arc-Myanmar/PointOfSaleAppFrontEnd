import { Shell } from "@/presentation/components/layout/Shell";
import { JournalLinesPageWithEntrySelect } from "@/features/journal-lines/presentation/JournalLinesPageWithEntrySelect";

export default function JournalLinesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Manage debit and credit lines for journal entries, including multi-currency amounts.
        </p>
        <section>
          <h2 className="section-label mb-4">Journal lines</h2>
          <JournalLinesPageWithEntrySelect />
        </section>
      </div>
    </Shell>
  );
}
