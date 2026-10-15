import { Router } from "express";
import { readAll, readMine, readOne, create, update, remove, toggleLike } from "@/controllers/blog.controller.js";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import { optionalAuth } from "@/middleware/optionalAuth.js";

const router = Router();

router.get("/", readAll);
router.get("/mine", authMiddleware, readMine);
router.get("/:id", optionalAuth, readOne);
router.post("/", authMiddleware, create);
router.post("/:id/like", authMiddleware, toggleLike);
router.patch("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, remove);

export default router;