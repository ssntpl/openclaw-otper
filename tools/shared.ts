import { OtperClient, resolveConfig } from "@ssntpl/otper-cli";

export interface PluginConfig {
  token?: string;
  baseUrl?: string;
}

/**
 * Build an OtperClient using otper-cli's standard resolution chain:
 *   1. Plugin config (token / baseUrl from openclaw plugin settings)
 *   2. Environment vars (OTPER_TOKEN / OTPER_BASE_URL)
 *   3. otper-cli's saved credentials at ~/.otper-cli/<profile>/config.json
 *      (created by `otper auth:login`)
 *
 * Sharing the resolution with otper-cli means a single login serves
 * both the CLI and this plugin.
 */
export function clientFor(config: PluginConfig | undefined): OtperClient {
  try {
    const cfg = resolveConfig({
      token: config?.token,
      baseUrl: config?.baseUrl,
    });
    return OtperClient.fromConfig(cfg);
  } catch {
    throw new Error(
      "Otper is not configured. Provide a token via the openclaw plugin " +
        "config, the OTPER_TOKEN environment variable, or by running " +
        "`otper auth:login` to save credentials at " +
        "~/.otper-cli/<profile>/config.json. Generate a personal access " +
        "token at https://otper.com/settings/tokens.",
    );
  }
}

export type TextContent = { type: "text"; text: string };
export type ToolResult = { content: TextContent[] };

/** Wrap a string in the openclaw tool result envelope. */
export function text(s: string): ToolResult {
  return { content: [{ type: "text", text: s }] };
}

/** Render any value as JSON-in-a-tool-result for the LLM to parse. */
export function json(value: unknown): ToolResult {
  return text(JSON.stringify(value, null, 2));
}

/** Format ISO date-times into a compact, locale-neutral form for the LLM. */
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return iso.replace("T", " ").replace(/\.\d+Z?$/, "").replace(/Z$/, " UTC");
}

/** Today's date as YYYY-MM-DD HH:MM:SS, used as default `assigned_at`. */
export function nowIso(): string {
  return new Date().toISOString();
}
