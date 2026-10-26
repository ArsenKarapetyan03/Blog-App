import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import { add, accept, remove } from "@/controllers/friendship.controller.js";

const router = Router();

router.post("/add", authMiddleware, add);
router.post("/accept", authMiddleware, accept);
router.delete("/", authMiddleware, remove);

export default router;