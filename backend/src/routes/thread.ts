import { Router } from "express";
import { auth, isExist } from "../middlewares/auth";
import {
  getThreads,
  getThreadById,
  postThread,
  deleteThread,
} from "../controllers/thread";
import { upload } from "../utils/multer";
import { saveFile } from "../middlewares/file";

const router = Router();

router.get("/thread", auth, getThreads);
router.get("/thread/:id", auth, getThreadById);
router.post("/thread", auth, upload.single("image"), saveFile, postThread);
router.delete("/thread/:id", auth, isExist("thread"), deleteThread);

export default router;
