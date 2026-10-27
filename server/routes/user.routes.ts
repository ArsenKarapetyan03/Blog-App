import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware.js"
import { getUser, getAll } from "@/controllers/user.controller.js";

const router = Router();

router.get("/", getAll);
router.get("/me", authMiddleware, getUser);

export default router;