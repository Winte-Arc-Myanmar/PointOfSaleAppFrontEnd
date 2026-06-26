import { JournalLinesListShell } from "@/features/journal-lines/presentation/JournalLinesListShell";

interface PageProps {
  params: Promise<{ journalEntryId: string }>;
}

export default async function JournalLinesForEntryPage({ params }: PageProps) {
  const { journalEntryId } = await params;
  return <JournalLinesListShell journalEntryId={journalEntryId} />;
}
