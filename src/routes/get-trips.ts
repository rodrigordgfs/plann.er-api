import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

export async function getTrips(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips",
    {
      schema: {
        querystring: z.object({
          user_id: z
            .string({ message: "Parametro userID é necessário" })
            .uuid({ message: "Parametro userID inválido" }),
        }),
      },
    },
    async (request) => {
      const { user_id } = request.query;

      const user = await prisma.user.findUnique({
        where: {
          id: user_id,
        },
      });

      if (!user) {
        throw new ClientError("Usuário não encontrado");
      }

      const trips = await prisma.trip.findMany({
        where: { 
          participants: {
            some: {
              user_id
            }
          }
         },
        select: {
          id: true,
          destination: true,
          starts_at: true,
          ends_at: true,
          participants: {
            select: {
              id: true,
              is_confirmed: true,
              is_owner: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            }
          },
          _count: {
            select: {
              participants: true,
              activities: true,
              links: true,
            },
          },
        },
      });

      return trips;
    }
  );
}
