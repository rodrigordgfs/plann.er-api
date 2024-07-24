import fastify from "fastify";
import cors from "@fastify/cors";
import { createTrip } from "./routes/create-trip";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { confirmTrip } from "./routes/confirm-trip";
import { confirmParticipant } from "./routes/confirm-participant";
import { createActivity } from "./routes/create-activity";
import { getActivity } from "./routes/get-activities";
import { createLink } from "./routes/create-link";
import { getLinks } from "./routes/get-links";
import { getParticipants } from "./routes/get-participants";
import { createInvite } from "./routes/create-invite";
import { updateTrip } from "./routes/update-trip";
import { getTripDetails } from "./routes/get-trip-details";
import { getParticipant } from "./routes/get-participant";
import { errorHandler } from "./utils/error-handler";
import { env } from "./env";
import { removeParticipant } from "./routes/remove-participant";
import { toggleDoneActivity } from "./routes/toggle-done-activity";
import { updateActivity } from "./routes/update-activity";
import { signIn } from "./routes/auth/sign-in";
import { signUp } from "./routes/auth/sign-up";
import authMiddleware from "./middleware/auth";
import { getTrips } from "./routes/get-trips";

const app = fastify();

app.register(cors, {
  origin: "*",
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.setErrorHandler(errorHandler);

app.register(authMiddleware);

app.register(signIn);
app.register(signUp);
app.register(createTrip);
app.register(getTrips);
app.register(confirmTrip);
app.register(confirmParticipant);
app.register(createActivity);
app.register(getActivity);
app.register(createLink);
app.register(getLinks);
app.register(getParticipants);
app.register(createInvite);
app.register(updateTrip);
app.register(getTripDetails);
app.register(getParticipant);
app.register(removeParticipant);
app.register(toggleDoneActivity);
app.register(updateActivity);

const port = env.PORT || 4000;

app.listen({ port, host: "0.0.0.0" }).then(() => {
  console.log(`listening on port ${port}`);
});
