import mongoose from "mongoose";
const ingredientSchema = new mongoose.Schema({ ingredientId: { type: String, required: true }, grams: { type: Number, required: true } }, { _id: false });
const userSchema = new mongoose.Schema({ name: { type: String, required: true }, email: { type: String, required: true, unique: true, index: true }, passwordHash: { type: String, required: true, select: false } }, { timestamps: true });
const recipeFields = {
  name: { type: String, required: true },
  instructions: { type: String, required: true },
  servings: { type: Number, required: true },
  ingredients: { type: [ingredientSchema], required: true }
};
const originalSnapshotSchema = new mongoose.Schema({
  id: { type: String, required: true },
  ...recipeFields
}, { _id: false, id: false });
const recipeSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  ...recipeFields,
  originalId: { type: mongoose.Schema.Types.ObjectId, default: null, immutable: true },
  originalSnapshot: { type: originalSnapshotSchema, default: null, immutable: true }
}, { timestamps: true });
export const User = mongoose.model("User", userSchema);
export const Recipe = mongoose.model("Recipe", recipeSchema);
