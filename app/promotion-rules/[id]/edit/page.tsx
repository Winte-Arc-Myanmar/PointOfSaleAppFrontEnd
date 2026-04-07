import { Shell } from "@/presentation/components/layout/Shell";
import { EditPromotionRuleForm } from "@/features/promotion-rules/presentation/EditPromotionRuleForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PromotionRuleEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditPromotionRuleForm ruleId={id} />
    </Shell>
  );
}

