import { expect, jest, describe, it, afterEach } from "@jest/globals";
import { adapters } from "../../main/adapters";

import redisService from "../../main/services/redis";

type RedisClientFunction = (...args: any[]) => any;

type MockedAdaptersFunction = jest.Mock<RedisClientFunction>;

jest.mock("../../main/adapters/index", () => {
  // Return an object with the expected structure
  return {
    adapters: jest.fn().mockReturnValue({
      cache: {
        primary: {
          getPrimary: jest.fn(),
        },
      },
      // Add any other properties/methods you need to mock
    }) as unknown as MockedAdaptersFunction, // Use type assertion to cast to expected type
  };
});

const mockedAdapters = adapters().cache.primary
  .getPrimary as unknown as MockedAdaptersFunction;

describe("Redis Service Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getRedisClient Service", () => {
    it("should get redis client successfully", () => {
      mockedAdapters.mockReturnValue({});

      const client = redisService.getRedisClient();

      expect(client).toStrictEqual({});
    });
  });

  describe("setInRedis Service", () => {
    it("should set in redis", async () => {
      const mockGetRedisClient = jest
        .spyOn(redisService, "getRedisClient")
        .mockReturnValue({
          set: jest.fn().mockReturnValue({
            test: "value",
          }),
        } as any);

      const set = await redisService.setInRedis("test", "value");

      expect(mockGetRedisClient).toBeCalledTimes(1);
      expect(set).toStrictEqual({
        test: "value",
      });
    });
  });

  describe("getFromRedis Service", () => {
    it("should get from redis", async () => {
      const mockGetRedisClient = jest
        .spyOn(redisService, "getRedisClient")
        .mockReturnValue({
          get: jest.fn().mockReturnValue({
            test: "value",
          }),
        } as any);

      const set = await redisService.getFromRedis("test");

      expect(mockGetRedisClient).toBeCalledTimes(1);
      expect(set).toStrictEqual({
        test: "value",
      });
    });
  });

  describe("deleteInRedis Service", () => {
    it("should delete from redis", async () => {
      const mockGetRedisClient = jest
        .spyOn(redisService, "getRedisClient")
        .mockReturnValue({
          del: jest.fn().mockReturnValue({
            test: "value",
          }),
        } as any);

      const set = await redisService.deleteInRedis("test");

      expect(mockGetRedisClient).toBeCalledTimes(1);
      expect(set).toStrictEqual({
        test: "value",
      });
    });
  });
});
