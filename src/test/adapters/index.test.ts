import {
  expect,
  jest,
  describe,
  beforeEach,
  afterEach,
  it,
} from "@jest/globals";
import { adapters } from "../../main/adapters";
import { redis } from "../../main/adapters/redis";
import { RedisClientType } from "redis";
import { logger } from "../../main/lib/logger";
import { init, sendToEvent, subscribe } from "../../main/adapters/rabbitMQ";

jest.mock("../../main/adapters/redis");
jest.mock("../../main/adapters/rabbitMQ");

const mockRedis = redis as jest.MockedFunction<typeof redis>;
const mockInit = init as jest.MockedFunction<typeof init>;
const mockSendToEvent = sendToEvent as jest.MockedFunction<typeof sendToEvent>;
const mockSubscribe = subscribe as jest.MockedFunction<typeof subscribe>;

describe("adapters main index", () => {
  let redisClient: RedisClientType<any, any, any> | null = null;

  beforeEach(() => {
    // Reset mock logger functions before each test
    jest.clearAllMocks();
    redisClient = null;
  });

  it("should fail to return Redis client", () => {
    try {
      redisClient = adapters().cache.primary.getPrimary();
    } catch (err) {
      logger.error(err);
    }
    expect(redisClient).toBe(null);
  });

  it("should initialize Redis client", async () => {
    const mockRedisClient = {} as RedisClientType<any, any, any>;
    mockRedis.mockResolvedValueOnce(mockRedisClient as any); // Mocking the redis() function to return a resolved value

    redisClient = await adapters().cache.primary.init();

    expect(redis).toHaveBeenCalledTimes(1); // Checking if redis() function is called once
    expect(redisClient).toBe(mockRedisClient); // Checking if the Redis client is initialized correctly
  });

  it("should return Redis client", () => {
    const client = adapters().cache.primary.getPrimary();
    expect(typeof client).toBe(typeof redisClient);
  });

  it("should initialize queue client", async () => {
    mockInit.mockResolvedValue(undefined);

    await adapters().queue.init();

    expect(init).toHaveBeenCalledTimes(1);
  });

  it("should send to event", async () => {
    const payload = { foo: "bar" };
    mockSendToEvent.mockResolvedValue(undefined);

    await adapters().queue.sendToEvent(payload);

    expect(sendToEvent).toHaveBeenCalledTimes(1);
    expect(sendToEvent).toHaveBeenCalledWith(payload);
  });

  it("should subscribe to RabbitMQ queue", () => {
    mockSubscribe.mockReturnValue(undefined);
    
    const queueName = "test_queue";
    const listener = jest.fn();

    adapters().queue.subscribe(queueName, listener);

    expect(subscribe).toHaveBeenCalledTimes(1); // Checking if subscribe() function is called once
    expect(subscribe).toHaveBeenCalledWith(queueName, listener); // Checking if the correct queue name and listener function are passed to subscribe() function
  });
});
