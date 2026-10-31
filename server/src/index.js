import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app.js";
const port = Number(process.env.PORT || 4000);
if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in server/.env.");
const app = createApp({ jwtSecret: process.env.JWT_SECRET, clientOrigin: process.env.CLIENT_ORIGIN });
await mongoose.connect(process.env.MONGODB_URI);
app.listen(port, () => console.log(`PlateRemix API listening on http://localhost:${port}`));
