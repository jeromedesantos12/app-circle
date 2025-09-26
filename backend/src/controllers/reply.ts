import { Request, Response, NextFunction } from "express";
import { resolve } from "path";
import { unlink, writeFileSync } from "fs";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import { prisma } from "../connections/prisma";
import { redis } from "../connections/redis";
import type { ReplyType } from "../types/reply";
import { appError } from "../utils/error";

export async function getReplies(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: thread_id } = req.params;
    const {
      sortBy = "created_at",
      order = "desc",
      offset = 0,
      limit = 10,
    } = req.query;
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
        ORDER BY ${sortBy} ${order}
        OFFSET ${offset} LIMIT ${limit}`
    );
    dayjs.extend(relativeTime);
    const reply = (rawReply as ReplyType[]).map((thread) => ({
      ...thread,
      age: dayjs(thread.created_at).fromNow(),
    }));
    let results = null;
    const key = "getReplies:" + thread_id;
    const value = await redis.get(key);
    if (value) {
      results = JSON.parse(value);
      console.log("Catche hit");
    } else {
      results = reply;
      await redis.set(key, JSON.stringify(results), {
        EX: 300,
      });
      console.log("Catche miss");
    }
    res.status(200).json({
      status: "Success",
      message: "Fetch threads success!",
      data: results,
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

    res.status(200).json({
      status: "Success",
      message: `Delete reply by id: ${id} success!`,
    });
  } catch (err) {
    next(err);
  }
}
