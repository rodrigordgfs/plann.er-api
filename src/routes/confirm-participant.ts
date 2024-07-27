import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

export async function confirmParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    "/trips/:tripId/participants/:participantId/confirm",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
          participantId: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId, participantId } = request.params;

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
      });

      if (!trip) {
        throw new ClientError("Viagem não encontrada");
      }

      const participant = await prisma.participant.findFirst({
        where: {
          user_id: participantId,
          trip_id: tripId,
        },
      });

      console.log("participant", participant);

      if (!participant) {
        throw new ClientError("Participante não encontrado");
      }

      if (participant?.is_confirmed) {
        throw new ClientError("Participante já confirmado");
      }

      await prisma.participant.update({
        where: {
          id: participant.id,
        },
        data: {
          is_confirmed: true,
        },
      });

      const participants = await prisma.participant.findMany({
        where: {
          trip_id: tripId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image_url: true
            },
          },
        },
      });

      return participants;
    }
  );
}
