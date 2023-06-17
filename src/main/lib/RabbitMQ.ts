import { Channel, connect, Options } from "amqplib";
import { logger } from "./logger";

const { RABBIT_HOST, RABBIT_USER, RABBIT_PASS, RABBIT_PORT } = process.env;

let channel: Channel | null = null;

export const initRabbitMQ = async () => {
  const CONN_URL = `${process.env.RABBIT_TRANSPORT}://${RABBIT_USER}:${RABBIT_PASS}@${RABBIT_HOST}:${RABBIT_PORT}`;
  try {
    const connection = await connect(CONN_URL);
    logger.info(`RabbitMQ Connected On Port: ${RABBIT_PORT}`);
    channel = await connection.createChannel();
    return channel;
  } catch (err) {
    logger.error("Error Initializing RabbitMQ: ", err);
    process.exit(1);
  }
};

export const send = async (q: string, payload: Buffer) => {
  if (!channel) return;

  channel.assertQueue(q, { durable: true });
  channel.sendToQueue(q, payload, {
    persistent: true,
    contentType: "application/json",
  });
};

export const consume = (q: string, cb: Function) => {
  if (!channel) return;

  channel.assertQueue(q, { durable: true });
  channel.prefetch(1);

  channel.consume(
    q,
    (payload) => {
      if (!payload) return;
      cb(channel, payload, JSON.parse(payload.content.toString()));
    },
    { noAck: false }
  );
};

export const close = () => {
  // connection.close();
};

export const createExchange = async (
  exchange: string,
  type: string,
  queue: string,
  routing_key: string,
  options: Options.AssertQueue | undefined
) => {
  if (!channel) return;
  // Create Exchange
  await channel.assertExchange(exchange, type, { durable: true });

  // Create Queue
  await channel.assertQueue(queue, options);

  // Bind Queue to Exchange
  await channel.bindQueue(queue, exchange, routing_key);
};

export const sendToExchange = async (
  exchange: string,
  routing_key: string,
  payload: Object
) => {
  if (!channel) return;

  channel.publish(exchange, routing_key, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
    contentType: "application/json",
  });
};
