import "dotenv/config";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectDB from "./config/db.js";

import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import { globalErrorHandler } from "./middlewares/globalError.middleware.js";

// Connect to MongoDB and seed admin
await connectDB();
;

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", // frontend URL
    credentials: true, // allow cookies
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello World" });
});

// Auth routes (login / logout)
app.use("/api/auth", authRoutes);

// User routes (all protected)
app.use("/api/users", userRoutes);

// Global error handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
