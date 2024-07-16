import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-error";

export async function createActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/activities",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          title: z.string().min(4),
          occurs_at: z.coerce.date(),
        }),
      },
    },
    async (request) => {
      const { tripId } = request.params;
      const { title, occurs_at } = request.body;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new ClientError("Viagem não encontrada");
      }

      if (
        dayjs(occurs_at)
          .startOf("day")
          .isBefore(dayjs(trip.starts_at).startOf("day"))
      ) {
        throw new ClientError("A atividade não pode ocorrer antes do início da viagem");
      }

      if (
        dayjs(occurs_at)
          .startOf("day")
          .isAfter(dayjs(trip.ends_at).startOf("day"))
      ) {
        throw new ClientError("A atividade não pode ocorrer após o término da viagem");
      }

      const activity = await prisma.activity.create({
        data: {
          title,
          occurs_at,
          trip_id: tripId,
        },
      });

      return {
        id: activity.id,
        title: activity.title,
        occurs_at: activity.occurs_at,
        trip_id: activity.trip_id,
        is_done: activity.is_done,
      };
    }
  );
}
