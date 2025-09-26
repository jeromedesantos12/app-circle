import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { verifyToken } from "./jwt";
import * as cookie from "cookie";

export function authSocket(
  socket: Socket,
  next: (err?: ExtendedError) => void
) {
  const cookies = socket.handshake.headers.cookie;
  if (cookies === undefined) {
    return next(new Error("No cookies"));
  }
  const parsed = cookie.parse(cookies);
  const token = parsed.token;
  if (token === undefined) {
    return next(new Error("Token missing"));
  }
  try {
    const decoded = verifyToken(token);
    (socket as any).user = decoded;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
}

export function testSocket(socket: Socket) {
  console.log("✅ User:", (socket as any).user);
}
