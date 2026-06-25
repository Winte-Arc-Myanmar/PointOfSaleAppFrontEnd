import { Shell } from "@/presentation/components/layout/Shell";
import { JournalEntryDetail } from "@/features/journal-entries/presentation/JournalEntryDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JournalEntryDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <JournalEntryDetail journalEntryId={id} />
    </Shell>
  );
}
