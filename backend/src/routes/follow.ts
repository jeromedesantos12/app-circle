import { Router } from "express";
import { auth } from "../middlewares/auth";
import {
  countFollows,
  getFollowers,
  getFollowing,
  getFollows,
  postFollows,
} from "../controllers/follow";

const router = Router();

router.get("/follow/:id", auth, getFollows);
router.get("/count/:id", auth, countFollows);
router.get("/following/:id", auth, getFollowing);
router.get("/followers/:id", auth, getFollowers);
router.post("/follow/:id", auth, postFollows);

export default router;
