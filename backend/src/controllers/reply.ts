import { Request, Response, NextFunction } from "express";
import { resolve } from "path";
import { unlink, writeFileSync } from "fs";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import { prisma } from "../connections/prisma";
import { redis } from "../connections/redis";
import type { ReplyType } from "../types/reply";
import { appError } from "../utils/error";
import { rmCache } from "../utils/rm-cache";

export async function getReplies(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: thread_id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortField = req.query.sort === "order" ? "order_index" : "created_at";
    const order =
      (req.query.order as string)?.toLowerCase() === "asc" ? "ASC" : "DESC";
    const cacheKey = `replies:${thread_id}:${page}:${limit}:${sortField}:${order}`;
    const REDIS_EXPIRATION_SECONDS = 3600;
    const cached = await redis.get(cacheKey);
    if (cached) {
      const { replies, total } = JSON.parse(cached);
      return res.status(200).json({
        status: "Success",
        message: "Fetch replies success! (From Cache)",
        data: replies,
        meta: { total, page, limit },
      });
    }
    const totalResult = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*)::bigint AS count FROM "Reply" WHERE thread_id = '${thread_id}';`
    );
    const total = Number(totalResult[0]?.count || 0);
    const rawReply = await prisma.$queryRawUnsafe(
      `SELECT 
          R.id, 
          U.photo_profile, 
          U.full_name, 
          U.username, 
          R.content, 
          R.created_at, 
          R.image, 
          R.created_by, 
          R.updated_at, 
          R.updated_by
        FROM "Reply" AS R
        JOIN "User" AS U ON R.created_by = U.id
        WHERE R.thread_id = '${thread_id}'
        ORDER BY ${sortField} ${order}
        OFFSET ${skip} LIMIT ${limit};`
    );
    dayjs.extend(relativeTime);
    const replies = (rawReply as ReplyType[]).map((reply) => ({
      ...reply,
      age: dayjs(reply.created_at).fromNow(),
    }));
    const dataToCache = { replies, total };
    await redis.setEx(
      cacheKey,
      REDIS_EXPIRATION_SECONDS,
      JSON.stringify(dataToCache)
    );
    res.status(200).json({
      status: "Success",
      message: "Fetch replies success!",
      data: replies,
      meta: { total, page, limit },
    });
  } catch (err) {
    next(err);
  }
}

export async function postReplies(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { io } = req as any;
    const { content } = req.body;
    const { id: thread_id } = req.params;
    const { id: user_id } = (req as any).user;
    const fileName = (req as any)?.processedFile?.fileName;
    const fileBuffer = (req as any)?.processedFile?.fileBuffer;
    const relativePath = fileName ? `reply/${fileName}` : null;
    const createdReply = await prisma.reply.create({
      data: {
        user_id,
        thread_id,
        content,
        image: relativePath,
        created_by: user_id,
        updated_by: user_id,
      },
    });
    const rawReply = await prisma.$queryRawUnsafe(
      `SELECT 
            R.id, 
            U.photo_profile, 
            U.full_name, 
            U.username,
            R.content, 
            R.image,
            R.created_at, 
            R.created_by, 
            R.updated_at, 
            R.updated_by
        FROM "Reply" AS R
        JOIN "User" AS U ON R.created_by = U.id
        WHERE R.id = '${createdReply.id}'
    `
    );
    dayjs.extend(relativeTime);
    const reply = {
      ...(rawReply as ReplyType[])[0],
      age: dayjs((rawReply as ReplyType[])[0].created_at).fromNow(),
    };
    const totalReplies = await prisma.reply.count({
      where: { thread_id },
    });
    io.emit("newReply", {
      ...reply,
      thread_id,
      totalReplies,
    });
    if (fileName && fileBuffer) {
      const savePath = resolve(process.cwd(), "uploads", "reply", fileName);
      writeFileSync(savePath, fileBuffer);
    }
    await rmCache("replies:");
    res.status(201).json({
      status: "Success",
      message: `Create reply: ${content} success!`,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteReply(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { io } = req as any;
    const { id } = req.params;
    const { id: user_id } = (req as any).user;
    const existingReply = (req as any).model;
    if (existingReply.created_by !== user_id) {
      throw appError("You are not authorized to delete this reply!", 403);
    }
    await prisma.reply.delete({
      where: { id },
    });
    const totalReplies = await prisma.reply.count({
      where: { thread_id: existingReply.thread_id },
    });
    io.emit("deleteReply", {
      id: id,
      thread_id: existingReply.thread_id,
      totalReplies,
    });
    if (existingReply.image) {
      const uploadsRoot = resolve(process.cwd(), "uploads");
      const filePath = resolve(uploadsRoot, existingReply.image);
      unlink(filePath, (err) => {
        if (err) {
          console.error(`❌ Gagal hapus reply file: ${filePath}`);
        }
      });
    }
    await rmCache("replies:");
    res.status(200).json({
      status: "Success",
      message: `Delete reply by id: ${id} success!`,
    });
  } catch (err) {
    next(err);
  }
}
