import React, { useEffect, useRef, useState } from 'react'
import { api } from './api.js'
import { IngredientSources, NutritionPanel } from './Nutrition.jsx'
import { blankRecipe, toDraft, payload, startRemix } from './recipe.js'

function Brand() { return <span className="brand"><span className="brand-mark">P<span>↗</span></span><span>Plate<span className="brand-accent">Remix</span></span></span> }
function Header({ user, view, setView, logout }) {
  return <header className="topbar"><div className="nav-shell"><Brand />{user && <nav aria-label="Main navigation"><button aria-current={view === 'studio' ? 'page' : undefined} className={view === 'studio' ? 'nav-link active' : 'nav-link'} onClick={() => setView('studio')}>Recipe studio</button><button aria-current={view === 'library' ? 'page' : undefined} className={view === 'library' ? 'nav-link active' : 'nav-link'} onClick={() => setView('library')}>My library</button></nav>}<div className="nav-right">{user ? <><span className="account-name">{user.name}</span><button className="text-button" onClick={logout}>Log out</button></> : <span className="small-label">A little room for your recipes</span>}</div></div></header>
}
function Auth({ onAuth }) {
  const [mode, setMode] = useState('login'), [name, setName] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  async function submit(e) { e.preventDefault(); setError(''); setBusy(true); try { const result = mode === 'login' ? await api.login({ email, password }) : await api.register({ name, email, password }); onAuth(result) } catch (err) { setError(err.message) } finally { setBusy(false) } }
  return <main className="auth-layout"><section className="intro"><div className="eyebrow"><span className="dot" /> YOUR RECIPE SPACE</div><h1>Good food starts<br/><em>with an idea.</em></h1><p>Give your favourite recipes a home. Save the ingredients, measurements and steps that make them yours.</p><div className="illustration" aria-hidden="true"><div className="plate"><span>✳</span><i></i><b></b><small></small></div><div className="ill-note"><span>FROM YOUR KITCHEN</span><strong>A little space for<br/>the dishes you love.</strong></div></div><div className="intro-bottom"><span>01 &nbsp; CREATE</span><span>02 &nbsp; SAVE</span><span>03 &nbsp; COOK</span></div></section><section className="auth-side"><div className="auth-card"><div className="section-kicker">YOUR PRIVATE RECIPE SPACE</div><h2>{mode === 'login' ? 'Welcome back.' : 'Let’s get cooking.'}</h2><p>{mode === 'login' ? 'Sign in to pick up where you left off.' : 'Create an account to save your recipes.'}</p><div className="auth-tabs"><button type="button" className={mode === 'login' ? 'selected' : ''} onClick={() => {setMode('login');setError('')}}>Sign in</button><button type="button" className={mode === 'register' ? 'selected' : ''} onClick={() => {setMode('register');setError('')}}>Create account</button></div><form onSubmit={submit} className="form-stack">{mode === 'register' && <label>Full name<input autoComplete="name" required maxLength="100" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></label>}<label>Email address<input autoComplete="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label><label>Password<input autoComplete={mode === 'register' ? 'new-password' : 'current-password'} type="password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" /></label>{error && <div className="notice error" role="alert">{error}</div>}<button disabled={busy} className="button primary wide">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in to your kitchen' : 'Create your account'} <span>→</span></button></form><div className="privacy-note">Your recipes stay private to your account.</div></div></section></main>
}
function RecipeForm({ recipe, setRecipe, catalog, onSave, busy, status }) {
  function change(field, value) {
    setRecipe(previous => ({ ...previous, [field]: value }))
  }

  function rowChange(index, field, value) {
    setRecipe(previous => ({
      ...previous,
      ingredients: previous.ingredients.map((row, i) => i === index ? { ...row, [field]: value } : row),
    }))
  }

  const isRemix = Boolean(recipe.originalId)
  const title = isRemix ? 'Your remix' : recipe.id ? 'Edit your recipe' : 'Start with a recipe.'
  const saveLabel = recipe.id
    ? isRemix ? 'Update remix' : 'Update recipe'
    : isRemix ? 'Save remix' : 'Save recipe'

  return (
    <section className="editor-card">
      <div className="card-header">
        <div>
          <div className="section-kicker">{isRemix ? 'RECIPE REMIX' : 'YOUR RECIPE'}</div>
          <h2>{title}</h2>
        </div>
        <span className="card-icon" aria-hidden="true">✳</span>
      </div>
      <form onSubmit={onSave}>
        <fieldset className="form-stack recipe-form" disabled={busy} aria-label={title}>
          <label>
            Recipe name
            <input required maxLength="120" value={recipe.name} onChange={event => change('name', event.target.value)} placeholder="e.g. Cinnamon overnight oats" />
          </label>
          <label>
            Servings
            <input type="number" min="1" max="100" step="1" required value={recipe.servings} onChange={event => change('servings', event.target.value)} />
          </label>
          <div className="ingredients-head">
            <div>
              <strong>Ingredients</strong>
              <p>Choose an ingredient and enter its weight in grams.</p>
            </div>
            <button
              type="button"
              className="add-link"
              disabled={recipe.ingredients.length >= 100}
              onClick={() => change('ingredients', [...recipe.ingredients, { ingredientId: '', grams: '' }])}
            >
              ＋ Add
            </button>
          </div>
          <div className="ingredient-list">
            {recipe.ingredients.map((row, index) => (
              <div className="ingredient-row" key={index}>
                <label className="sr-only" htmlFor={`ingredient-${index}`}>Ingredient {index + 1}</label>
                <select id={`ingredient-${index}`} required value={row.ingredientId} onChange={event => rowChange(index, 'ingredientId', event.target.value)}>
                  <option value="">Select ingredient</option>
                  {catalog.map(food => <option key={food.id} value={food.id}>{food.name}</option>)}
                </select>
                <label className="sr-only" htmlFor={`grams-${index}`}>Grams for ingredient {index + 1}</label>
                <div className="gram-field">
                  <input id={`grams-${index}`} type="number" required min="0.01" max="100000" step="any" value={row.grams} onChange={event => rowChange(index, 'grams', event.target.value)} placeholder="0" />
                  <span>g</span>
                </div>
                <button
                  type="button"
                  className="remove"
                  aria-label={`Remove ingredient ${index + 1}`}
                  disabled={recipe.ingredients.length === 1}
                  onClick={() => change('ingredients', recipe.ingredients.filter((_, i) => i !== index))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <IngredientSources recipe={recipe} catalog={catalog} />
          <label>
            Preparation instructions
            <textarea rows="5" required maxLength="10000" value={recipe.instructions} onChange={event => change('instructions', event.target.value)} placeholder="How do you bring it all together?" />
          </label>
          <button className="button primary wide" type="submit" disabled={!catalog.length}>
            {busy ? 'Saving…' : saveLabel} <span aria-hidden="true">→</span>
          </button>
          {status && <p role="status" className="form-status">{status}</p>}
        </fieldset>
      </form>
    </section>
  )
}

function Library({ recipes, search, setSearch, openRecipe, remove, loading, busy }) {
  return (
    <section className="library">
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="dot" /> YOUR COLLECTION</div>
          <h1>Made by you.</h1>
          <p>Find your original recipes and remixes.</p>
        </div>
        <button className="button primary" type="button" onClick={() => openRecipe(null)} disabled={busy}>＋ &nbsp; New recipe</button>
      </div>
      <div className="library-toolbar">
        <div><h2>Your library</h2><span>{recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}</span></div>
        <label className="search">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Search recipes</span>
          <input type="search" placeholder="Search recipes" value={search} onChange={event => setSearch(event.target.value)} />
        </label>
      </div>
      {loading ? <p className="empty" role="status">Loading your recipes…</p> : (
        recipes.length ? (
          <div className="recipe-grid">
            {recipes.map(recipe => (
              <article className="recipe-tile" key={recipe.id}>
                <div className="tile-top"><span>{recipe.originalId ? 'REMIX' : 'ORIGINAL RECIPE'}</span></div>
                <h3>{recipe.name}</h3>
                <p>{recipe.ingredients.length} ingredients · {recipe.servings} servings</p>
                <div className="tile-actions">
                  <button className="text-button" type="button" onClick={() => openRecipe(recipe)} disabled={busy}>
                    {recipe.originalId ? 'Open remix' : 'Open recipe'} <span aria-hidden="true">→</span>
                  </button>
                  <button className="delete-button" type="button" onClick={() => remove(recipe)} disabled={busy}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>{search ? 'No recipes found.' : 'Your recipe collection starts here.'}</h3>
            <p>{search ? 'Try a different search.' : 'Create a recipe and save it for later.'}</p>
            {!search && <button className="button secondary" type="button" onClick={() => openRecipe(null)} disabled={busy}>Create a recipe →</button>}
          </div>
        )
      )}
    </section>
  )
}

export default function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('plate_session') || 'null') } catch { return null }
  })
  const [view, setView] = useState('studio')
  const [catalog, setCatalog] = useState([])
  const [recipes, setRecipes] = useState([])
  const [search, setSearch] = useState('')
  const [recipe, setRecipe] = useState(blankRecipe)
  const [savedRecipe, setSavedRecipe] = useState(null)
  const [remixSource, setRemixSource] = useState(null)
  const [loadedOriginal, setLoadedOriginal] = useState(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)

  const token = session?.token
  const sessionToken = useRef(token)
  const original = remixSource ?? savedRecipe?.originalSnapshot
    ?? (loadedOriginal?.id === recipe.originalId ? loadedOriginal : null)
  const remixUnavailable = !savedRecipe ? 'Save this recipe to create a remix.'
    : JSON.stringify(payload(recipe)) !== JSON.stringify(payload(toDraft(savedRecipe)))
      ? 'Save your changes to create a remix.'
      : busy ? 'Wait for your recipe to finish saving.' : ''

  useEffect(() => {
    if (!token) return
    let active = true
    api.ingredients()
      .then(result => { if (active) setCatalog(result.ingredients) })
      .catch(failure => { if (active) setError(`Ingredients could not be loaded: ${failure.message}`) })
    return () => { active = false }
  }, [token])

  useEffect(() => {
    if (!token || view !== 'library') return
    let active = true
    setLoading(true)
    api.recipes(token, search)
      .then(result => { if (active) setRecipes(result.recipes) })
      .catch(failure => { if (active) setError(failure.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [token, view, search])

  useEffect(() => {
    if (!token || !savedRecipe?.originalId || savedRecipe.originalSnapshot) return
    let active = true
    api.recipe(token, savedRecipe.originalId)
      .then(result => { if (active) setLoadedOriginal(result.recipe) })
      .catch(() => { if (active) setLoadedOriginal(null) })
    return () => { active = false }
  }, [token, savedRecipe])

  function authenticate(result) {
    sessionStorage.setItem('plate_session', JSON.stringify(result))
    sessionToken.current = result.token
    setSession(result)
    setError('')
  }

  function openRecipe(item) {
    setError('')
    setStatus('')
    setSavedRecipe(item)
    setRecipe(item ? toDraft(item) : blankRecipe())
    setRemixSource(null)
    setLoadedOriginal(null)
    setView('studio')
  }

  function logout() {
    sessionStorage.removeItem('plate_session')
    sessionToken.current = undefined
    setSession(null)
    setCatalog([])
    setRecipes([])
    setSearch('')
    setBusy(false)
    openRecipe(null)
  }

  function createRemix() {
    if (remixUnavailable) return
    setRemixSource(savedRecipe)
    setRecipe(startRemix(savedRecipe))
    setSavedRecipe(null)
    setLoadedOriginal(null)
    setError('')
    setStatus('')
  }

  async function save(event) {
    event.preventDefault()
    setError('')
    setStatus('')
    setBusy(true)
    try {
      const result = await api.save(token, payload(recipe), recipe.id)
      if (sessionToken.current !== token) return
      setRecipe(toDraft(result.recipe))
      setSavedRecipe(result.recipe)
      setRemixSource(null)
      setStatus(result.recipe.originalId ? 'Remix saved to your library.' : 'Recipe saved to your library.')
    } catch (failure) {
      if (sessionToken.current === token) setError(failure.message)
    } finally {
      if (sessionToken.current === token) setBusy(false)
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete “${item.name}”?`)) return
    setError('')
    setBusy(true)
    try {
      await api.remove(token, item.id)
      if (sessionToken.current !== token) return
      setRecipes(current => current.filter(entry => entry.id !== item.id))
      if (recipe.id === item.id || remixSource?.id === item.id) {
        openRecipe(null)
        setView('library')
      }
    } catch (failure) {
      if (sessionToken.current === token) setError(failure.message)
    } finally {
      if (sessionToken.current === token) setBusy(false)
    }
  }

  return (
    <>
      <Header user={session?.user} view={view} setView={next => { if (!busy) setView(next) }} logout={logout} />
      {!session ? <Auth onAuth={authenticate} /> : (
        <main className="app-shell">
          {error && (
            <div className="notice error global-error" role="alert">
              {error}<button type="button" aria-label="Dismiss message" onClick={() => setError('')}>×</button>
            </div>
          )}
          {view === 'library' ? (
            <Library recipes={recipes} search={search} setSearch={setSearch} openRecipe={openRecipe} remove={remove} loading={loading} busy={busy} />
          ) : (
            <>
              <div className="page-heading studio-heading">
                <div>
                  <div className="eyebrow"><span className="dot" /> YOUR RECIPE STUDIO</div>
                  <h1>Make it yours.</h1>
                  <p>Make a recipe, then try a remix to see how its nutrition changes.</p>
                </div>
                <button className="button secondary" type="button" onClick={() => setView('library')} disabled={busy}>View my library ↗</button>
              </div>
              <div className="studio-grid">
                <RecipeForm recipe={recipe} setRecipe={setRecipe} catalog={catalog} onSave={save} busy={busy} status={status} />
                <NutritionPanel
                  recipe={recipe}
                  original={original}
                  catalog={catalog}
                  onRemix={!recipe.originalId ? createRemix : undefined}
                  remixUnavailable={remixUnavailable}
                  onCancelRemix={remixSource && !busy ? () => openRecipe(remixSource) : undefined}
                />
              </div>
            </>
          )}
        </main>
      )}
      <footer><span>PlateRemix &nbsp; ✳ &nbsp; Your personal recipe space</span></footer>
    </>
  )
}
