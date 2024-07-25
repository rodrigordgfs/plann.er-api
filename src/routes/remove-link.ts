import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

export async function removeLink(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/trips/:tripId/links/:linkId",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
          linkId: z.string().uuid(),
        }),
      },
    },
    async (request) => {
      const { tripId, linkId } = request.params;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new ClientError("Viagem não encontrada");
      }

      const link = await prisma.link.findUnique({
        where: {
          id: linkId,
        },
      });

      if (!link) {
        throw new ClientError("Link não encontrado");
      }

      await prisma.link.delete({
        where: {
          id: linkId,
        },
      });

      const links = await prisma.link.findMany({
        where: {
          trip_id: tripId,
        },
      });

      return links;
    }
  );
}
