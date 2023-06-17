"use strict";

import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";


/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
module.exports = fp(async function (fastify: FastifyInstance) {
  fastify.register(require("@fastify/helmet"), {
    crossOriginResourcePolicy: false,
  });
});
