import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../../errors/client-error";
import supabase from "../../lib/supabase";
import { prisma } from "../../lib/prisma";

export async function signUp(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/sign-up",
    {
      schema: {
        body: z.object({
          name: z
            .string({ message: "Campo nome é necessário" })
            .min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
          email: z
            .string({ message: "Campo email é necessário" })
            .email({ message: "Email inválido" }),
          password: z
            .string({ message: "Campo password é necessário" })
            .min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
        }),
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body;

      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        throw new ClientError(error.message);
      }

      if (!data || !data.user) {
        throw new ClientError("Erro ao criar usuário");
      }

      try {
        const userId = data.user.id;

        await prisma.user.create({
          data: {
            id: userId,
            name,
            email,
          },
        });

        return reply.send({
          id: userId,
          message:
            "Usuário criado com sucesso. Por favor, confirme seu e-mail!",
        });
      } catch (err) {
        await supabase.auth.admin.deleteUser(data.user.id);
        throw new ClientError("Erro ao criar usuário na tabela local");
      }
    }
  );
}
