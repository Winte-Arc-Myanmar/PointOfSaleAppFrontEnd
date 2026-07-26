import { GrnLinesListShell } from "@/features/grn-lines/presentation/GrnLinesListShell";

interface PageProps {
  params: Promise<{ grnId: string }>;
}

export default async function GrnLinesForGrnPage({ params }: PageProps) {
  const { grnId } = await params;
  return <GrnLinesListShell grnId={grnId} />;
}
