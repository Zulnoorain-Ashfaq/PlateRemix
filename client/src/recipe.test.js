import test from 'node:test'
import assert from 'node:assert/strict'
import { blankRecipe, toDraft, payload } from './recipe.js'
test('prepares recipe values with numeric quantities and servings', () => {
  assert.deepEqual(payload({ name:' Oats ', servings:'2', instructions:' Mix ', ingredients:[{ingredientId:'oats', grams:'75'}] }), {name:'Oats',servings:2,instructions:'Mix',ingredients:[{ingredientId:'oats',grams:75}]})
})
test('copies ingredient rows without mutating the saved recipe', () => {
  const source = {id:'1',name:'Oats',servings:1,instructions:'Mix',ingredients:[{ingredientId:'oats',grams:75}]}
  const draft = toDraft(source); draft.ingredients[0].grams=50
  assert.equal(source.ingredients[0].grams,75)
  assert.equal(blankRecipe().ingredients.length,1)
})
