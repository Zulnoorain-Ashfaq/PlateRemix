import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User, Recipe } from "./models.js";
import { ingredients } from "./ingredients.js";
import { validateRecipe, escapeSearch } from "./validation.js";

export function createApp({ jwtSecret, clientOrigin = "http://localhost:5173" }) {
  if (!jwtSecret || jwtSecret.length < 32) throw new Error("JWT_SECRET must contain at least 32 characters.");
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: clientOrigin }));
  app.use(express.json({ limit: "100kb" }));
  const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false });
  const issue = user => ({ token: jwt.sign({ sub: String(user._id) }, jwtSecret, { expiresIn: "12h", algorithm: "HS256" }), user: { id: String(user._id), name: user.name, email: user.email } });
  const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
  const validateCredentials = (body, registration) => {
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = body?.password;
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof password !== "string" || password.length < 8 || password.length > 72 || (registration && (!name || name.length > 80))) throw new Error("Enter a valid email, password (8-72 characters)" + (registration ? ", and name." : "."));
    if (Buffer.byteLength(password, "utf8") > 72) throw new Error("Password must be no more than 72 UTF-8 bytes.");
    return { email, password, name };
  };
  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.get("/api/ingredients", (_req, res) => res.json({ ingredients }));
  app.post("/api/auth/register", authLimit, wrap(async (req, res) => {
    let data; try { data = validateCredentials(req.body, true); } catch (e) { return res.status(400).json({ error: e.message }); }
    if (await User.exists({ email: data.email })) return res.status(409).json({ error: "An account with that email already exists." });
    const user = await User.create({ name: data.name, email: data.email, passwordHash: await bcrypt.hash(data.password, 12) });
    return res.status(201).json(issue(user));
  }));
  app.post("/api/auth/login", authLimit, wrap(async (req, res) => {
    let data; try { data = validateCredentials(req.body, false); } catch { return res.status(400).json({ error: "Enter a valid email and password." }); }
    const user = await User.findOne({ email: data.email }).select("+passwordHash");
    if (!user || !await bcrypt.compare(data.password, user.passwordHash)) return res.status(401).json({ error: "Email or password is incorrect." });
    return res.json(issue(user));
  }));
  app.use("/api/recipes", (req, res, next) => {
    const token = /^Bearer (.+)$/.exec(req.get("authorization") || "")?.[1];
    if (!token) return res.status(401).json({ error: "Sign in to access your recipes." });
    try { const payload = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] }); if (!mongoose.isValidObjectId(payload.sub)) throw new Error("Invalid user"); req.userId = payload.sub; return next(); }
    catch { return res.status(401).json({ error: "Session expired. Please sign in again." }); }
  });
  const serialize = recipe => ({ id: String(recipe._id), name: recipe.name, instructions: recipe.instructions, servings: recipe.servings, ingredients: recipe.ingredients.map(({ ingredientId, grams }) => ({ ingredientId, grams })), createdAt: recipe.createdAt, updatedAt: recipe.updatedAt });
  app.get("/api/recipes", wrap(async (req, res) => {
    const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 120) : "";
    const query = { owner: req.userId };
    if (search) query.name = { $regex: escapeSearch(search), $options: "i" };
    const recipes = await Recipe.find(query).sort({ updatedAt: -1 }).limit(500);
    return res.json({ recipes: recipes.map(serialize) });
  }));
  app.post("/api/recipes", wrap(async (req, res) => {
    let data; try { data = validateRecipe(req.body); } catch (e) { return res.status(400).json({ error: e.message }); }
    const recipe = await Recipe.create({ ...data, owner: req.userId });
    return res.status(201).json({ recipe: serialize(recipe) });
  }));
  app.get("/api/recipes/:id", wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Recipe not found." });
    const recipe = await Recipe.findOne({ _id: req.params.id, owner: req.userId });
    return recipe ? res.json({ recipe: serialize(recipe) }) : res.status(404).json({ error: "Recipe not found." });
  }));
  app.put("/api/recipes/:id", wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Recipe not found." });
    let data; try { data = validateRecipe(req.body); } catch (e) { return res.status(400).json({ error: e.message }); }
    const recipe = await Recipe.findOneAndUpdate({ _id: req.params.id, owner: req.userId }, { $set: data }, { new: true, runValidators: true });
    return recipe ? res.json({ recipe: serialize(recipe) }) : res.status(404).json({ error: "Recipe not found." });
  }));
  app.delete("/api/recipes/:id", wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Recipe not found." });
    const deleted = await Recipe.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    return deleted ? res.status(204).end() : res.status(404).json({ error: "Recipe not found." });
  }));
  app.use((err, _req, res, _next) => {
    if (err?.code === 11000) return res.status(409).json({ error: "An account with that email already exists." });
    if (err?.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON." });
    console.error("Request failed:", err?.name || "Error");
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  });
  return app;
}
