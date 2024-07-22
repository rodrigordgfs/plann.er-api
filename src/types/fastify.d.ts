import 'fastify';
import { User } from '@supabase/supabase-js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
