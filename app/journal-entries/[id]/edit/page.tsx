import { Shell } from "@/presentation/components/layout/Shell";
import { EditJournalEntryForm } from "@/features/journal-entries/presentation/EditJournalEntryForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JournalEntryEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditJournalEntryForm journalEntryId={id} />
    </Shell>
  );
}
