# openclaw-otper

[![npm version](https://img.shields.io/npm/v/@ssntpl/openclaw-otper.svg)](https://www.npmjs.com/package/@ssntpl/openclaw-otper)
[![License](https://img.shields.io/npm/l/@ssntpl/openclaw-otper.svg)](LICENSE)

OpenClaw plugin for [Otper](https://otper.com) — exposes Otper boards, lists, cards, labels, and comments as agent tools. Wraps [`@ssntpl/otper-cli`](https://github.com/ssntpl/otper-cli) so an LLM agent can search boards, inspect cards, create/update/move cards, manage labels, and post or react to comments without leaving the chat.

## Install

```sh
openclaw plugins install clawhub:@ssntpl/openclaw-otper
```

Or from npm directly:

```sh
openclaw plugins install npm:@ssntpl/openclaw-otper
```

## Configure

Generate a personal access token at **https://otper.com/settings/tokens**, then provide it via any one of these (resolved in order):

**1. Plugin config**:

```json
{
  "plugins": {
    "openclaw-otper": {
      "token": "238|...",
      "baseUrl": "https://otper.com"
    }
  }
}
```

**2. Environment variables**:

```sh
export OTPER_TOKEN="238|..."
export OTPER_BASE_URL="https://otper.com"   # optional, defaults to https://otper.com
```

**3. Reuse [`otper-cli`](https://github.com/ssntpl/otper-cli)'s saved login**:

```sh
npm install -g @ssntpl/otper-cli
otper auth:login            # writes ~/.otper-cli/default/config.json
```

If you already use `otper-cli`, no extra setup is needed — the plugin reads the same config file.

## Tools

31 tools across 8 areas. Tool names use the `otper_` prefix.

### Identity & search

| Tool | Description |
| --- | --- |
| `otper_me` | Profile of the user the configured token authenticates as. |
| `otper_search_users` | Search users by name, email, or username. |
| `otper_search_boards` | Search boards by name. |

### Boards

| Tool | Description |
| --- | --- |
| `otper_show_board` | Get a board by id with its lists and labels. |
| `otper_show_board_by_slug` | Get a board by team-slug + board-slug. |

### Lists

| Tool | Description |
| --- | --- |
| `otper_list_lists` | All lists on a board. |
| `otper_show_list` | A list with its cards (paginated). |
| `otper_create_list` | Create a list on a board. |
| `otper_rename_list` | Update name/description/color/limits. |
| `otper_reorder_list` | Move a list relative to another. |

### Cards

| Tool | Description |
| --- | --- |
| `otper_list_cards` | Cards in a list with the same `labels:bug;assignee:alice` filter syntax as the Otper UI. |
| `otper_show_card` | A single card by id. |
| `otper_show_card_by_slug` | A single card by slug (e.g. from a URL). |
| `otper_create_card` | New card in a list. |
| `otper_update_card` | Update title, description, due date, etc. |
| `otper_move_card` | Move to another list, optionally above a specific card. |
| `otper_archive_card` | Archive (or unarchive) — reversible alternative to delete. |
| `otper_assign_card` / `otper_unassign_card` | Add/remove user assignees. |
| `otper_label_card` / `otper_unlabel_card` | Attach/detach labels. |

### Comments

| Tool | Description |
| --- | --- |
| `otper_list_card_comments` | Up to 50 comments on a card, newest first. |
| `otper_comment_on_card` | Add a comment, optionally as a reply. |
| `otper_update_comment` | Edit an existing comment. |
| `otper_react_to_comment` | Toggle a reaction (like, love, laugh, wow, sad, angry). |

### Labels

| Tool | Description |
| --- | --- |
| `otper_list_labels` | Labels defined on a board. |
| `otper_create_label` | Create a label on a board. |
| `otper_update_label` | Update name, description, or color. |

### Teams & priorities

| Tool | Description |
| --- | --- |
| `otper_show_team` | Team with members and visible boards. |
| `otper_list_team_users` | Just the members of a team. |
| `otper_my_priorities` | Today's priority cards for a user (defaults to authenticated user). |

### Excluded by design

Destructive deletions (`card:delete`, `label:delete`, `comment:delete`, `list:delete`) and high-impact admin operations (`board:create`) are not exposed to the agent. Use the [`otper-cli`](https://github.com/ssntpl/otper-cli) for those manually.

## Filter syntax for `otper_list_cards` / `otper_show_list`

The `search` parameter mirrors the Otper UI exactly:

- Free text → matches title, card number, assignee name, label name
  ```text
  bug
  ```
- Colon filters joined with `;`
  ```text
  labels:bug;assignee:alice;status:not completed
  due date:overdue
  due date:today,tomorrow,next week,not set
  ```
- Card-number lookup
  ```text
  #ENG123
  ```

## Development

```sh
git clone git@github.com:ssntpl/openclaw-otper.git
cd openclaw-otper
npm install
npm run lint               # type-check
OTPER_TOKEN=... npx tsx -e "import('./index.ts').then(p => console.log(p.default.id))"
```

The plugin ships as raw TypeScript (no build step) — openclaw loads the source directly. Add a new tool by:

1. Add the descriptor in the relevant `tools/<area>.ts` file
2. Update this README's tool table
3. Run `npm run lint` to verify types

## Library

If you only need the underlying API and not the openclaw plugin shape, depend on [`@ssntpl/otper-cli`](https://www.npmjs.com/package/@ssntpl/otper-cli) directly:

```ts
import { OtperClient, cards } from "@ssntpl/otper-cli";
const client = new OtperClient({ baseUrl: "https://otper.com", token: "..." });
const card = await cards.getCard(client, "1234");
```

## License

[MIT](LICENSE) © SSNTPL
