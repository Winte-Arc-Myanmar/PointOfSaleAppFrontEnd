"use client";

import Link from "next/link";
import { FlaskConical, Info, ListTree } from "lucide-react";
import { useRecipe } from "@/presentation/hooks/useRecipes";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function RecipeDetail({ recipeId }: { recipeId: string }) {
  const { data: recipe, isLoading, error } = useRecipe(recipeId);

  if (isLoading) {
    return <AppLoader fullScreen={false} size="md" message="Loading recipe..." />;
  }

  if (error || !recipe) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Recipe not found or failed to load.</p>
        <Link href="/recipes">
          <Button variant="outline">Back to Recipes</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "ID", value: safeText(recipe.id), mono: true },
    { label: "Tenant ID", value: safeText(recipe.tenantId), mono: true },
    { label: "Variant ID", value: safeText(recipe.variantId), mono: true },
    { label: "Yield", value: safeText(recipe.yield) },
    { label: "Status", value: recipe.isActive ? "Active" : "Inactive" },
    { label: "Notes", value: safeText(recipe.notes) },
  ];

  const recordRows = [
    { label: "Created at", value: formatDate(recipe.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(recipe.updatedAt ?? undefined) },
    { label: "Deleted at", value: formatDate(recipe.deletedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/recipes"
        backLabel="Recipes"
        title={`Recipe: ${safeText(recipe.variantId)}`}
        editHref={`/recipes/${recipe.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={FlaskConical}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>

      <DetailSection title="Ingredients" icon={ListTree}>
        {recipe.ingredients && recipe.ingredients.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Ingredient Variant ID</th>
                  <th className="px-3 py-2 text-left font-medium">Quantity</th>
                  <th className="px-3 py-2 text-left font-medium">UOM ID</th>
                  <th className="px-3 py-2 text-left font-medium">Optional</th>
                  <th className="px-3 py-2 text-left font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {recipe.ingredients.map((ingredient, index) => (
                  <tr key={`${ingredient.ingredientVariantId}-${index}`} className="border-t border-border">
                    <td className="px-3 py-2 font-mono">{safeText(ingredient.ingredientVariantId)}</td>
                    <td className="px-3 py-2">{safeText(ingredient.quantity)}</td>
                    <td className="px-3 py-2 font-mono">{safeText(ingredient.uomId)}</td>
                    <td className="px-3 py-2">{ingredient.isOptional ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">{safeText(ingredient.notes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">No ingredients configured.</p>
        )}
      </DetailSection>
    </div>
  );
}
