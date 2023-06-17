import { RedisModules } from "@redis/client/dist/lib/commands";
import { RedisClientType } from "redis";

import { init, sendToEvent, subscribe } from "./rabbitMQ";
import { redis } from "./redis";

let redisClient: RedisClientType<RedisModules, any, any> | null = null;

export const adapters = () => ({
  cache: {
    primary: {
      init: async () => {
        redisClient = await redis();
        return redisClient;
      },
      getPrimary: () => {
        if (!redisClient) throw new Error("Redis Client Not Initialized");
        return redisClient;
      },
    },
  },
  queue: {
    init: async () => {
      await init();
    },
    sendToEvent: async (payload: Object) => {
      await sendToEvent(payload);
    },
    subscribe: (q: string, listener: Function) => subscribe(q, listener),
  },
});
