import test from 'node:test'
import assert from 'node:assert/strict'
import { blankRecipe, toDraft, payload, startRemix } from './recipe.js'
import { estimateNutrition, ingredientChanges } from './nutrition.js'
test('prepares recipe values with numeric quantities and servings', () => {
  assert.deepEqual(payload({ name:' Oats ', servings:'2', instructions:' Mix ', ingredients:[{ingredientId:'oats', grams:'75'}] }), {name:'Oats',servings:2,instructions:'Mix',ingredients:[{ingredientId:'oats',grams:75}]})
})
test('copies ingredient rows without mutating the saved recipe', () => {
  const source = {id:'1',name:'Oats',servings:1,instructions:'Mix',ingredients:[{ingredientId:'oats',grams:75}]}
  const draft = toDraft(source); draft.ingredients[0].grams=50
  assert.equal(source.ingredients[0].grams,75)
  assert.equal(blankRecipe().ingredients.length,1)
})

const original = { id: 'original', name: 'Oats', servings: 2, instructions: 'Mix', ingredients: [{ ingredientId: 'oats', grams: 100 }] }
const catalog = [
  { id: 'oats', name: 'Oats', calories: 389, protein: 16.89, fibre: 10.6 },
  { id: 'apple', name: 'Apple', calories: 52, protein: 0.26, fibre: 2.4 },
]

test('saves a remix as a new recipe referencing the original and keeps revisions independent', () => {
  const remix = startRemix(original)
  remix.ingredients[0].grams = 50
  assert.equal(original.ingredients[0].grams, 100)
  assert.equal(remix.id, undefined)
  assert.equal(payload(remix).originalId, original.id)
  assert.equal(payload({ ...remix, id: 'saved-remix' }).originalId, undefined)
})

test('calculates totals and servings for edited amounts and hides incomplete estimates', () => {
  const recipe = { ...original, ingredients: [{ ingredientId: 'oats', grams: '50' }] }
  assert.deepEqual(estimateNutrition(recipe, catalog), {
    total: { calories: 194.5, protein: 8.45, fibre: 5.3 },
    perServing: { calories: 97.25, protein: 4.22, fibre: 2.65 },
  })
  assert.equal(estimateNutrition({ ...recipe, servings: '' }, catalog), null)
  assert.equal(estimateNutrition({ ...recipe, ingredients: [...recipe.ingredients, ...recipe.ingredients] }, catalog), null)
})

test('reports changes by ingredient when an ingredient is swapped', () => {
  const remix = { ...original, ingredients: [{ ingredientId: 'apple', grams: 50 }] }
  assert.deepEqual(ingredientChanges(original, remix, catalog), [
    { id: 'oats', name: 'Oats', change: 'Removed', originalWeight: 100, remixWeight: 0 },
    { id: 'apple', name: 'Apple', change: 'Added', originalWeight: 0, remixWeight: 50 },
  ])
})
