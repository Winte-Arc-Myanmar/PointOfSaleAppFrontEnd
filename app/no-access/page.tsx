import { AuthPageLayout } from "@/presentation/components/layout/AuthPageLayout";
import { NoAccessNotice } from "@/features/auth/presentation/NoAccessNotice";

export default function NoAccessPage() {
  return (
    <AuthPageLayout subtitle="No access yet">
      <NoAccessNotice />
    </AuthPageLayout>
  );
}
