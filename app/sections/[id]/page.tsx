import { Shell } from "@/presentation/components/layout/Shell";
import { SectionDetail } from "@/features/sections/presentation/SectionDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SectionDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <SectionDetail sectionId={id} />
    </Shell>
  );
}
