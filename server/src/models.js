import mongoose from "mongoose";
const ingredientSchema = new mongoose.Schema({ ingredientId: { type: String, required: true }, grams: { type: Number, required: true } }, { _id: false });
const userSchema = new mongoose.Schema({ name: { type: String, required: true }, email: { type: String, required: true, unique: true, index: true }, passwordHash: { type: String, required: true, select: false } }, { timestamps: true });
const recipeSchema = new mongoose.Schema({ owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }, name: { type: String, required: true }, instructions: { type: String, required: true }, servings: { type: Number, required: true }, ingredients: { type: [ingredientSchema], required: true } }, { timestamps: true });
export const User = mongoose.model("User", userSchema);
export const Recipe = mongoose.model("Recipe", recipeSchema);
