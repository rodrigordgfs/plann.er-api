import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  API_BASE_URL: z.string().url(),
  APP_BASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3333),
  SUPABASE_URL: z.string().url(),
  SUPABASE_KEY: z.string()
});

export const env = envSchema.parse(process.env);
