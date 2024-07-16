import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-error";

export async function updateActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/trips/:tripId/activities/:activityId",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
          activityId: z.string().uuid(),
        }),
        body: z.object({
          title: z.string().min(4),
          occurs_at: z.coerce.date(),
        }),
      },
    },
    async (request) => {
      const { title, occurs_at } = request.body;
      const { tripId, activityId } = request.params;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new ClientError("Viagem não encontrada");
      }

      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
      });

      if (!activity) {
        throw new ClientError("Atividade não encontrada");
      }

      if (
        dayjs(occurs_at)
          .startOf("day")
          .isBefore(dayjs(trip.starts_at).startOf("day"))
      ) {
        throw new ClientError(
          "A data da atividade deve ser a partir da data de início da viagem."
        );
      }

      if (
        dayjs(occurs_at)
          .startOf("day")
          .isAfter(dayjs(trip.ends_at).startOf("day"))
      ) {
        throw new ClientError(
          "A data da atividade deve ser até a data de término da viagem."
        );
      }

      const updatedActivity = await prisma.activity.update({
        where: {
          id: activityId,
        },
        data: {
          title,
          occurs_at,
        },
      });

      return updatedActivity;
    }
  );
}
