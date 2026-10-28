import { Shell } from "@/presentation/components/layout/Shell";
import { ExtraFeeList } from "@/features/extra-fees/presentation/ExtraFeeList";

export default function ExtraFeesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Fees the cashier can add to any bill, such as a plastic container or delivery. The cashier can change the
          amount on a bill, and use &quot;Other&quot; for anything not on the list. Fees have no tax, no service charge
          and no promotions.
        </p>
        <ExtraFeeList />
      </div>
    </Shell>
  );
}
