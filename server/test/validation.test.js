import test from "node:test";
import assert from "node:assert/strict";
import { validateRecipe, escapeSearch } from "../src/validation.js";
const sample = { name: "Bowl", instructions: "Cook", servings: 2, ingredients: [{ ingredientId: "rice-white-cooked", grams: 100 }] };
test("valid recipes are normalized and do not admit future feature fields", () => {
  const result = validateRecipe({ ...sample, name: " Bowl ", originalId: "not-used" });
  assert.deepEqual(result, sample);
});
test("invalid servings, ingredient quantities, duplicates and unknown items are rejected", () => {
  assert.throws(() => validateRecipe({ ...sample, servings: 0 }));
  assert.throws(() => validateRecipe({ ...sample, ingredients: [{ ingredientId: "unknown", grams: 100 }] }));
  assert.throws(() => validateRecipe({ ...sample, ingredients: [{ ingredientId: "rice-white-cooked", grams: -1 }] }));
  assert.throws(() => validateRecipe({ ...sample, ingredients: [sample.ingredients[0], sample.ingredients[0]] }), /only once/);
});
test("search escapes regex metacharacters literally", () => {
  const query = "a.*[x](b)+?^$|{}\\";
  const pattern = new RegExp(escapeSearch(query), "i");
  assert.equal(pattern.test(query), true);
  assert.equal(pattern.test("abxb"), false);
});
