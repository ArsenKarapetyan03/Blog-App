import { Router } from "express";
import { readAll, readOne, create, update, remove } from "../controllers/blog.controller.js";
import { authMiddleware } from "@/middleware/authMiddleware.js";

const router = Router();

router.get("/", readAll);
router.get("/:id", readOne);
router.post("/", authMiddleware, create);
router.patch("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, remove);

export default router;