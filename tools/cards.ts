import { cards, lists } from "@ssntpl/otper-cli";

type UpdateCardInput = Parameters<typeof cards.updateCard>[1];
import { clientFor, json, PluginConfig, text } from "./shared.ts";

export function cardTools(config: PluginConfig) {
  return [
    {
      name: "otper_list_cards",
      label: "Otper: list cards in a list",
      description:
        "Return cards in a list (paginated, 25 per page). Same search syntax as the Otper UI: free text, 'labels:bug;assignee:alice', 'due date:overdue', or '#KEY123' for a card-number lookup.",
      parameters: {
        type: "object",
        properties: {
          listId: { type: "string", description: "The list id." },
          page: { type: "integer", default: 1 },
          search: { type: "string", description: "Optional filter expression." },
        },
        required: ["listId"],
      },
      execute: async (
        _id: string,
        p: { listId: string; page?: number; search?: string },
      ) => {
        const client = clientFor(config);
        const list = await lists.getListWithCards(
          client,
          p.listId,
          p.page ?? 1,
          p.search,
        );
        if (!list) return text(`List ${p.listId} not found.`);
        return json({ cards: list.cards });
      },
    },
    {
      name: "otper_show_card",
      label: "Otper: show card",
      description:
        "Return a single card by id, including title, description, list, board, due date, labels, and assignees.",
      parameters: {
        type: "object",
        properties: {
          cardId: { type: "string", description: "The card id." },
        },
        required: ["cardId"],
      },
      execute: async (_id: string, p: { cardId: string }) => {
        const client = clientFor(config);
        const card = await cards.getCard(client, p.cardId);
        if (!card) return text(`Card ${p.cardId} not found.`);
        return json(card);
      },
    },
    {
      name: "otper_show_card_by_slug",
      label: "Otper: show card by slug",
      description: "Return a single card by its slug (e.g. from a card URL).",
      parameters: {
        type: "object",
        properties: {
          slug: { type: "string", description: "The card slug." },
        },
        required: ["slug"],
      },
      execute: async (_id: string, p: { slug: string }) => {
        const client = clientFor(config);
        const card = await cards.getCardBySlug(client, p.slug);
        if (!card) return text(`Card with slug ${p.slug} not found.`);
        return json(card);
      },
    },
    {
      name: "otper_create_card",
      label: "Otper: create card",
      description: "Create a new card in a given list.",
      parameters: {
        type: "object",
        properties: {
          listId: { type: "string", description: "The list to create the card in." },
          title: { type: "string", description: "Card title (max 1024 chars)." },
          description: { type: "string", description: "Card description.", default: "" },
        },
        required: ["listId", "title"],
      },
      execute: async (
        _id: string,
        p: { listId: string; title: string; description?: string },
      ) => {
        const client = clientFor(config);
        return json(
          await cards.createCard(client, {
            title: p.title,
            description: p.description ?? "",
            list: { connect: p.listId },
          }),
        );
      },
    },
    {
      name: "otper_update_card",
      label: "Otper: update card",
      description:
        "Update one or more fields on a card: title, description, due date, start time, mark due-date complete.",
      parameters: {
        type: "object",
        properties: {
          cardId: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          dueDate: {
            type: "string",
            description:
              "ISO datetime (YYYY-MM-DD HH:MM:SS) or 'null' to clear.",
          },
          startTime: {
            type: "string",
            description: "ISO datetime or 'null' to clear.",
          },
          isDueDateComplete: { type: "boolean" },
        },
        required: ["cardId"],
      },
      execute: async (
        _id: string,
        p: {
          cardId: string;
          title?: string;
          description?: string;
          dueDate?: string;
          startTime?: string;
          isDueDateComplete?: boolean;
        },
      ) => {
        const client = clientFor(config);
        const input: UpdateCardInput = { id: p.cardId };
        if (p.title !== undefined) input.title = p.title;
        if (p.description !== undefined) input.description = p.description;
        if (p.dueDate !== undefined)
          input.due_date = p.dueDate === "null" ? null : p.dueDate;
        if (p.startTime !== undefined)
          input.start_time = p.startTime === "null" ? null : p.startTime;
        if (p.isDueDateComplete !== undefined)
          input.is_due_date_complete = p.isDueDateComplete;
        return json(await cards.updateCard(client, input));
      },
    },
    {
      name: "otper_move_card",
      label: "Otper: move card to another list",
      description:
        "Move a card to a different list, optionally placing it above a specific card in the destination list.",
      parameters: {
        type: "object",
        properties: {
          cardId: { type: "string", description: "Card to move." },
          toListId: { type: "string", description: "Destination list id." },
          overCardId: {
            type: "string",
            description: "Optional id of the card to place this card above.",
          },
        },
        required: ["cardId", "toListId"],
      },
      execute: async (
        _id: string,
        p: { cardId: string; toListId: string; overCardId?: string },
      ) => {
        const client = clientFor(config);
        return json(
          await cards.moveCard(client, p.cardId, p.toListId, p.overCardId),
        );
      },
    },
    {
      name: "otper_archive_card",
      label: "Otper: archive or unarchive a card",
      description:
        "Archive a card (soft-hide from boards) or unarchive a previously archived card. Archive is reversible — prefer this over deletion.",
      parameters: {
        type: "object",
        properties: {
          cardId: { type: "string" },
          unarchive: {
            type: "boolean",
            description: "Set true to unarchive instead of archive.",
            default: false,
          },
          reason: {
            type: "string",
            description: "Optional close reason, recorded when archiving.",
          },
        },
        required: ["cardId"],
      },
      execute: async (
        _id: string,
        p: { cardId: string; unarchive?: boolean; reason?: string },
      ) => {
        const client = clientFor(config);
        return json(
          p.unarchive
            ? await cards.reopenCard(client, p.cardId)
            : await cards.closeCard(client, p.cardId, p.reason),
        );
      },
    },
    {
      name: "otper_assign_card",
      label: "Otper: assign users to card",
      description: "Assign one or more users to a card (does not unassign existing).",
      parameters: {
        type: "object",
        properties: {
          cardId: { type: "string" },
          userIds: {
            type: "array",
            items: { type: "string" },
            description: "Otper user ids to assign.",
          },
        },
        required: ["cardId", "userIds"],
      },
      execute: async (
        _id: string,
        p: { cardId: string; userIds: string[] },
      ) => {
        const client = clientFor(config);
        // The API takes one user per call; the last response carries the final assignee list.
        let card;
        for (const userId of p.userIds) card = await cards.assignCardMember(client, p.cardId, userId);
        return json(card);
      },
    },
    {
      name: "otper_unassign_card",
      label: "Otper: unassign users from card",
      description: "Remove one or more users from a card.",
      parameters: {
        type: "object",
        properties: {
          cardId: { type: "string" },
          userIds: { type: "array", items: { type: "string" } },
        },
        required: ["cardId", "userIds"],
      },
      execute: async (
        _id: string,
        p: { cardId: string; userIds: string[] },
      ) => {
        const client = clientFor(config);
        let card;
        for (const userId of p.userIds) card = await cards.unassignCardMember(client, p.cardId, userId);
        return json(card);
      },
    },
    {
      name: "otper_label_card",
      label: "Otper: attach labels to card",
      description: "Attach one or more labels to a card.",
      parameters: {
        type: "object",
        properties: {
          cardId: { type: "string" },
          labelIds: { type: "array", items: { type: "string" } },
        },
        required: ["cardId", "labelIds"],
      },
      execute: async (
        _id: string,
        p: { cardId: string; labelIds: string[] },
      ) => {
        const client = clientFor(config);
        return json(
          await cards.updateCard(client, {
            id: p.cardId,
            labels: { connect: p.labelIds },
          }),
        );
      },
    },
    {
      name: "otper_unlabel_card",
      label: "Otper: detach labels from card",
      description: "Detach one or more labels from a card.",
      parameters: {
        type: "object",
        properties: {
          cardId: { type: "string" },
          labelIds: { type: "array", items: { type: "string" } },
        },
        required: ["cardId", "labelIds"],
      },
      execute: async (
        _id: string,
        p: { cardId: string; labelIds: string[] },
      ) => {
        const client = clientFor(config);
        return json(
          await cards.updateCard(client, {
            id: p.cardId,
            labels: { disconnect: p.labelIds },
          }),
        );
      },
    },
  ];
}
