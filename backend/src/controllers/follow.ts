import { Request, Response, NextFunction } from "express";
import { prisma } from "../connections/prisma";
import { redis } from "../connections/redis";
import { appError } from "../utils/error";
import { rmCache } from "../utils/rm-cache";

export async function countFollows(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const totalFollowing = await prisma.following.count({
      where: { follower_id: id },
    });
    const totalFollowers = await prisma.following.count({
      where: { following_id: id },
    });
    res.status(200).json({
      status: "Success",
      message: "Fetch threads success!",
      data: {
        totalFollowing,
        totalFollowers,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getFollows(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: follower_id } = req.params;
    const logUserId = (req as any).user.id;
    const {
      sortBy = "created_at",
      order = "desc",
      offset = 0,
      limit = 5,
    } = req.query;
    const notFollowingIds = await prisma.following.findMany({
      where: {
        follower_id: follower_id,
      },
      select: {
        following_id: true,
      },
    });
    const followingIdList = notFollowingIds.map(
      (follow) => follow.following_id
    );
    const notFollowingData = await prisma.user.findMany({
      where: {
        id: {
          notIn: followingIdList,
        },
        NOT: {
          id: follower_id,
        },
      },
      select: {
        id: true,
        username: true,
        full_name: true,
        photo_profile: true,
        bio: true,
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
    const usersWithFollowStatus = notFollowingData.map((user) => ({
      ...user,
      isFollowed: followedUserIds.has(user.id),
    }));
    res.status(200).json({
      status: "Success",
      message: "Fetch threads success!",
      data: usersWithFollowStatus,
    });
  } catch (err) {
    next(err);
  }
}

export async function getFollowing(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: follower_id } = req.params;
    const {
      sortBy = "created_at",
      order = "desc",
      offset = 0,
      limit = 10,
    } = req.query;
    const logUserId = (req as any).user.id;
    const followingData = await prisma.following.findMany({
      where: {
        follower_id,
      },
      select: {
        user_following: {
          select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true,
            bio: true,
          },
        },
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
    const formattedData = followingData.map((item) => item.user_following);
    const followedUserIds = new Set(followedUsers.map((f) => f.following_id));
    const usersWithFollowStatus = formattedData.map((user) => ({
      ...user,
      isFollowed: followedUserIds.has(user.id),
    }));
    res.status(200).json({
      status: "Success",
      message: "Fetch following success!",
      data: usersWithFollowStatus,
    });
  } catch (err) {
    next(err);
  }
}

export async function getFollowers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: following_id } = req.params;
    const logUserId = (req as any).user.id;
    const {
      sortBy = "created_at",
      order = "desc",
      offset = 0,
      limit = 10,
    } = req.query;
    const followerData = await prisma.following.findMany({
      where: {
        following_id,
      },
      select: {
        user_follower: {
          select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true,
            bio: true,
          },
        },
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
    const formattedData = followerData.map((item) => item.user_follower);
    const followedUserIds = new Set(followedUsers.map((f) => f.following_id));
    const usersWithFollowStatus = formattedData.map((user) => ({
      ...user,
      isFollowed: followedUserIds.has(user.id),
    }));
    res.status(200).json({
      status: "Success",
      message: "Fetch following success!",
      data: usersWithFollowStatus,
    });
  } catch (err) {
    next(err);
  }
}

export async function postFollows(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { io } = req as any;
    const { id: following_id } = req.params;
    const { id: follower_id } = (req as any).user;
    const isExist = await prisma.following.findFirst({
      where: { follower_id, following_id },
    });
    if (isExist) {
      await prisma.following.delete({
        where: { id: isExist.id },
      });
      const followingData = await prisma.user.findFirst({
        where: {
          id: following_id,
        },
        select: {
          id: true,
          username: true,
          full_name: true,
          photo_profile: true,
          bio: true,
        },
      });
      io.emit("deleteFollowing", {
        user_id: follower_id,
        targetUser: following_id,
        followingData,
      });
      await rmCache("users:");
      return res.status(201).json({
        status: "Success",
        message: "Following deleted successfully",
      });
    }
    if (follower_id === following_id) {
      throw appError("You cannot follow yourself!", 400);
    }
    await prisma.following.create({
      data: {
        follower_id,
        following_id,
        created_by: follower_id,
        updated_by: follower_id,
      },
    });
    const followingData = await prisma.following.findFirst({
      where: {
        follower_id,
        following_id,
      },
      select: {
        user_following: {
          select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true,
            bio: true,
          },
        },
      },
    });
    const formattedData = followingData?.user_following;
    io.emit("postFollowing", {
      user_id: follower_id,
      targetUser: following_id,
      followingData: formattedData,
    });
    await rmCache("users:");
    res.status(201).json({
      status: "Success",
      message: `Create following for user: ${following_id} success!`,
    });
  } catch (err) {
    next(err);
  }
}
