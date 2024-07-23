import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../../errors/client-error";
import supabase from "../../lib/supabase";

export async function signIn(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/sign-in",
    {
      schema: {
        body: z.object({
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
      const { email, password } = request.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === 'Email not confirmed') {
          throw new ClientError("Por favor, verifique seu email antes de fazer login.");
        } else {
          throw new ClientError("Email ou senha inválidos");
        }
      }

      if (!data.user || !data.session) {
        throw new ClientError("Email ou senha inválidos");
      }

      return reply.send({
        id: data.user.id,
        token: data.session.access_token,
        expires_at: data.session.expires_at
      });
    }
  );
}
