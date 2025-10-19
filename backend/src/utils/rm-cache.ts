import { redis } from "../connections/redis";

export async function rmCache(prefix: string): Promise<number> {
  let cursor = "0";
  let deletedCount = 0;

  do {
    const { cursor: nextCursor, keys } = await redis.scan(cursor, {
      MATCH: `${prefix}*`,
      COUNT: 100,
    });
    cursor = nextCursor;
    if (keys.length > 0) {
      await redis.del(keys);
      deletedCount += keys.length;
    }
  } while (cursor !== "0");
  return deletedCount;
}
