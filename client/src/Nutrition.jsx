import React, { useState } from 'react'
import { estimateNutrition, ingredientChanges, metrics } from './nutrition.js'

const numberFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 })
const format = value => numberFormat.format(value)

function difference(from, to) {
  const delta = Math.round((to - from) * 100) / 100
  return `${delta > 0 ? '+' : ''}${format(delta)}`
}

function NutritionTable({ originalValues, remixValues, comparison, scope }) {
  return (
    <table className="nutrition-table">
      <caption className="sr-only">Estimated nutrition {scope === 'perServing' ? 'per serving' : 'for the whole recipe'}</caption>
      <thead>
        <tr>
          <th scope="col">Nutrient</th>
          <th scope="col">{comparison ? 'Original' : 'Estimate'}</th>
          {comparison && <th scope="col">Remix</th>}
          {comparison && <th scope="col">Change</th>}
        </tr>
      </thead>
      <tbody>
        {metrics.map(([key, label, unit]) => (
          <tr key={key}>
            <th scope="row">{label} <small>({unit})</small></th>
            <td>{originalValues ? format(originalValues[key]) : '—'}</td>
            {comparison && <td>{remixValues ? format(remixValues[key]) : '—'}</td>}
            {comparison && <td>{originalValues && remixValues ? difference(originalValues[key], remixValues[key]) : '—'}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function NutritionPanel({ recipe, original, catalog, onRemix, remixUnavailable, onCancelRemix }) {
  const [scope, setScope] = useState('perServing')
  const comparison = Boolean(original)
  const changes = comparison ? ingredientChanges(original, recipe, catalog) : []
  const values = estimateNutrition(recipe, catalog)?.[scope]
  const originalValues = comparison ? estimateNutrition(original, catalog)?.[scope] : values

  return (
    <section className="editor-card nutrition-panel" aria-labelledby="nutrition-heading">
      <div className="card-header nutrition-header">
        <div>
          <h2 id="nutrition-heading">{comparison ? 'Compare your remix' : 'Estimated nutrition'}</h2>
          {comparison && <p className="nutrition-original">Original: {original.name}</p>}
        </div>
        {onCancelRemix && <button type="button" className="text-button" onClick={onCancelRemix}>Cancel remix</button>}
      </div>
      {onRemix && (
        <div className="remix-action">
          <button type="button" className="button secondary" disabled={Boolean(remixUnavailable)} onClick={onRemix}>
            Create a remix
          </button>
          {remixUnavailable && <p>{remixUnavailable}</p>}
        </div>
      )}
      {recipe.originalId && !comparison && !onCancelRemix && (
        <p className="nutrition-note">The original recipe is unavailable. You can still edit this remix and see its nutrition estimates.</p>
      )}
      <fieldset className="nutrition-scope">
        <legend className="sr-only">Nutrition portion</legend>
        <label>
          <input type="radio" name="nutrition-scope" checked={scope === 'perServing'} onChange={() => setScope('perServing')} />
          Per serving
        </label>
        <label>
          <input type="radio" name="nutrition-scope" checked={scope === 'total'} onChange={() => setScope('total')} />
          Whole recipe
        </label>
      </fieldset>
      {!values && <p className="nutrition-note">Choose ingredients, enter their weights, and set the serving count to see an estimate.</p>}
      <NutritionTable originalValues={originalValues} remixValues={values} comparison={comparison} scope={scope} />
      {comparison && (
        <div className="ingredient-changes">
          <h3>Ingredient changes</h3>
          {changes.length ? (
            <ul>
              {changes.map(({ id, name, change, originalWeight, remixWeight }) => (
                <li key={id}>
                  <strong>{name}</strong>
                  <span>{change} · {format(originalWeight)} g → {format(remixWeight)} g</span>
                </li>
              ))}
            </ul>
          ) : <p>No ingredient changes yet.</p>}
        </div>
      )}
      <p className="nutrition-note">Estimates use ingredient values per 100 g from USDA FoodData Central.</p>
    </section>
  )
}

export function IngredientSources({ recipe, catalog }) {
  const selected = new Set(recipe.ingredients.map(row => row.ingredientId))
  const foods = catalog.filter(food => selected.has(food.id) && /^\d+$/.test(String(food.fdcId)))
  if (!foods.length) return null

  return (
    <details className="ingredient-sources">
      <summary>Ingredient sources</summary>
      <ul>
        {foods.map(food => (
          <li key={food.id}>
            <a href={`https://fdc.nal.usda.gov/food-details/${food.fdcId}/nutrients`} target="_blank" rel="noreferrer">
              {food.name}
            </a>
          </li>
        ))}
      </ul>
    </details>
  )
}
