import { z } from "zod";

export const resetSchema = z.object({
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  newPassword: z
    .string()
    .min(6, { message: "New Password must be at least 6 characters" }),
});

export type ResetFormData = z.infer<typeof resetSchema>;
