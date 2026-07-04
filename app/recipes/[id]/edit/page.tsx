import { EditRecipeForm } from "@/features/recipes/presentation/EditRecipeForm";
import { Shell } from "@/presentation/components/layout/Shell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditRecipeForm recipeId={id} />
    </Shell>
  );
}
