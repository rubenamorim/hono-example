import { MiddlewareHandler } from "hono";
import os from "os";
import pino from "pino";

import env, { isDev } from "./env";

const logger = pino(
  {
    level: env.LOG_LEVEL,
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
      pid: process.pid,
      hostname: os.hostname(),
      railway: {
        replicaId: env.RAILWAY_REPLICA_ID,
        replicaRegion: env.RAILWAY_REPLICA_REGION,
      },
    },
    ...(isDev && {
      transport: {
        target: "pino-pretty",
        options: {
          colorize: isDev,
        },
      },
    }),
  },
  env.AXIOM_DATASET && env.AXIOM_TOKEN
    ? pino.transport({
        target: "@axiomhq/pino",
        options: {
          dataset: env.AXIOM_DATASET,
          token: env.AXIOM_TOKEN,
        },
      })
    : undefined
);

export const loggerMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const startTime = Date.now();
    const requestId = c.get("requestId");

    logger.info(
      {
        url: c.req.url,
        path: c.req.path,
        method: c.req.method,
        headers: Object.fromEntries(c.req.raw.headers),
        requestId,
      },
      `[Request] ${requestId} - ${c.req.method} ${c.req.path}`
    );

    await next();

    const responseTime = Date.now() - startTime;
    const formattedResponseTime =
      responseTime > 1000
        ? `${(responseTime / 1000).toFixed(2)}s`
        : `${responseTime}ms`;

    logger.info(
      {
        url: c.req.url,
        path: c.req.path,
        method: c.req.method,
        headers: Object.fromEntries(c.res.headers),
        requestId,
        status: c.res.status,
        responseTime,
        userId: c.get("user")?.id,
      },
      `[Response] ${requestId} - ${c.req.method} ${c.req.path} ${c.res.status} ${formattedResponseTime}`
    );
  };
};

export default logger;
