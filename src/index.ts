import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { compress } from "hono/compress";
import { requestId } from "hono/request-id";

import env from "./env";
import db from "./database";
import logger, { loggerMiddleware } from "./logger";
import { isNotNull } from "drizzle-orm";

const app = new Hono();

app.use(compress()).use(requestId()).use(loggerMiddleware());

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/api/user", async (c) => {
  const session = await db.query.sessions.findFirst({
    where: (table, { isNotNull }) => isNotNull(table.userId),
  });

  if (!session) {
    return c.json({ error: "Session not found" }, 400);
  }

  const user = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.id, session.userId),
  });

  if (!user) {
    return c.json({ error: "User not found" }, 400);
  }

  return c.json(user);
});

app.notFound((c) => {
  return c.json({ notFound: true }, 404);
});

app.onError((error, c) => {
  logger.error(
    {
      error: {
        ...error,
        cause: error.cause,
        message: error.message,
        name: error.name,
      },
      requestId: c.get("requestId"),
    },
    "Generic error"
  );

  return c.json({ error }, 500);
});

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`Listening on http://localhost:${info.port}`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, closing server`);

  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("uncaughtException", (error) => {
  logger.error({ error }, "Uncaught exception");
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error({ promise, reason }, "Unhandled Rejection at: Promise");
});
