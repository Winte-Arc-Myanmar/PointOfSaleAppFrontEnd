import { Shell } from "@/presentation/components/layout/Shell";
import { MembershipMemberList } from "@/features/memberships/presentation/MembershipMemberList";

export default function MembershipsPage() {
  return (
    <Shell>
      <MembershipMemberList />
    </Shell>
  );
}
