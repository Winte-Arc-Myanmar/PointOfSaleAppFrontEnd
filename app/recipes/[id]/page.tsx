import { RecipeDetail } from "@/features/recipes/presentation/RecipeDetail";
import { Shell } from "@/presentation/components/layout/Shell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <RecipeDetail recipeId={id} />
    </Shell>
  );
}
