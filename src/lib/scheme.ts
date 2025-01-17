import { z } from "zod";

export const ValidateScheme = z.object({
    email: z.string().email(),
    password: z.string().min(1).max(5),
})