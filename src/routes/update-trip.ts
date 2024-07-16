import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
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
        throw new ClientError("Viagem não encontrada");
      }

      if (dayjs(starts_at).isBefore(dayjs(), "day")) {
        throw new ClientError(
          "A data de inicio deve ser maior que a data atual."
        );
      }
      if (dayjs(ends_at).isBefore(starts_at)) {
        throw new ClientError(
          "A data de término deve ser maior que a data de inicio."
        );
      }

      const startsAtISO = dayjs(starts_at).toISOString();
      const endsAtISO = dayjs(ends_at).toISOString();

      const conflictingActivitiesStartsAt = await prisma.activity.findMany({
        where: {
          trip_id: tripId,
          occurs_at: {
            lt: startsAtISO,
          },
          is_done: false,
        },
      });

      if (conflictingActivitiesStartsAt.length > 0) {
        const hasConflictingActivities = conflictingActivitiesStartsAt.some(
          (activity) => {
            return (
              dayjs(activity.occurs_at).isSame(dayjs(starts_at), "day") &&
              dayjs(activity.occurs_at).isBefore(dayjs(starts_at))
            );
          }
        );

        if (hasConflictingActivities) {
          throw new ClientError(
            "Existem atividades com a data de ocorrência menor que a data de início da viagem."
          );
        }
      }

      const conflictingActivitiesEndsAT = await prisma.activity.findMany({
        where: {
          trip_id: tripId,
          occurs_at: {
            gt: endsAtISO,
          },
          is_done: false,
        },
      });

      if (conflictingActivitiesEndsAT.length > 0) {
        throw new ClientError(
          "Existem atividades com a data de ocorrência maior que a data de término da viagem."
        );
      }

      const updatedTrip = await prisma.trip.update({
        where: {
          id: tripId,
        },
        data: {
          destination,
          starts_at: new Date(startsAtISO),
          ends_at: new Date(endsAtISO),
        },
      });

      return updatedTrip;
    }
  );
}
