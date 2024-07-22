import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../../errors/client-error";
import supabase from "../../lib/supabase";

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

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (authError) {
        throw new ClientError(authError.message);
      }

      if (!authData) {
        throw new ClientError("Erro ao criar usuário");
      }

      return reply.send({
        id: authData.user?.id,
        token: authData.session?.access_token,
      });
    }
  );
}
