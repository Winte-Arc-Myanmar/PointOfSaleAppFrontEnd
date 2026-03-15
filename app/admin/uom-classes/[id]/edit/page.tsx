/**
 * UOM Class edit page - system_admin only.
 */

import { Shell } from "@/presentation/components/layout/Shell";
import { EditUomClassForm } from "@/features/uom-classes/presentation/EditUomClassForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UomClassEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditUomClassForm uomClassId={id} />
    </Shell>
  );
}
