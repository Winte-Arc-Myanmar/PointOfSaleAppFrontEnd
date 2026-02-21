/**
 * Login page - SSR shell, client form.
 */

import { AuthPageLayout } from "@/presentation/components/layout/AuthPageLayout";
import { LoginForm } from "@/features/auth/presentation/LoginForm";

export default function LoginPage() {
  return (
    <AuthPageLayout
      title="Vision AI POS"
      subtitle="Sign in to continue"
    >
      <LoginForm />
    </AuthPageLayout>
  );
}
