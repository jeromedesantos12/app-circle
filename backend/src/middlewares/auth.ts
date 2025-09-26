import { Request, Response, NextFunction } from "express";
import { prisma } from "../connections/prisma";
import { verifyToken } from "../utils/jwt";
import { appError } from "../utils/error";

export function auth(req: Request, res: Response, next: NextFunction) {
  const { token } = req.cookies;
  if (token === undefined) {
    throw appError("You must Login to access!", 401);
  }
  const decoded = verifyToken(token);
  (req as any).user = decoded as any;
  next();
}

export function nonAuth(req: Request, res: Response, next: NextFunction) {
  const { token } = req.cookies;
  if (token) {
    throw appError("You're already logged in!", 400);
  }
  next();
}

export function isSame(req: Request, res: Response, next: NextFunction) {
  const idParam = req.params.id;
  const { id } = (req as any).user;
  if (idParam !== id) {
    throw appError("You cannot see other user's data!", 400);
  }
  next();
}

export function isExist(modelName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const name = modelName.charAt(0).toUpperCase() + modelName.slice(1);
      const model = await (prisma as any)[modelName].findUnique({
        where: { id },
      });
      if (model === null) {
        throw appError(`${name} Not Found!`, 404);
      }
      (req as any).model = model;
      next();
    } catch (err) {
      next(err);
    }
  };
}
