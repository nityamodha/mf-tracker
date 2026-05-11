import { z } from "zod";

import { ROLE_OPTIONS } from "@/lib/utils/options";

export const createUserSchema = z.object({
  full_name: z.string().trim().min(3, "Full name is required."),
  email: z.email().trim(),
  password: z.string().min(1, "Password is required."),
  role: z.enum(ROLE_OPTIONS),
  team: z.string().trim().optional().nullable(),
});

export const toggleUserSchema = z.object({
  userId: z.string().uuid(),
  isActive: z.boolean(),
});
