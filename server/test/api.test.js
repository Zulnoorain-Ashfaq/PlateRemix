import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { createApp } from "../src/app.js";
import { Recipe } from "../src/models.js";

const secret = "a-secure-test-key-with-at-least-32-characters";
const owner = "507f1f77bcf86cd799439011";
const other = "507f1f77bcf86cd799439012";
const recipeId = "507f1f77bcf86cd799439013";

test("private recipe endpoints require authentication and include owner in lookup", async () => {
  const app = createApp({ jwtSecret: secret });
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const originalFind = Recipe.findOne;
  const seen = [];
  Recipe.findOne = async query => { seen.push(query); return query.owner === owner ? { _id: recipeId, name: "Bowl", servings: 1, instructions: "Mix", ingredients: [{ ingredientId: "tomato-raw", grams: 100 }], originalId: null } : null; };
  try {
    const url = `http://127.0.0.1:${server.address().port}/api/recipes/${recipeId}`;
    const missing = await fetch(url);
    assert.equal(missing.status, 401);
    const token = sub => jwt.sign({ sub }, secret, { algorithm: "HS256" });
    const mine = await fetch(url, { headers: { Authorization: `Bearer ${token(owner)}` } });
    assert.equal(mine.status, 200);
    const body = await mine.json();
    assert.equal(body.recipe.name, "Bowl");
    assert.equal("nutrition" in body.recipe, false);
    assert.equal("originalId" in body.recipe, false);
    const theirs = await fetch(url, { headers: { Authorization: `Bearer ${token(other)}` } });
    assert.equal(theirs.status, 404);
    assert.deepEqual(seen.map(q => q.owner), [owner, other]);
    assert.ok(seen.every(q => q._id === recipeId));
  } finally { Recipe.findOne = originalFind; await new Promise(resolve => server.close(resolve)); }
});
