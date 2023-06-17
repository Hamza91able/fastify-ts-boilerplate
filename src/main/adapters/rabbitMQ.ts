import {
  initRabbitMQ,
  createExchange,
  sendToExchange,
  consume,
} from "../lib/RabbitMQ";
import { logger } from "../lib/logger";

const Exchanges = {
  event: "x-test-event",
};

const RoutingKeys = {
  x_event: "event",
};

const Queues = {
  event: "q-event",
};

export const init = async () => {
  try {
    await initRabbitMQ();

    // Initiate Exhcanges and Queues To Recieve Event Stream
    await createExchange(
      Exchanges.event,
      "direct",
      Queues.event,
      RoutingKeys.x_event,
      undefined
    );
  } catch (err: any) {
    logger.error("Error Initializing RabbitMQ: ", err);
    throw new Error(err);
  }
};

export const sendToEvent = async (payload: Object) => {
  const exchange = Exchanges.event;
  const routing_key = RoutingKeys.x_event;

  await sendToExchange(exchange, routing_key, payload);
};

export const subscribe = (q: string, listener: Function) => {
  consume(q, listener);
};
