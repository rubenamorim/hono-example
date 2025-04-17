import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(["info", "debug"]).default("info"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),

  DATABASE_URL: z.string(),

  AXIOM_DATASET: z.string().optional(),
  AXIOM_TOKEN: z.string().optional(),

  RAILWAY_REPLICA_ID: z.string().optional(),
  RAILWAY_REPLICA_REGION: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

const parsedEnv = envSchema.parse(process.env);

export const isProd = parsedEnv.NODE_ENV === "production";
export const isDev = !isProd;

export default parsedEnv;
