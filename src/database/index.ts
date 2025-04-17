import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import env from "../env";
import logger from "../logger";

import * as schema from "./schema";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

pool.on("error", (error) => {
  logger.error(
    {
      error: {
        ...error,
        cause: error.cause,
        message: error.message,
        name: error.name,
      },
    },
    "[DB] Connection error"
  );
});

export const db = drizzle(pool, {
  schema,
  logger: {
    logQuery: (query: string, params: unknown[]) => {
      logger.debug({ query, params }, "[DB] Query");
    },
  },
});

export default db;
