import { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import supabase from "../lib/supabase";
import { User } from "@supabase/supabase-js";

declare module "fastify" {
  interface FastifyRequest {
    user?: User;
  }
}

const authMiddleware: FastifyPluginAsync = async (app) => {
  app.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        reply.code(401).send({ message: "Missing authorization header" });
        return;
      }

      const token = authHeader.split(" ")[1];

      if (!token || token.split('.').length !== 3) {
        reply.code(401).send({ message: "Malformed or missing token" });
        return;
      }

      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        reply.code(401).send({ message: "Invalid or expired token" });
        return;
      }

      request.user = data.user;
    }
  );

  app.addHook("onRequest", async (request, reply) => {
    const excludedRoutes = ["/sign-up", "/sign-in"];
    if (!excludedRoutes.includes(request.routerPath)) {
      await app.authenticate(request, reply);
    }
  });
};

export default fp(authMiddleware);
