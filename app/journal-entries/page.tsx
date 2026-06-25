import { Shell } from "@/presentation/components/layout/Shell";
import { JournalEntryList } from "@/features/journal-entries/presentation/JournalEntryList";

export default function JournalEntriesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Record and manage general ledger journal entries with source tracking and posting status.
        </p>
        <section>
          <h2 className="section-label mb-4">Journal entries</h2>
          <JournalEntryList />
        </section>
      </div>
    </Shell>
  );
}
