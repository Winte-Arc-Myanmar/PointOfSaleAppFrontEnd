import { Shell } from "@/presentation/components/layout/Shell";
import { SpaPackageList } from "@/features/spa/presentation/SpaPackageList";

export default function SpaPackagesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          What SPA guests buy: each treatment with how long it takes and its price, optionally with
          food or drinks included.
        </p>
        <SpaPackageList />
      </div>
    </Shell>
  );
}
