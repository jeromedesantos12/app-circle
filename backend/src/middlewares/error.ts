import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({
      status: "Error",
      message: "file bigger than 2 MB",
    });
    return;
  }
  res.status(err.statusCode || 500).json({
    status: err.name || "error",
    message: err.message || "Internal Server Error!",
  });
}
