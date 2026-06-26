import { Shell } from "@/presentation/components/layout/Shell";
import { EditJournalLineForm } from "@/features/journal-lines/presentation/EditJournalLineForm";

interface PageProps {
  params: Promise<{ journalEntryId: string; lineId: string }>;
}

export default async function JournalLineEditPage({ params }: PageProps) {
  const { journalEntryId, lineId } = await params;
  return (
    <Shell>
      <EditJournalLineForm journalEntryId={journalEntryId} lineId={lineId} />
    </Shell>
  );
}
