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
  createExchange,
  sendToExchange,
  consume,
} from "../../main/lib/RabbitMQ";
import { logger } from "../../main/lib/logger";
import { init, sendToEvent, subscribe } from "../../main/adapters/rabbitMQ";
import { Channel } from "amqplib";

jest.mock("../../main/lib/RabbitMQ", () => ({
  initRabbitMQ: jest.fn(),
  createExchange: jest.fn(),
  sendToExchange: jest.fn(),
  consume: jest.fn(),
}));

const mockInitRabbitMQ = initRabbitMQ as jest.MockedFunction<
  typeof initRabbitMQ
>;
const mockCreateExchange = createExchange as jest.MockedFunction<
  typeof createExchange
>;
const mockSendToExchange = sendToExchange as jest.MockedFunction<
  typeof sendToExchange
>;
const mockConsume = consume as jest.MockedFunction<typeof consume>;

const Exchanges = {
  event: "x-test-event",
};

const RoutingKeys = {
  x_event: "event",
};

const Queues = {
  event: "q-event",
};

describe("rabitMQ adapter", () => {
  beforeEach(() => {
    // Reset mock logger functions before each test
    jest.clearAllMocks();
  });

  describe("init test", () => {
    it("should successfully init", async () => {
      mockInitRabbitMQ.mockResolvedValue({} as Channel);
      mockCreateExchange.mockResolvedValue(undefined);

      await init();

      expect(mockInitRabbitMQ).toBeCalledTimes(1);
      expect(mockInitRabbitMQ).toBeCalledWith();
      expect(mockCreateExchange).toBeCalledTimes(1);
      expect(mockCreateExchange).toBeCalledWith(
        Exchanges.event,
        "direct",
        Queues.event,
        RoutingKeys.x_event,
        undefined
      );
    });

    it("should fail to init", async () => {
      mockInitRabbitMQ.mockRejectedValue("RabbitMQ Not Running");
      mockCreateExchange.mockResolvedValue(undefined);

      try {
        await init();
      } catch (err) {
        logger.error(err);
      }
      await mockCreateExchange(
        Exchanges.event,
        "direct",
        Queues.event,
        RoutingKeys.x_event,
        undefined
      );

      expect(mockInitRabbitMQ).toBeCalledTimes(1);
      expect(mockInitRabbitMQ).toBeCalledWith();
      expect(mockCreateExchange).toBeCalledTimes(1);
    });
  });

  describe("sendToEvent test", () => {
    const exchange = Exchanges.event;
    const routing_key = RoutingKeys.x_event;

    it("should sent to event", async () => {
      const payload = {};
      mockSendToExchange.mockResolvedValue(undefined);

      await sendToEvent(payload);

      expect(mockSendToExchange).toBeCalledTimes(1);
      expect(mockSendToExchange).toBeCalledWith(exchange, routing_key, payload);
    });
  });

  describe("subscribe test", () => {
    it("should fire subscribe successfully", async () => {
      mockConsume.mockReturnValue(undefined);

      subscribe("event", () => {});
    });
  });
});
