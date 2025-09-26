import rateLimit from "express-rate-limit";
import { appError } from "./error";

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  handler: (req, res, next) => {
    next(appError("too many request, please try again later", 429));
  },
});
