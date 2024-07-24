import { FastifyInstance } from "fastify";
import { ClientError } from "../errors/client-error";
import { ZodError } from "zod";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof ClientError) {
    return reply.status(400).send({ message: error.message });
  }
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Entrada inválida",
      errors: error.flatten().fieldErrors,
    });
  }

  console.log(error);
  
  return reply.status(500).send({ message: error.message });
};
