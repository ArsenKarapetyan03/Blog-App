import { Router } from "express";
import { create } from "../controllers/auth.controller";

const router = Router();

// router.get("/:id", readOne);
router.post("/", create);
// router.patch("/:id", update);
// router.delete("/:id", remove);

export default router;