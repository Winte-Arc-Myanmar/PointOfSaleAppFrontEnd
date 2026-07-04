import { Shell } from "@/presentation/components/layout/Shell";
import { CounterOrderList } from "@/features/counter-orders/presentation/CounterOrderList";

export default function CounterOrdersPage() {
  return (
    <Shell>
      <CounterOrderList />
    </Shell>
  );
}
