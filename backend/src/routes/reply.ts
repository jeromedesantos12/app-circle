import { Router } from "express";
import { auth, isExist } from "../middlewares/auth";
import { deleteReply, getReplies, postReplies } from "../controllers/reply";
import { upload } from "../utils/multer";
import { saveFile } from "../middlewares/file";

const router = Router();

router.get("/thread/:id/reply", auth, getReplies);
router.post(
  "/thread/:id/reply",
  auth,
  upload.single("image"),
  saveFile,
  postReplies
);
router.delete("/reply/:id", auth, isExist("reply"), deleteReply);

export default router;
