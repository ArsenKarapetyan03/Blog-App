import { Router } from "express";
import blogRoutes from "./blog.routes.js";
import authRoutes from "./auth.routes.js";

const router = Router();

router.use("/blog", blogRoutes);
router.use("/auth", authRoutes);

export default router;