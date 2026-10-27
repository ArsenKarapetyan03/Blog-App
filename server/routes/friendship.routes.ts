import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import { validateFriendship } from "@/middleware/validateFriendId.js";
import { add, accept, remove } from "@/controllers/friendship.controller.js";

const router = Router();

router.post("/", authMiddleware, validateFriendship, add);
router.post("/accept", authMiddleware, validateFriendship, accept);
router.delete("/", authMiddleware, validateFriendship, remove);

export default router;