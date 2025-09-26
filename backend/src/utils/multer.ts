import multer from "multer";
import { appError } from "../utils/error";
import { extension } from "mime-types";

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const mime = file.mimetype;
    const ext = extension(mime);
    const allowedMimes = ["image/jpeg", "image/png"];
    const allowedExts = ["jpg", "jpeg", "png"];
    if (
      allowedMimes.includes(mime) === false ||
      (typeof ext === "string" && allowedExts.includes(ext)) === false
    ) {
      return cb(appError("Invalid file type", 400));
    }
    cb(null, true);
  },
});
