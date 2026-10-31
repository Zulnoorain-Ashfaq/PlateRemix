import { ingredientMap } from "./ingredients.js";
export function validateRecipe(body) {
  if (!body || typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 120) throw new Error("Enter a recipe name of up to 120 characters.");
  if (typeof body.instructions !== "string" || !body.instructions.trim() || body.instructions.length > 10000) throw new Error("Enter preparation instructions (up to 10000 characters).");
  if (!Number.isInteger(body.servings) || body.servings < 1 || body.servings > 100) throw new Error("Servings must be a whole number between 1 and 100.");
  if (!Array.isArray(body.ingredients) || body.ingredients.length < 1 || body.ingredients.length > 100) throw new Error("Add between 1 and 100 ingredients.");
  const ids = body.ingredients.map(item => item && item.ingredientId);
  if (new Set(ids).size !== ids.length) throw new Error("Each ingredient can appear only once; combine its quantities.");
  for (const item of body.ingredients) {
    if (!item || !ingredientMap.has(item.ingredientId) || !Number.isFinite(item.grams) || item.grams <= 0 || item.grams > 100000) throw new Error("Choose a listed ingredient and enter a valid quantity in grams.");
  }
  return { name: body.name.trim(), instructions: body.instructions.trim(), servings: body.servings, ingredients: body.ingredients.map(({ ingredientId, grams }) => ({ ingredientId, grams })) };
}
export function escapeSearch(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
