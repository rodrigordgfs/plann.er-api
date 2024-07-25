import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import nodemailer from "nodemailer";
import { ClientError } from "../errors/client-error";
import { env } from "../env";

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/invites",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          email: z.string().email(),
        }),
      },
    },
    async (request) => {
      const { tripId } = request.params;
      const { email } = request.body;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new ClientError("Viagem não encontrada");
      }

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new ClientError("Usuário não cadastrado na plataforma");
      }

      const participantExists = await prisma.participant.findFirst({
        where: {
          user_id: user.id,
          trip_id: tripId,
        },
      });

      if (participantExists) {
        throw new ClientError("Participante já convidado para esta viagem");
      }

      await prisma.participant.create({
        data: {
          user_id: user.id,
          trip_id: tripId,
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
            },
          },
        },
      });

      return participants;
    }
  );
}
