export const blankRecipe = () => ({ name: '', servings: 2, instructions: '', ingredients: [{ ingredientId: '', grams: '' }] })

export function toDraft(recipe) {
  return {
    id: recipe.id,
    originalId: recipe.originalId || null,
    name: recipe.name || '',
    servings: recipe.servings ?? 2,
    instructions: recipe.instructions || '',
    ingredients: (recipe.ingredients || []).map(({ ingredientId, grams }) => ({ ingredientId: String(ingredientId), grams })),
  }
}

export function startRemix(original) {
  return {
    ...toDraft(original),
    id: undefined,
    originalId: original.id,
    name: `${original.name.slice(0, 114).trimEnd()} remix`,
  }
}

export function payload(recipe) {
  const data = {
    name: recipe.name.trim(),
    servings: Number(recipe.servings),
    instructions: recipe.instructions.trim(),
    ingredients: recipe.ingredients.map(row => ({ ingredientId: row.ingredientId, grams: Number(row.grams) })),
  }
  if (!recipe.id && recipe.originalId) data.originalId = recipe.originalId
  return data
}
