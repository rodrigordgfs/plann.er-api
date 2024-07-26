import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-error";

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips",
    {
      schema: {
        body: z.object({
          user_id: z
            .string({ required_error: "User ID is required" })
            .uuid({ message: "User ID must be a valid UUID" }),
          destination: z
            .string({ required_error: "Destination is required" })
            .min(4, {
              message: "Destination must be at least 4 characters long",
            }),
          starts_at: z.coerce.date({
            required_error: "Start date is required",
          }),
          ends_at: z.coerce.date({ required_error: "End date is required" }),
          emails_to_invite: z.array(z.string().email()),
        }),
      },
    },
    async (request, reply) => {
      const { user_id, destination, ends_at, starts_at, emails_to_invite } =
        request.body;

      const user = await prisma.user.findUnique({
        where: { id: user_id },
      });

      if (!user) {
        throw new ClientError("User not found");
      }

      if (dayjs(starts_at).isBefore(dayjs(), "day")) {
        throw new ClientError(
          "A data de início deve ser maior ou igual à data atual."
        );
      }
      if (dayjs(ends_at).isBefore(starts_at)) {
        throw new ClientError(
          "A data de término deve ser maior que a data de início."
        );
      }

      const participants = (
        await Promise.all(
          emails_to_invite.map(async (email) => {
            const invitedUser = await prisma.user.findUnique({
              where: { email },
            });
            if (invitedUser) {
              return {
                user_id: invitedUser.id,
                is_owner: false,
                is_confirmed: false,
              };
            }
          })
        )
      ).filter(Boolean) as Array<{
        user_id: string;
        is_owner: boolean;
        is_confirmed: boolean;
      }>;

      participants.push({
        user_id,
        is_owner: true,
        is_confirmed: true,
      });

      const trip = await prisma.trip.create({
        data: {
          user_id,
          destination,
          starts_at,
          ends_at,
          participants: {
            createMany: {
              data: participants,
            },
          },
        },
      });

      return {
        tripId: trip.id,
      };
    }
  );
}
