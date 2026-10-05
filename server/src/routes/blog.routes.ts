import * as blogControllers from "../controllers/blog.controller.js"
import { Router } from "express";

const router = Router();

router.get("/", blogControllers.getPosts);
router.get("/:id", blogControllers.getPost);
router.post("/add", blogControllers.createPost);
router.put("/edit/:id", blogControllers.updatePost);
router.delete("/delete/:id", blogControllers.deletePost);

export default router;