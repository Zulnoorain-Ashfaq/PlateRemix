export const metrics = [
  ['calories', 'Calories', 'kcal'],
  ['protein', 'Protein', 'g'],
  ['fibre', 'Fibre', 'g'],
]

const round = value => Math.round((value + Number.EPSILON) * 100) / 100

export function estimateNutrition(recipe, catalog) {
  const servings = Number(recipe.servings)
  if (!Number.isInteger(servings) || servings < 1 || servings > 100) return null
  if (recipe.ingredients.length < 1 || recipe.ingredients.length > 100) return null

  const byId = new Map(catalog.map(food => [food.id, food]))
  const total = { calories: 0, protein: 0, fibre: 0 }
  const seen = new Set()

  for (const { ingredientId, grams } of recipe.ingredients) {
    const weight = Number(grams)
    const food = byId.get(ingredientId)
    if (!food || !Number.isFinite(weight) || weight <= 0 || weight > 100000 || seen.has(ingredientId)) return null
    seen.add(ingredientId)
    for (const [key] of metrics) {
      if (!Number.isFinite(food[key])) return null
      total[key] += food[key] * weight / 100
    }
  }

  return {
    total: Object.fromEntries(metrics.map(([key]) => [key, round(total[key])])),
    perServing: Object.fromEntries(metrics.map(([key]) => [key, round(total[key] / servings)])),
  }
}

export function ingredientChanges(original, remix, catalog) {
  function quantities(recipe) {
    const values = new Map()
    for (const { ingredientId, grams } of recipe.ingredients) {
      const weight = Number(grams)
      if (ingredientId && Number.isFinite(weight) && weight > 0) {
        values.set(ingredientId, (values.get(ingredientId) ?? 0) + weight)
      }
    }
    return values
  }

  const before = quantities(original)
  const after = quantities(remix)
  const names = new Map(catalog.map(food => [food.id, food.name]))
  return [...new Set([...before.keys(), ...after.keys()])].flatMap(id => {
    const originalWeight = before.get(id) ?? 0
    const remixWeight = after.get(id) ?? 0
    if (originalWeight === remixWeight) return []
    const change = originalWeight === 0 ? 'Added' : remixWeight === 0 ? 'Removed' : 'Changed'
    return [{ id, name: names.get(id) ?? 'Ingredient', change, originalWeight, remixWeight }]
  })
}
