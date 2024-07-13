import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import dayjs from "dayjs";
import groupBy from "lodash/groupBy";

export async function getActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId/activities",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (request) => {
      const { tripId } = request.params;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { activities: true },
      });

      if (!trip) {
        throw new Error("Trip not found");
      }

      // Função para gerar todas as datas entre duas datas
      const generateDateRange = (start: string, end: string) => {
        const startDate = dayjs(start);
        const endDate = dayjs(end);
        const dateRange = [];
        let currentDate = startDate;

        while (
          currentDate.isBefore(endDate) ||
          currentDate.isSame(endDate, "day")
        ) {
          dateRange.push(currentDate.format("YYYY-MM-DD"));
          currentDate = currentDate.add(1, "day");
        }

        return dateRange;
      };

      // Gerar todas as datas no intervalo de starts_at a ends_at
      const dateRange = generateDateRange(
        trip.starts_at.toString(),
        trip.ends_at.toString()
      );

      // Agrupar atividades por data
      const groupedActivities = groupBy(trip.activities, (activity) =>
        dayjs(activity.occurs_at).format("YYYY-MM-DD")
      );

      // Preencher os dias sem atividades
      const activitiesByDay = dateRange.reduce((acc, date) => {
        acc[date] = groupedActivities[date] || [];
        return acc;
      }, {} as Record<string, any[]>);

      return {
        activities: activitiesByDay,
      };
    }
  );
}
