import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-error";

export async function toggleDoneActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    "/trips/:tripId/activities/:activityId/toggle",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
          activityId: z.string().uuid(),
        }),
        body: z.object({
          is_done: z.boolean(),
        }),
      },
    },
    async (request) => {
      const { tripId, activityId } = request.params;
      const { is_done } = request.body;

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

      await prisma.activity.update({
        where: { id: activityId },
        data: {
          is_done,
        },
      });

      return { message: "Atividade atualizada" };
    }
  );
}
