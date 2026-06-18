import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import userApi from "./routes/user.js";
import podcastApi from "./routes/podcast.js";
import catApi from "./routes/categories.js";


dotenv.config();              // 1️⃣ Load environment variables first

import "./conn/conn.js";      // 2️⃣ Connect to DB (uses env vars)

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cookieParser()); // Middleware to parse cookies

// ===== API Routes =====
app.use("/api/v1", userApi);
app.use("/api/v1", catApi);
app.use("/api/v1", podcastApi);

// ===== Start Server =====
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
