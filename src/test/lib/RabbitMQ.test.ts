import {
  expect,
  jest,
  describe,
  beforeEach,
  afterEach,
  it,
} from "@jest/globals";

import {
  initRabbitMQ,
  send,
  consume,
  close,
  createExchange,
  sendToExchange,
} from "../../main/lib/RabbitMQ";
import { connect, Channel, Connection, Replies, ConsumeMessage } from "amqplib";
import { logger } from "../../main/lib/logger";

jest.mock("../../main/lib/logger", () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("amqplib");

const mockConnect = connect as jest.MockedFunction<typeof connect>;

describe("RabbitMQ Functions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initRabbitMQ test", () => {
    let channel: Channel = {} as Channel;
    it("should successfully create a connection", async () => {
      mockConnect.mockResolvedValue({
        createChannel: jest.fn().mockResolvedValue({} as never),
      } as unknown as Connection);

      channel = await initRabbitMQ();

      expect(channel).toStrictEqual({});
      expect(mockConnect).toBeCalledTimes(1);
    });

    it("should fail to create a connection", async () => {
      process.exit = jest.fn() as never;
      mockConnect.mockResolvedValue({
        createChannel: jest
          .fn()
          .mockRejectedValue("Unable To Connect" as never),
      } as unknown as Connection);

      try {
        await initRabbitMQ();
      } catch (err) {
        logger.error(err);
      }

      expect(mockConnect).toBeCalledTimes(1);
    });
  });

  describe("send test", () => {
    it("should send a message to a queue", async () => {
      mockConnect.mockResolvedValue({
        createChannel: jest.fn().mockResolvedValue({} as never),
      } as unknown as Connection);

      const channel = await initRabbitMQ();
      channel.assertQueue = jest.fn() as any;
      channel.sendToQueue = jest.fn() as any;

      const q = "test-queue";
      const payload = Buffer.from("test-payload");

      await send(q, payload);

      expect(channel.assertQueue).toHaveBeenCalledWith(q, {
        durable: true,
      });
      expect(channel.sendToQueue).toHaveBeenCalledWith(q, payload, {
        persistent: true,
        contentType: "application/json",
      });
    });

    it("should return because of no channel", async () => {
      mockConnect.mockResolvedValue({
        createChannel: jest.fn().mockReturnValue(null as never),
      } as unknown as Connection);

      await initRabbitMQ();

      const q = "test-queue";
      const payload = Buffer.from("test-payload");

      await send(q, payload);
    });
  });

  describe("consume test", () => {
    it("should consume a message successfully", async () => {
      mockConnect.mockResolvedValue({
        createChannel: jest.fn().mockResolvedValue({} as never),
      } as unknown as Connection);

      const channel = await initRabbitMQ();
      channel.assertQueue = jest.fn() as any;
      channel.prefetch = jest.fn() as any;
      channel.consume = jest.fn() as any;

      const q = "test-queue";
      const cb = jest.fn();
      const payload = {
        content: Buffer.from(JSON.stringify({ key: "value" })),
      } as any;

      consume(q, cb);

      jest
        .spyOn(channel, "consume")
        .mockImplementation((queue, onMessage, options) => {
          onMessage(payload);
          return Promise.resolve(channel) as any;
        });

      const consumeCallback: any = (channel.consume as jest.Mock).mock
        .calls[0][1];
      consumeCallback(payload);

      expect(channel.assertQueue).toBeCalledWith(q, { durable: true });
      expect(channel.prefetch).toBeCalledWith(1);
      expect(cb).toBeCalledWith(channel, payload, { key: "value" });
    });

    it("should fail to consume a message due to bad channel", async () => {
      mockConnect.mockResolvedValue({
        createChannel: jest.fn().mockReturnValue(null as never),
      } as unknown as Connection);

      const channel = await initRabbitMQ();

      const q = "test-queue";
      const cb = jest.fn();
      const payload = {
        content: Buffer.from(JSON.stringify({ key: "value" })),
      } as any;

      const consumed = consume(q, cb);

      expect(consumed).toBe(undefined);
    });

    it("should fail to consume a message due to no payload", async () => {
      mockConnect.mockResolvedValue({
        createChannel: jest.fn().mockResolvedValue({} as never),
      } as unknown as Connection);

      const channel = await initRabbitMQ();
      channel.assertQueue = jest.fn() as any;
      channel.prefetch = jest.fn() as any;
      channel.consume = jest.fn() as any;

      const q = "test-queue";
      const cb = jest.fn();
      const payload = null;

      consume(q, cb);

      jest
        .spyOn(channel, "consume")
        .mockImplementation((queue, onMessage, options) => {
          onMessage(payload);
          return Promise.resolve(channel) as any;
        });

      const consumeCallback: any = (channel.consume as jest.Mock).mock
        .calls[0][1];
      consumeCallback(payload);

      expect(channel.assertQueue).toBeCalledWith(q, { durable: true });
      expect(channel.prefetch).toBeCalledWith(1);
      expect(cb).toBeCalledTimes(0);
    });
  });

  describe("close test", () => {
    it("should do nothing with close", () => {
      close();
    });
  });

  describe("createExchange test", () => {
    it("should create exchange successfully", async () => {
      mockConnect.mockResolvedValue({
        createChannel: jest.fn().mockResolvedValue({} as never),
      } as unknown as Connection);

      const channel = await initRabbitMQ();
      channel.assertExchange = jest.fn() as any;
      channel.assertQueue = jest.fn() as any;
      channel.bindQueue = jest.fn() as any;

      const exchange = "test_exchange";
      const type = "direct";
      const queue = "test_queue";
      const routingKey = "test_routing_key";
      const mockOptions = {
        durable: true,
      };

      await createExchange(exchange, type, queue, routingKey, mockOptions);

      expect(channel.assertExchange).toHaveBeenCalledWith(exchange, type, {
        durable: true,
      });

      // Assert that assertQueue is called with the correct arguments
      expect(channel.assertQueue).toHaveBeenCalledWith(queue, mockOptions);

      // Assert that bindQueue is called with the correct arguments
      expect(channel.bindQueue).toHaveBeenCalledWith(
        queue,
        exchange,
        routingKey
      );
    });

    it("should fail to create exchange due to bad channel", async () => {
      mockConnect.mockResolvedValue({
        createChannel: jest.fn().mockReturnValue(null as never),
      } as unknown as Connection);

      const channel = await initRabbitMQ();

      const exchange = "test_exchange";
      const type = "direct";
      const queue = "test_queue";
      const routingKey = "test_routing_key";
      const mockOptions = {
        durable: true,
      };

      const exchanged = await createExchange(
        exchange,
        type,
        queue,
        routingKey,
        mockOptions
      );

      expect(exchanged).toBe(undefined);
    });
  });

  describe("sendToExchange test", () => {
    it("should send to exchange successfully", async () => {
      mockConnect.mockResolvedValue({
        createChannel: jest.fn().mockResolvedValue({} as never),
      } as unknown as Connection);

      const channel = await initRabbitMQ();
      channel.publish = jest.fn() as any;

      const exchange = "test_exchange";
      const routing_key = "test_routing_key";
      const payload = { key: "value" };

      await sendToExchange(exchange, routing_key, payload);

      expect(channel.publish).toBeCalledWith(
        exchange,
        routing_key,
        expect.any(Buffer), // Assert that a Buffer is passed as payload
        {
          persistent: true,
          contentType: "application/json",
        }
      );
    });

    it("should fail to send to exchange due to bad channel", async () => {
      mockConnect.mockResolvedValue({
        createChannel: jest.fn().mockResolvedValue(null as never),
      } as unknown as Connection);

      const channel = await initRabbitMQ();

      const exchange = "test_exchange";
      const routing_key = "test_routing_key";
      const payload = { key: "value" };

      const sent = await sendToExchange(exchange, routing_key, payload);

      expect(sent).toBe(undefined);
    });
  });
});
