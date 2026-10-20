import { Router } from "express";
import postRoutes from "./post.routes.js";
import authRoutes from "./auth.routes.js";
import commentRoutes from "./comment.routes.js";

const router = Router();

router.use("/blog", postRoutes);
router.use("/auth", authRoutes);
router.use("/comment", commentRoutes);

export default router;