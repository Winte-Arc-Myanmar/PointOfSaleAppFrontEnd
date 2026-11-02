import { Shell } from "@/presentation/components/layout/Shell";
import { OrderEditList } from "@/features/sales-orders/presentation/OrderEditList";

export default function OrderEditsPage() {
  return (
    <Shell>
      <OrderEditList />
    </Shell>
  );
}
