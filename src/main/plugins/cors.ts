"use strict";

import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

/**
 * This plugins enables the use of CORS in a Fastify application.
 *
 * @see https://github.com/fastify/fastify-cors
 */
module.exports = fp(async function (fastify: FastifyInstance) {
  fastify.register(require("@fastify/cors"));
});
