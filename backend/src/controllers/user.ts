import { Request, Response, NextFunction } from "express";
import { unlink, writeFileSync } from "fs";
import { resolve } from "path";
import { prisma } from "../connections/prisma";
import { redis } from "../connections/redis";
import { appError } from "../utils/error";
import { signToken } from "../utils/jwt";
import { hashPassword, comparePassword } from "../utils/bcrypt";

export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { emailOrUsername, password } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });
    if (user === null) {
      throw appError("Invalid email or username", 401);
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (user && isPasswordValid === false) {
      throw appError("Invalid password", 401);
    }
    const token = signToken({
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      photo_profile: user.photo_profile,
      bio: user.bio,
    });
    const { email, photo_profile, bio } = user;
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "strict",
        path: "/",
      })
      .status(200)
      .json({
        status: "Success",
        message: `Login User by: ${emailOrUsername} success!`,
      });
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "strict",
        path: "/",
      })
      .status(200)
      .json({
        status: "Success",
        message: `Login User by: ${emailOrUsername} success!`,
      });
  } catch (err) {
    next(err);
  }
}

export function logoutUser(req: Request, res: Response, next: NextFunction) {
  try {
    res
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      })
      .status(200)
      .json({
        status: "Success",
        message: "Logout successful!",
      });
  } catch (err) {
    next(err);
  }
}

export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { full_name, email, password } = req.body;
    const hashedPassword = await hashPassword(password);
    const exitingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (exitingEmail) {
      throw appError("Email already exists!", 409);
    }
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          full_name,
          email,
          password: hashedPassword,
        },
      });
      await tx.user.update({
        where: { id: newUser.id },
        data: { created_by: newUser.id },
      });
      return newUser;
    });
    res.status(201).json({
      status: "Success",
      message: `Create user ${full_name} success!`,
    });
  } catch (err) {
    next(err);
  }
}

export function verifyUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = (req as any).user;
    res.status(200).json({
      status: "Success",
      message: "Fetch user success!",
      data: {
        id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function resetUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { password, newPassword } = req.body;
    const existingUser = (req as any).model;
    const isPasswordValid = await comparePassword(
      password,
      existingUser.password
    );
    if (existingUser && isPasswordValid === false) {
      throw appError("Invalid password", 401);
    }
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      data: {
        password: hashedPassword,
      },
      where: { id },
    });
    res.status(200).json({
      status: "Success",
      message: `Reset user by id: ${id} success!`,
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({
      select: {
        password: true,
      },
      where: { email },
    });
    res.status(200).json({
      status: "Success",
      message: `Fetch user success!`,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      search,
      sortBy = "created_at",
      order = "desc",
      offset = 0,
      limit = 10,
    } = req.query;
    const logUserId = (req as any).user.id;
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        {
          username: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          full_name: {
            contains: search as string,
            mode: "insensitive",
          },
        },
      ];
    }
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        full_name: true,
        email: true,
        photo_profile: true,
        bio: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        [sortBy as string]: order as "asc" | "desc",
      },
      skip: Number(offset),
      take: Number(limit),
    });
    const followedUsers = await prisma.following.findMany({
      where: {
        follower_id: logUserId,
      },
      select: {
        following_id: true,
      },
    });
    const followedUserIds = new Set(followedUsers.map((f) => f.following_id));
    const usersWithFollowStatus = users.map((user) => ({
      ...user,
      isFollowed: followedUserIds.has(user.id),
    }));
    let results = null;
    const key = "getUsers:" + search;
    const value = await redis.get(key);
    if (value) {
      results = JSON.parse(value);
      console.log("Catche hit");
    } else {
      results = usersWithFollowStatus;
      await redis.set(key, JSON.stringify(results), {
        EX: 300,
      });
      console.log("Catche miss");
    }
    res.status(200).json({
      status: "Success",
      message: "Fetch users success!",
      // data: results,
      data: usersWithFollowStatus,
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        username: true,
        full_name: true,
        email: true,
        photo_profile: true,
        bio: true,
        created_at: true,
        created_by: true,
        updated_at: true,
        updated_by: true,
      },
      where: { id },
    });
    let results = null;
    const key = "getUserById:" + id;
    const value = await redis.get(key);
    if (value) {
      results = JSON.parse(value);
      console.log("Catche hit");
    } else {
      results = user;
      await redis.set(key, JSON.stringify(results), {
        EX: 300,
      });
      console.log("Catche miss");
    }
    res.status(200).json({
      status: "Success",
      message: "Fetch user success!",
      // data: results,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { io } = req as any;
    const { remove, full_name, username, bio } = req.body;
    const existingUser = (req as any).model;
    const fileName = (req as any)?.processedFile?.fileName;
    const fileBuffer = (req as any)?.processedFile?.fileBuffer;
    const relativePath = fileName ? `user/${fileName}` : null;
    await prisma.user.update({
      data: {
        username,
        full_name,
        email: existingUser.email,
        password: existingUser.password,
        photo_profile:
          remove === "ok" ? null : relativePath ?? existingUser.photo_profile,
        bio,
        updated_by: existingUser.id,
      },
      where: { id },
    });
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        username: true,
        full_name: true,
        email: true,
        photo_profile: true,
        bio: true,
        created_at: true,
        created_by: true,
        updated_at: true,
        updated_by: true,
      },
      where: { id },
    });
    io.emit("updateUser", user);
    const uploadsDir = resolve(process.cwd(), "uploads");
    const oldFilePath = existingUser.photo_profile
      ? resolve(uploadsDir, existingUser.photo_profile)
      : null;
    const newFilePath = fileName ? resolve(uploadsDir, "user", fileName) : null;
    if (remove === "ok" && oldFilePath) {
      unlink(oldFilePath, (err) => {
        if (err) throw appError("File cannot remove!", 500);
      });
    }
    if (fileName && fileBuffer) {
      if (oldFilePath) {
        unlink(oldFilePath, (err) => {
          if (err) throw appError("File cannot remove!", 500);
        });
      }
      writeFileSync(newFilePath!, fileBuffer);
    }
    res.status(200).json({
      status: "Success",
      message: `Update user ${full_name} success!`,
    });
  } catch (err) {
    next(err);
  }
}
