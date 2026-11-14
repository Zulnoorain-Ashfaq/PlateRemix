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
    assert.deepEqual(body.recipe.nutrition, {
      total: { calories: 18, protein: 0.88, fibre: 1.2 },
      perServing: { calories: 18, protein: 0.88, fibre: 1.2 }
    });
    assert.equal(body.recipe.originalId, null);
    assert.equal(body.recipe.originalSnapshot, null);
    const theirs = await fetch(url, { headers: { Authorization: `Bearer ${token(other)}` } });
    assert.equal(theirs.status, 404);
    assert.deepEqual(seen.map(q => q.owner), [owner, other]);
    assert.ok(seen.every(q => q._id === recipeId));
  } finally { Recipe.findOne = originalFind; await new Promise(resolve => server.close(resolve)); }
});

test("remix creation copies the saved original and keeps the account boundary", async () => {
  const original = new Recipe({
    _id: recipeId,
    owner,
    name: "Tomato bowl",
    servings: 2,
    instructions: "Chop",
    ingredients: [{ ingredientId: "tomato-raw", grams: 100 }]
  });
  const remixId = "507f1f77bcf86cd799439014";
  const token = sub => jwt.sign({ sub }, secret, { algorithm: "HS256" });
  const saved = [];
  const findOne = Recipe.findOne;
  const create = Recipe.create;
  Recipe.findOne = async query => {
    if (query.owner !== owner) return null;
    if (query._id === recipeId) return original;
    if (query._id === remixId) return new Recipe({ ...saved[0], _id: remixId });
    return null;
  };
  Recipe.create = async data => {
    saved.push(data);
    return new Recipe({ ...data, _id: remixId });
  };
  const server = createApp({ jwtSecret: secret }).listen(0, "127.0.0.1");
  try {
    await new Promise(resolve => server.once("listening", resolve));
    const url = `http://127.0.0.1:${server.address().port}/api/recipes`;
    const remix = {
      name: "Lentil bowl",
      servings: 2,
      instructions: "Mix",
      ingredients: [{ ingredientId: "lentils-cooked", grams: 200 }],
      originalId: recipeId,
      originalSnapshot: { name: "Client-supplied name" }
    };
    const post = (body, sub = owner) => fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token(sub)}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    assert.equal((await post({ ...remix, originalId: false })).status, 400);
    assert.equal((await post(remix, other)).status, 404);
    assert.equal(saved.length, 0);

    const response = await post(remix);
    assert.equal(response.status, 201);
    const { recipe } = await response.json();
    assert.equal(recipe.originalId, recipeId);
    assert.equal(recipe.originalSnapshot.name, "Tomato bowl");
    assert.equal(recipe.originalSnapshot.nutrition.perServing.calories, 9);
    assert.equal(recipe.nutrition.perServing.calories, 116);
    assert.equal(saved[0].owner, owner);
    assert.equal((await post({ ...remix, originalId: remixId })).status, 400);

    original.ingredients[0].grams = 300;
    const reopened = await fetch(`${url}/${remixId}`, { headers: { Authorization: `Bearer ${token(owner)}` } });
    assert.equal(reopened.status, 200);
    assert.equal((await reopened.json()).recipe.originalSnapshot.ingredients[0].grams, 100);
  } finally {
    Recipe.findOne = findOne;
    Recipe.create = create;
    await new Promise(resolve => server.close(resolve));
  }
});
