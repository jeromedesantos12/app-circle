import { Request, Response, NextFunction } from "express";
import { prisma } from "../connections/prisma";

export async function postLike(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { io } = req as any;
    const { id: thread_id } = req.params;
    const { id: user_id } = (req as any).user;
    const isExist = await prisma.like.findFirst({
      where: { thread_id, user_id },
    });
    if (isExist) {
      await prisma.like.delete({ where: { id: isExist.id } });
      const count = await prisma.like.count({ where: { thread_id } });
      io.emit("deleteLike", { thread_id, count, user_id });
      return res.status(201).json({
        status: "Success",
        message: "Like deleted successfully",
      });
    }
    await prisma.like.create({
      data: { user_id, thread_id, created_by: user_id, updated_by: user_id },
    });
    const count = await prisma.like.count({ where: { thread_id } });
    io.emit("newLike", { thread_id, count, user_id });
    res.status(201).json({
      status: "Success",
      message: `Create like for thread: ${thread_id} success!`,
    });
  } catch (err) {
    next(err);
  }
}
