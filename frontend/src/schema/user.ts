import { z } from "zod";

export const userSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be 3-30 alphanumeric characters or underscores.")
    .max(30, "Username must be 3-30 alphanumeric characters or underscores.")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username must be 3-30 alphanumeric characters or underscores."
    )
    .optional()
    .or(z.literal(""))
    .or(z.null()),
  full_name: z.string().trim().min(1, "Full name is required."),
  remove: z.boolean().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  photo_profile: z
    .string()
    .url("Invalid photo profile URL.")
    .optional()
    .or(z.literal(""))
    .or(z.null()),
  bio: z
    .string()
    .max(500, "Bio cannot exceed 500 characters.")
    .optional()
    .or(z.literal(""))
    .or(z.null()),
});

export type UserSchema = z.infer<typeof userSchema>;
