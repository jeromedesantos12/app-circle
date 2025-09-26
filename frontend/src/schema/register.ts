import { z } from "zod";

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(3, { message: "Full name must be at least 3 characters" })
      .max(50, { message: "Full name must be at most 50 characters" })
      .regex(/^[a-zA-Z\s]+$/, {
        message: "Full name can only contain letters and spaces",
      }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
