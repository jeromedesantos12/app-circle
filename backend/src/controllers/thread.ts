import { Request, Response, NextFunction } from "express";
import { resolve } from "path";
import { unlink, writeFileSync } from "fs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { prisma } from "../connections/prisma";
import { redis } from "../connections/redis";
import { appError } from "../utils/error";
import type { ThreadType } from "../types/thread";

export async function getThreads(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      sortBy = "created_at",
      order = "desc",
      offset = 0,
      limit = 10,
    } = req.query;
    const logUserId = (req as any).user.id;
    const rawThreads = await prisma.$queryRawUnsafe(
      ` SELECT
          T.id,
          U.photo_profile,
          U.full_name,
          U.username,
          EXTRACT(EPOCH FROM (NOW() - T."created_at"))::int AS age,
          T.content,
          T.image,
          COUNT(R.thread_id)::int AS number_of_replies,
          COUNT(L.thread_id)::int AS number_of_likes,
          COALESCE(array_agg(DISTINCT L.user_id) FILTER (WHERE L.user_id IS NOT NULL), '{}') AS liked_user_ids,
          T.created_at,
          T.created_by,
          T.updated_at,
          T.updated_by
        FROM
          "Thread" AS T
        LEFT JOIN
          "Like" AS L ON T.id = L.thread_id
        LEFT JOIN
          "Reply" AS R ON T.id = R.thread_id
        LEFT JOIN
          "User" AS U ON T.created_by = U.id
                LEFT JOIN
          "Following" AS F ON T.created_by = F.following_id
        WHERE
          F.follower_id = '${logUserId}' OR T.created_by = '${logUserId}'
        GROUP BY
          T.id, U.photo_profile, U.full_name, U.username
        ORDER BY ${sortBy} ${order}
        OFFSET ${offset} LIMIT ${limit};`
    );
    dayjs.extend(relativeTime);
    const threads = (rawThreads as ThreadType[]).map((thread) => ({
      ...thread,
      isLiked: thread.liked_user_ids.includes((req as any).user.id),
      age: dayjs(thread.created_at).fromNow(),
    }));
    let results = null;
    const key = "getThreads";
    const value = await redis.get(key);
    if (value) {
      results = JSON.parse(value);
      console.log("Catche hit");
    } else {
      results = threads;
      await redis.set(key, JSON.stringify(results), {
        EX: 300,
      });
      console.log("Catche miss");
    }
    res.status(200).json({
      status: "Success",
      message: "Fetch threads success!",
      // data: results,
      data: threads,
    });
  } catch (err) {
    next(err);
  }
}

export async function getThreadById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const rawThreads = await prisma.$queryRawUnsafe(
      `SELECT
          T.id,
          U.photo_profile,
          U.full_name,
          U.username,
          T.content,
          T.image,
          COUNT(R.thread_id)::int AS number_of_replies,
          COUNT(L.thread_id)::int AS number_of_likes,
          COALESCE(array_agg(DISTINCT L.user_id) FILTER (WHERE L.user_id IS NOT NULL), '{}') AS liked_user_ids,
          T.created_at,
          T.created_by,
          T.updated_at,
          T.updated_by
      FROM "Thread" AS T
      LEFT JOIN "Like" AS L ON T.id = L.thread_id
      LEFT JOIN "Reply" AS R ON T.id = R.thread_id
      LEFT JOIN "User" AS U ON T.created_by = U.id
      WHERE T.id = '${id}'
      GROUP BY T.id, U.photo_profile, U.full_name, U.username;`
    );
    dayjs.extend(relativeTime);
    const threads = (rawThreads as ThreadType[]).map((thread) => ({
      ...thread,
      isLiked: thread.liked_user_ids.includes((req as any).user.id),
      age: dayjs(thread.created_at).fromNow(),
    }));
    let results = null;
    const key = "getThreadById:" + id;
    const value = await redis.get(key);
    if (value) {
      results = JSON.parse(value);
      console.log("Catche hit");
    } else {
      results = threads[0];
      await redis.set(key, JSON.stringify(results), {
        EX: 300,
      });
      console.log("Catche miss");
    }
    res.status(200).json({
      status: "Success",
      message: "Fetch threads success!",
      // data: results,
      data: threads[0],
    });
  } catch (err) {
    next(err);
  }
}

export async function postThread(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { io } = req as any;
    const { content } = req.body;
    const { id: user_id } = (req as any).user;
    const fileName = (req as any)?.processedFile?.fileName;
    const fileBuffer = (req as any)?.processedFile?.fileBuffer;
    const relativePath = fileName ? `thread/${fileName}` : null;
    const createdThread = await prisma.thread.create({
      data: {
        content,
        image: relativePath,
        created_by: user_id,
        updated_by: user_id,
      },
    });
    const rawThread = await prisma.$queryRawUnsafe(`
      SELECT
        T.id,
        U.photo_profile,
        U.full_name,
        U.username,
        T.content,
        T.image,
        COUNT(L.thread_id)::int AS number_of_likes,
        COUNT(R.thread_id)::int AS number_of_replies,
        COALESCE(array_agg(DISTINCT L.user_id) FILTER (WHERE L.user_id IS NOT NULL), '{}') AS liked_user_ids,
        T.created_at,
        T.created_by,
        T.updated_at,
        T.updated_by
      FROM "Thread" AS T
      LEFT JOIN "Like" AS L ON T.id = L.thread_id
      LEFT JOIN "Reply" AS R ON T.id = R.thread_id
      LEFT JOIN "User" AS U ON T.created_by = U.id
      WHERE T.id = '${createdThread.id}'
      GROUP BY T.id, U.photo_profile, U.full_name, U.username
    `);
    dayjs.extend(relativeTime);
    const thread = {
      ...(rawThread as ThreadType[])[0],
      isLiked: (rawThread as ThreadType[])[0].liked_user_ids.includes(
        (req as any).user.id
      ),
      age: dayjs((rawThread as ThreadType[])[0].created_at).fromNow(),
    };
    io.emit("newThread", thread);
    if (fileName && fileBuffer) {
      const savePath = resolve(process.cwd(), "uploads", "thread", fileName);
      writeFileSync(savePath, fileBuffer);
    }
    res.status(201).json({
      status: "Success",
      message: `Create thread: ${content} success!`,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteThread(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { io } = req as any;
    const { id } = req.params;
    const { id: user_id } = (req as any).user;
    const existingThread = (req as any).model;
    if (existingThread.created_by !== user_id) {
      throw appError("You are not authorized to delete this thread!", 403);
    }
    const repliesWithImages = await prisma.reply.findMany({
      where: { thread_id: id },
      select: { image: true },
    });
    await prisma.$transaction(async (tx) => {
      try {
        await tx.like.deleteMany({
          where: { thread_id: id },
        });
        await tx.reply.deleteMany({
          where: { thread_id: id },
        });
        return await tx.thread.delete({
          where: { id },
        });
      } catch (err: any) {
        throw appError(err.message, 500);
      }
    });
    io.emit("deleteThread", { id });
    if (existingThread.image) {
      const uploadsRoot = resolve(process.cwd(), "uploads");
      if (existingThread.image) {
        const filePath = resolve(uploadsRoot, existingThread.image);
        unlink(filePath, (err) => {
          if (err) console.error(`❌ Gagal hapus thread file: ${filePath}`);
        });
      }
      repliesWithImages.forEach((reply) => {
        if (reply.image) {
          const replyPath = resolve(uploadsRoot, reply.image);
          unlink(replyPath, (err) => {
            if (err) console.error(`❌ Gagal hapus reply file: ${replyPath}`);
          });
        }
      });
    }
    res.status(200).json({
      status: "Success",
      message: `Delete thread by id: ${id} success!`,
    });
  } catch (err) {
    next(err);
  }
}
