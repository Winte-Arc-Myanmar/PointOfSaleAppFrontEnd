import { RecipeList } from "@/features/recipes/presentation/RecipeList";
import { Shell } from "@/presentation/components/layout/Shell";

export default function RecipesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage recipes.</p>
        <section>
          <h2 className="section-label mb-4">Recipes</h2>
          <RecipeList />
        </section>
      </div>
    </Shell>
  );
}
