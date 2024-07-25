import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

export async function removeTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/trips/:tripId/participant/:userId",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
          userId: z.string().uuid(),
        }),
      },
    },
    async (request) => {
      const { tripId, userId } = request.params;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new ClientError("Viagem não encontrada");
      }

      const participants = await prisma.participant.findMany({
        where: {
          trip_id: tripId,
          is_confirmed: true,
          NOT: {
            user_id: userId,
          },
        },
      });

      if (participants.length > 0) {
        throw new ClientError(
          "Não é possível remover uma viagem com participantes confirmados"
        );
      }

      await prisma.trip.delete({
        where: {
          id: tripId,
        },
      });

      return {
        message: "Viagem removida com sucesso",
      };
    }
  );
}
