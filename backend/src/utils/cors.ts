import cors from "cors";
import { config } from "dotenv";

config();

const CORS_URL = process.env.CORS_URL as string;

export const corsSocket = {
  cors: {
    origin: [CORS_URL],
    methods: ["GET", "POST"],
    credentials: true,
  },
};

export const corsMiddleware = cors({
  origin: [CORS_URL],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
});
