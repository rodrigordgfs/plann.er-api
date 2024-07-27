import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error";
import supabase from "../lib/supabase";

export async function updateUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/users/:userId",
    {
      schema: {
        params: z.object({
          userId: z.string().uuid(),
        }),
        body: z.object({
          name: z.string().min(4),
          image: z.string().optional(),
        }),
      },
    },
    async (request) => {
      const { name, image } = request.body;
      const { userId } = request.params;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new ClientError("Usuário não encontrado");
      }

      let imageUrl = user.image_url;

      if (image) {
        const fileName = `${userId}.png`;

        const { data: existingImage, error: getImageError } =
          await supabase.storage.from("images").download(fileName);

        if (existingImage) {
          const { error: deleteError } = await supabase.storage
            .from("images")
            .remove([fileName]);

          if (deleteError) {
            throw new ClientError(
              "Erro ao excluir a imagem existente: " + deleteError.message
            );
          }
        }

        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");

        const { data, error: uploadError } = await supabase.storage
          .from("images")
          .upload(fileName, imageBuffer, {
            contentType: "image/png",
          });

        if (uploadError) {
          throw new ClientError(
            "Erro ao fazer upload da imagem: " + uploadError.message
          );
        }

        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from("images")
            .createSignedUrl(fileName, 60 * 60 * 24);

        if (signedUrlError) {
          throw new ClientError(
            "Erro ao gerar URL assinada: " + signedUrlError.message
          );
        }

        imageUrl = signedUrlData.signedUrl;
      }

      const updatedUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name,
          image_url: imageUrl,
        },
      });

      return updatedUser;
    }
  );
}
