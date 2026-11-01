export const blankRecipe = () => ({ name: '', servings: 2, instructions: '', ingredients: [{ ingredientId: '', grams: '' }] })
export function toDraft(recipe) {
  return { id: recipe.id, name: recipe.name || '', servings: recipe.servings ?? 2, instructions: recipe.instructions || '', ingredients: (recipe.ingredients || []).map(({ ingredientId, grams }) => ({ ingredientId: String(ingredientId), grams })) }
}
export function payload(recipe) {
  return { name: recipe.name.trim(), servings: Number(recipe.servings), instructions: recipe.instructions.trim(), ingredients: recipe.ingredients.map(row => ({ ingredientId: row.ingredientId, grams: Number(row.grams) })) }
}
