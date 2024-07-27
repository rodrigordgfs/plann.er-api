import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function getUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/users/:userId",
    {
      schema: {
        params: z.object({
          userId: z.string().uuid(),
        }),
      },
    },
    async (request) => {
      const { userId } = request.params;

      const users = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!users) {
        throw new Error("Usuário não encontrado");
      }

      return users;
    }
  );
}
