import { Router } from "express";
import blogRoutes from "./blog.routes.js";
import authRoutes from "./auth.routes.js";
import commentRoutes from "./comment.routes.js";

const router = Router();

router.use("/blog", blogRoutes);
router.use("/auth", authRoutes);
router.use("/comment", commentRoutes);

export default router;