import { hash, compare } from "bcrypt";

export async function hashPassword(password: string) {
  return await hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return await compare(password, hash);
}
