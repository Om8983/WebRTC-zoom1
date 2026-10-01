import { z } from "zod";

export const userSignUpSchema = z.object({
  email: z.email(),
  userName: z.string(),
  password: z.string().min(8),
});

export const userLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});
