import { createClient } from "redis";

export const redis = createClient();

(async () => {
  redis.on("error", (err) => console.log("Redis Client Error 💥", err));
  redis.on("ready", () => console.log("Redis Client started ✨"));
  await redis.connect();
  await redis.ping();
})();
