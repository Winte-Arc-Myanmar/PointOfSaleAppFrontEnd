import { Shell } from "@/presentation/components/layout/Shell";
import { PromotionRuleList } from "@/features/promotion-rules/presentation/PromotionRuleList";

export default function PromotionRulesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Discounts the system applies by itself while they run, at the counter, tables, SPA and Private VIP Lounges. How many one item can
          get at once is set in Venue setup.
        </p>
        <section>
          <h2 className="section-label mb-4">Promotions</h2>
          <PromotionRuleList />
        </section>
      </div>
    </Shell>
  );
}

