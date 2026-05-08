/**
 * @ssntpl/openclaw-otper — OpenClaw plugin that exposes Otper boards
 * (https://otper.com) as agent tools.
 *
 * Wraps the @ssntpl/otper-cli library so each Otper resource is callable
 * as a discrete tool. Configure with `OTPER_TOKEN` (env) or the plugin's
 * `token` config field; optionally `OTPER_BASE_URL` / `baseUrl` for
 * self-hosted Otper instances.
 */

import { boardTools } from "./tools/boards.ts";
import { cardTools } from "./tools/cards.ts";
import { commentTools } from "./tools/comments.ts";
import { fileTools } from "./tools/files.ts";
import { labelTools } from "./tools/labels.ts";
import { listTools } from "./tools/lists.ts";
import { meTools } from "./tools/me.ts";
import { priorityTools } from "./tools/priorities.ts";
import { PluginConfig } from "./tools/shared.ts";
import { teamTools } from "./tools/teams.ts";

const otperPlugin = {
  id: "openclaw-otper",
  name: "Otper",
  description:
    "Read and act on Otper boards, lists, cards, labels, and comments.",
  register(api: any, ctx?: { config?: PluginConfig }) {
    const config: PluginConfig =
      ctx?.config ?? (api?.config as PluginConfig | undefined) ?? {};
    const all = [
      ...meTools(config),
      ...boardTools(config),
      ...listTools(config),
      ...cardTools(config),
      ...commentTools(config),
      ...fileTools(config),
      ...labelTools(config),
      ...teamTools(config),
      ...priorityTools(config),
    ];
    for (const tool of all) {
      api.registerTool(tool as any);
    }
  },
};

export default otperPlugin;
