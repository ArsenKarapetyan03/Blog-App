import { Router } from "express";
import blogRoutes from "./blog.routes";
import authRoutes from "./auth.routes";

const router = Router();

router.use("/blog", blogRoutes);
router.use("/auth", authRoutes);

export default router;