import { ingredientMap } from "./ingredients.js";

const nutrientKeys = ["calories", "protein", "fibre"];

const round = value => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateNutrition(ingredients, servings) {
  const totals = { calories: 0, protein: 0, fibre: 0 };

  for (const { ingredientId, grams } of ingredients) {
    const ingredient = ingredientMap.get(ingredientId);
    for (const key of nutrientKeys) {
      totals[key] += ingredient[key] * grams / 100;
    }
  }

  return {
    total: Object.fromEntries(nutrientKeys.map(key => [key, round(totals[key])])),
    perServing: Object.fromEntries(nutrientKeys.map(key => [key, round(totals[key] / servings)]))
  };
}
