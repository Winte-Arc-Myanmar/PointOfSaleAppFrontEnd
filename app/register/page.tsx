/**
 * Register page - SSR shell, client form.
 */

import { AuthPageLayout } from "@/presentation/components/layout/AuthPageLayout";
import { RegisterForm } from "@/features/auth/presentation/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthPageLayout
      title="Vision AI POS"
      subtitle="Create your account"
    >
      <RegisterForm />
    </AuthPageLayout>
  );
}
