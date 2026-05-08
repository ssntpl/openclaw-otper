import { files } from "@ssntpl/otper-cli";
import { clientFor, json, PluginConfig } from "./shared.ts";

export function fileTools(config: PluginConfig) {
  return [
    {
      name: "otper_attach_file_to_card",
      label: "Otper: attach file to card",
      description:
        "Upload a local file from disk and attach it to a card. Provide the absolute path to the file and the target card id. MIME type is detected from the extension; override with mimeType if needed.",
      parameters: {
        type: "object",
        properties: {
          cardId: { type: "string", description: "Card id to attach the file to." },
          filePath: {
            type: "string",
            description: "Absolute path to the file on the local filesystem.",
          },
          filename: {
            type: "string",
            description:
              "Optional: filename to send to the server. Defaults to the basename of filePath.",
          },
          mimeType: {
            type: "string",
            description:
              "Optional: override the MIME type (e.g. image/png). Detected from extension by default.",
          },
        },
        required: ["cardId", "filePath"],
      },
      execute: async (
        _id: string,
        p: {
          cardId: string;
          filePath: string;
          filename?: string;
          mimeType?: string;
        },
      ) => {
        const client = clientFor(config);
        return json(
          await files.uploadFile(client, {
            cardId: p.cardId,
            filePath: p.filePath,
            filename: p.filename,
            mimeType: p.mimeType,
          }),
        );
      },
    },
    {
      name: "otper_attach_file_to_comment",
      label: "Otper: attach file to comment",
      description:
        "Upload a local file from disk and attach it to a comment. Both the comment id and the parent card id are required (Otper stores the file under the card).",
      parameters: {
        type: "object",
        properties: {
          commentId: { type: "string", description: "Comment id to attach the file to." },
          cardId: {
            type: "string",
            description: "Id of the card the comment belongs to.",
          },
          filePath: {
            type: "string",
            description: "Absolute path to the file on the local filesystem.",
          },
          filename: { type: "string", description: "Optional override filename." },
          mimeType: { type: "string", description: "Optional override MIME type." },
        },
        required: ["commentId", "cardId", "filePath"],
      },
      execute: async (
        _id: string,
        p: {
          commentId: string;
          cardId: string;
          filePath: string;
          filename?: string;
          mimeType?: string;
        },
      ) => {
        const client = clientFor(config);
        return json(
          await files.uploadFile(client, {
            cardId: p.cardId,
            ownerType: "Comment",
            ownerId: p.commentId,
            filePath: p.filePath,
            filename: p.filename,
            mimeType: p.mimeType,
          }),
        );
      },
    },
  ];
}
