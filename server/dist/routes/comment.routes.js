import { Router } from "express";
import { create, get } from "@/controllers/comment.controller.js";
import { authMiddleware } from "@/middleware/authMiddleware.js";
const router = Router();
router.get("/:id", get);
router.post("/", authMiddleware, create);
export default router;
//# sourceMappingURL=comment.routes.js.map