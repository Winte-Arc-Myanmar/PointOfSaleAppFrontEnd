import { Shell } from "@/presentation/components/layout/Shell";
import { JournalLineDetail } from "@/features/journal-lines/presentation/JournalLineDetail";

interface PageProps {
  params: Promise<{ journalEntryId: string; lineId: string }>;
}

export default async function JournalLineDetailPage({ params }: PageProps) {
  const { journalEntryId, lineId } = await params;
  return (
    <Shell>
      <JournalLineDetail journalEntryId={journalEntryId} lineId={lineId} />
    </Shell>
  );
}
