import express from "express";
import { login, logout, register, me } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);

router.post("/register", register);
router.get("/me", authenticate, me);

export default router;
