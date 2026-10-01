import { z } from "zod/v4";

export const studentDetailsSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().regex(/^\d{10}$/, { message: "Phone number must be exactly 10 digits." }),
  gender: z.literal("male").or(z.literal("female")),
});

export type StudentDetails = z.infer<typeof studentDetailsSchema>;
