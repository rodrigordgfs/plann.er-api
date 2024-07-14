import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { getMailClient } from "./mail";
import nodemailer from "nodemailer";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-error";

export async function updateTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/trips/:tripId",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
        }),
      },
    },
    async (request) => {
      const { destination, ends_at, starts_at } = request.body;
      const { tripId } = request.params;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new ClientError("Trip not found");
      }

      if (dayjs(starts_at).isBefore(dayjs(), 'day')) {
        throw new ClientError(
          "A data de inicio deve ser maior que a data atual."
        );
      }
      if (dayjs(ends_at).isBefore(starts_at)) {
        throw new ClientError(
          "A data de término deve ser maior que a data de inicio."
        );
      }

      const conflictingActivitiesStartsAt = await prisma.activity.findMany({
        where: {
          trip_id: tripId,
          occurs_at: {
            lt: starts_at,
          },
        },
      });

      if (conflictingActivitiesStartsAt.length > 0) {
        throw new ClientError(
          "Existem atividades com a data de ocorrência menor que a data de início da viagem."
        );
      }

      const conflictingActivitiesEndsAT = await prisma.activity.findMany({
        where: {
          trip_id: tripId,
          occurs_at: {
            gt: ends_at,
          },
        },
      });

      if (conflictingActivitiesEndsAT.length > 0) {
        throw new ClientError(
          "Existem atividades com a data de ocorrência maior que a data de termino da viagem."
        );
      }

      const updatedTrip = await prisma.trip.update({
        where: {
          id: tripId,
        },
        data: {
          destination,
          starts_at,
          ends_at,
        },
      });

      return updatedTrip;
    }
  );
}
