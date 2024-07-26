import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function getUsers(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/users",
    {
      schema: {
        querystring: z.object({
          email: z.string().email().optional(),
        }),
      },
    },
    async (request) => {
      const { email } = request.query;

      const users = await prisma.user.findMany({
        where: { email },
      });

      return users;
    }
  );
}
