import { sign, verify } from "jsonwebtoken";
import { config } from "dotenv";
import type { PayloadType } from "../types/payload";

config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export function signToken(payload: PayloadType) {
  return sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string) {
  return verify(token, JWT_SECRET) as PayloadType;
}
