import { FastifyInstance } from "fastify";
import {
  createNoteHandler,
  getNotesHandler,
} from "../../../../controllers/note";
import {
  createNoteValidationSchema,
  getNotesValidationSchema,
} from "../../../../dto/request/note";

module.exports = async function (fastify: FastifyInstance) {
  fastify.route({
    method: "GET",
    url: "/",
    schema: {
      querystring: getNotesValidationSchema,
    },
    validatorCompiler: ({ schema }: any) => {
      return (data) => schema.validate(data);
    },
    handler: getNotesHandler,
  });

  fastify.route({
    method: "POST",
    url: "/",
    schema: {
      body: createNoteValidationSchema,
    },
    validatorCompiler: ({ schema }: any) => {
      return (data) => schema.validate(data);
    },
    handler: createNoteHandler,
  });
};
