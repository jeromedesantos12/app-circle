import { z } from "zod";

export const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, { message: "Email or Username cannot be empty" }),
  password: z.string().min(1, { message: "Password cannot be empty" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
