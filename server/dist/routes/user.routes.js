import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import { getCurrentUser, getAll, getOne } from "@/controllers/user.controller.js";
const router = Router();
router.get("/", getAll);
router.get("/me", authMiddleware, getCurrentUser);
router.get("/:id", getOne);
export default router;
//# sourceMappingURL=user.routes.js.map