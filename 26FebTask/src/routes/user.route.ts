import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  transferEmployee,
  getTeamLeadsByManager,
} from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { UserRole } from "../models/users/user.types.js";

const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.TEAM_LEAD),
  createUser,
);
router.get("/", getAllUsers);
router.get(
  "/team-leads",
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  getTeamLeadsByManager,
);
router.get("/:id", getUserById);
router.put("/:id", updateUser);

router.patch(
  "/:id/transfer",
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  transferEmployee,
);

export default router;
