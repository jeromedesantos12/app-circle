import { Router } from "express";
import { auth } from "../middlewares/auth";
import { postLike } from "../controllers/like";

const router = Router();

router.post("/thread/:id/like", auth, postLike);

export default router;
