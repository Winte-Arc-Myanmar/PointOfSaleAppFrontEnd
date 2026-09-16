import { Shell } from "@/presentation/components/layout/Shell";
import { MembershipMemberDetail } from "@/features/memberships/presentation/MembershipMemberDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MembershipDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <MembershipMemberDetail membershipId={id} />
    </Shell>
  );
}
