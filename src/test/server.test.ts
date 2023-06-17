require("dotenv").config();

import {
  expect,
  jest,
  describe,
  it,
  afterEach,
  beforeAll,
  afterAll,
} from "@jest/globals";
import path from "path";
import AutoLoad from "@fastify/autoload";
import { FastifyInstance } from "fastify";

describe("server", () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = require("fastify")();
    await fastify.register(AutoLoad, {
      dir: path.join(__dirname, "../main/plugins"),
    });
    await fastify.register(AutoLoad, {
      dir: path.join(__dirname, "../main/routes"),
    });
    await fastify.listen({
      port: Number(process.env.PORT),
      host: "0.0.0.0",
    });
  });

  afterAll(async () => {
    await fastify.close();
  });

  it("should start the server without errors", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/",
    });
    expect(response.statusCode).toEqual(404);
  });
});
