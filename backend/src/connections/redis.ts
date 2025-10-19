import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("❌ Missing REDIS_URL in environment variables");
}
export const redis = createClient({
  url: redisUrl,
});
redis.on("error", (err) => console.error("❌ Redis Error:", err));
if (process.env.NODE_ENV !== "production") {
  redis.connect().then(() => console.log("✅ Redis connected (dev mode)"));
}
