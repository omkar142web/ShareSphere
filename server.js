import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import Path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/mongodb.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandlers.js";
import authRoutes from "./routes/authRoutes.js";
import rideRoutes from "./routes/rideRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private",
  );
  next();
});

app.use(express.static(Path.join(__dirname, "public")));

app.set("views", Path.join(__dirname, "views"));
app.set("view engine", "ejs");

await connectDB();

app.use("/", authRoutes);
app.use("/", rideRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`ShareSphere running at http://localhost:${PORT}`);
  });
}

export default app;
