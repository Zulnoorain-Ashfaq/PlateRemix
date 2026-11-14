import test from "node:test";
import assert from "node:assert/strict";
import { calculateNutrition } from "../src/nutrition.js";

test("calculates recipe totals from grams and rounds only after dividing into servings", () => {
  const ingredients = [
    { ingredientId: "rice-white-cooked", grams: 100 },
    { ingredientId: "lentils-cooked", grams: 50 }
  ];
  assert.deepEqual(calculateNutrition(ingredients, 3), {
    total: { calories: 188, protein: 7.2, fibre: 4.35 },
    perServing: { calories: 62.67, protein: 2.4, fibre: 1.45 }
  });
});
