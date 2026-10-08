import { Router } from "express";
import { readAll, readOne, create, update, remove } from "../controllers/blog.controller";

const router = Router();

router.get("/", readAll);
router.get("/:id", readOne);
router.post("/", create);
router.patch("/:id", update);
router.delete("/:id", remove);

export default router;