import { Shell } from "@/presentation/components/layout/Shell";
import { PromotionRuleDetail } from "@/features/promotion-rules/presentation/PromotionRuleDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PromotionRuleDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <PromotionRuleDetail ruleId={id} />
    </Shell>
  );
}

