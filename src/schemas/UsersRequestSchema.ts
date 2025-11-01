import z3, { z } from "zod";

export const CreateUserRequestSchema = z3.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string()
})