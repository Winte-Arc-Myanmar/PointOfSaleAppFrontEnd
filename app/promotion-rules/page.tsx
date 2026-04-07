import { Shell } from "@/presentation/components/layout/Shell";
import { PromotionRuleList } from "@/features/promotion-rules/presentation/PromotionRuleList";

export default function PromotionRulesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Create and manage promotion rules and discount logic.
        </p>
        <section>
          <h2 className="section-label mb-4">Promotion rules</h2>
          <PromotionRuleList />
        </section>
      </div>
    </Shell>
  );
}

