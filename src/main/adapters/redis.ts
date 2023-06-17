import { createClient } from "redis";
import { logger } from "../lib/logger";

export const redis = async () => {
  const client = createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
    password: process.env.REDIS_PASSWORD,
  });

  client.on("error", (err: Error) => {
    logger.error("Redis Client Error", err);
    process.exit(1);
  });

  client.on("connect", () =>
    logger.info(`Redis Client Connected on Port ${process.env.REDIS_PORT}`)
  );

  await client.connect();

  return client;
};
