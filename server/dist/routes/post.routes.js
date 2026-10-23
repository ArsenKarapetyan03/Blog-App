import { Router } from "express";
import { readAll, readMine, readOne, create, update, remove, toggleLike } from "@/controllers/post.controller.js";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import { uploadMiddleware } from "@/middleware/imagesMiddleware.js";
import { optionalAuth } from "@/middleware/optionalAuth.js";
const router = Router();
router.get("/", readAll);
router.get("/mine", authMiddleware, readMine);
router.get("/:id", optionalAuth, readOne);
router.post("/", [authMiddleware, uploadMiddleware], create);
router.post("/:id/like", authMiddleware, toggleLike);
router.patch("/:id", [authMiddleware, uploadMiddleware], update);
router.delete("/:id", authMiddleware, remove);
export default router;
//# sourceMappingURL=post.routes.js.map