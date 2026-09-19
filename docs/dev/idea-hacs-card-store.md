# Idea — installing custom cards from the HACS catalogue

Status: **idea, not implemented.** Researched 2026-09; notes for a future attempt.

## What HACS is

HACS ("Home Assistant Community Store") is a custom *integration* for Home Assistant core
(Python) plus its own frontend panel. It lists community repositories (integrations,
Lovelace plugins = custom cards, themes, …), downloads them and tracks updates.

- `hacs/integration` — the backend, **MIT**
- `hacs/frontend` — the panel, **MIT**
- `hacs/default` — the list of the default repositories, **MIT**

MIT is compatible with our Apache-2.0: reusing code or shipping the panel is allowed, as long as
the copyright notice and the licence text go along.

## Which external services are involved

| What | Where | Needs |
|---|---|---|
| Catalogue (all repositories with version, description, downloads, stars) | `https://data-v2.hacs.xyz/<category>/data.json`, e.g. `plugin/data.json` (766 cards in 2026-09, ~450 kB), ETag-cached | nothing, a plain GET |
| Repository details, releases | GitHub API | rate limit: 60/h per IP without a token |
| The download itself | `browser_download_url` of the release asset, or `raw.githubusercontent.com/<repo>/<ref>/<file>` | nothing |

No file goes through a HACS server; only the catalogue comes from them.

## What HACS asks the user for

1. Four acknowledgement checkboxes on setup (read the logs, add-ons, untested things, can be disabled).
2. A **GitHub login via device flow** (open github.com/login/device, enter a code). The resulting
   OAuth token has **no scopes** — read-only access to public information. It exists only to get
   the higher rate limit of the GitHub API.

A GitHub account as a precondition is hard to justify for an ioBroker adapter.

## Options

**A — emulate HACS.** Implement its WebSocket commands (`hacs/repositories/*`, `hacs/repository/*`,
`hacs/critical/*`), repository handling, update entities and repairs, and ship the HACS panel.
Much work, a permanent dependency on what their frontend expects, and the GitHub login stays.
Not recommended.

**B — own card store in the admin page.** Read the catalogue from `data-v2.hacs.xyz`, show a
searchable list on the "Custom Cards" tab, download the selected card from GitHub into
`lovelace.<instance>/cards`, remember the version and check for updates (we already detect the
version of an installed card, see `src/lib/cards.ts`). No token, no GitHub account.

**C — install from a GitHub URL.** A text field for a repository URL; the adapter fetches the asset
of the latest release (or the file HACS would pick: `hacs.json` → `filename`, else
`<repo-name>.js` / `<repo-name>-bundle.js` in the release or in `dist/`) and puts it into the cards
folder. Only GitHub is contacted. Small, and covers the common case.

Suggested order: C first, B later.

## Things to keep in mind

- **Ask before using their infrastructure.** The MIT licence covers the code, not the use of
  `data-v2.hacs.xyz`. Ask ludeeus (HACS maintainer) first, send an honest `User-Agent`
  (`ioBroker.lovelace/<version>`), and use the ETag (`If-None-Match`) so an unchanged catalogue
  costs a 304.
- Which file of a repository is the card: see `custom_components/hacs/repositories/plugin.py`
  (`update_filenames()`) — `hacs.json` may name it, otherwise the release asset or `dist/`.
- Cards expecting their resources below `/hacsfiles/<repo>/` already work: we map `/hacsfiles/`
  to our cards folder (`onCards()` in `src/lib/server.ts`), so such a card needs its folder
  structure kept below `cards/`.
- The folder is watched (`subscribeForeignFiles`), so a downloaded card is picked up at once.

## Sources

- https://github.com/hacs/integration (`data_client.py`, `config_flow.py`, `repositories/plugin.py`)
- https://www.hacs.xyz/docs/faq/github_account/
- https://www.hacs.xyz/docs/use/configuration/basic/
