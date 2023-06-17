import {
  expect,
  jest,
  describe,
  beforeEach,
  afterEach,
  it,
} from "@jest/globals";
import { createClient } from "redis";
import { redis } from "../../main/adapters/redis";
import { logger } from "../../main/lib/logger";

jest.mock("../../main/lib/logger", () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("redis", () => ({
  createClient: jest.fn(),
}));

const mockLogError = logger.error as jest.MockedFunction<typeof logger.error>;
const mockLogInfo = logger.info as jest.MockedFunction<typeof logger.info>;
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe("redis adapter", () => {
  beforeEach(() => {
    // Reset mock logger functions before each test
    mockLogError.mockClear();
    mockLogInfo.mockClear();
  });

  it("should create and connect Redis client with correct configuration", async () => {
    process.env.REDIS_HOST = "localhost";
    process.env.REDIS_PORT = "6379";
    process.env.REDIS_PASSWORD = "password";

    mockLogInfo.mockReturnValue(
      `Redis Client Connected on Port ${process.env.REDIS_PORT}` as any
    );

    const mockClient = {
      on: jest.fn((event: string, handler: Function) => {
        if (event === "connect") {
          // Call the handler function immediately
          handler();
        }
      }),
      connect: jest.fn(),
    };

    mockCreateClient.mockReturnValue(mockClient as any);

    const client = await redis();

    expect(mockCreateClient).toHaveBeenCalledWith({
      socket: {
        host: "localhost",
        port: 6379,
      },
      password: "password",
    });

    expect(mockClient.on).toHaveBeenCalledWith("error", expect.any(Function));
    expect(mockClient.on).toHaveBeenCalledWith("connect", expect.any(Function));

    expect(mockLogInfo).toHaveBeenCalledWith(
      `Redis Client Connected on Port ${process.env.REDIS_PORT}`
    );

    // Assert that client.connect was called
    expect(mockClient.connect).toHaveBeenCalled();

    // Assert that the returned client is the same as the mocked client
    expect(client).toBe(mockClient);
  });

  it("should create and connect Redis client with correct configuration", async () => {
    process.env.REDIS_HOST = "localhost";
    process.env.REDIS_PORT = "6379";
    process.env.REDIS_PASSWORD = "password";
    process.exit = jest.fn() as never;

    mockLogError.mockReturnValue("Redis Client Error" as any);

    const mockClient = {
      on: jest.fn((event: string, handler: Function) => {
        if (event === "error") {
          // Call the handler function immediately
          handler();
        }
      }),
      connect: jest.fn(),
    };

    mockCreateClient.mockReturnValue(mockClient as any);

    await redis();

    expect(mockCreateClient).toHaveBeenCalledWith({
      socket: {
        host: "localhost",
        port: 6379,
      },
      password: "password",
    });

    expect(mockClient.on).toHaveBeenCalledWith("error", expect.any(Function));
    expect(mockClient.on).toHaveBeenCalledWith("connect", expect.any(Function));

    // Assert that process.exit was called with code 1
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
