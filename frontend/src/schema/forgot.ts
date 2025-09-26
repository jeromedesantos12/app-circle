import { z } from "zod";

export const forgotSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export type ForgotFormData = z.infer<typeof forgotSchema>;
