# OpenNumz

Customized Open WebUI. Two separate services in one GUI shell.

## Two Services — Don't Conflate

### Chat mode
Regular Open WebUI chat. Uses the `numz` model registered in Open WebUI. Goes through Open WebUI's normal pipeline → llama-server at :8899. Standard Open WebUI behavior. Nothing custom.

### Code mode
GUI for the numz TUI. numz is a **separate product** at `/home/aldenb/numz/`. We do NOT modify the numz repo from here. We communicate with it:
- WebSocket endpoint spawns numz CLI process with `--output-format stream-json --input-format stream-json`
- Same session context maintained across messages (persistent WebSocket)
- `--resume {sessionId}` for existing sessions, fresh process for new chats
- Both TUI and GUI read/write the same JSONL — single source of truth

## Source Code

**Work from source code. Never compiled output.**

- `src/` — Svelte frontend source. Edit `.svelte` components here. Build to produce `open_webui/frontend/`.
- `open_webui/` — Python backend source. Edit directly.
- `open_webui/static/` — Our custom static files (loader.js, numz-gui.js, CSS, images). NOT part of Svelte build.
- `open_webui/frontend/` — Compiled Svelte build output. **NEVER edit directly.** Rebuild from `src/` instead.

## Architecture Rule: Browser Is Just a Viewer

Nothing is tied to the browser session. NOTHING. The browser is merely a way to view what's happening and send input. All state, all responses, all processing lives on this computer (server). If the user refreshes mid-response, the response keeps going on the server. When the browser reconnects, it catches up to current server state. Disconnecting the browser must never stop or lose work in progress.

## Rules

- **NEVER** edit files in `open_webui/frontend/_app/`. That's compiled output. Edit `src/` and rebuild.
- **NEVER** run `pip install`, `pipx install`, `pipx inject`, or `pipx upgrade` for open-webui.
- **NEVER** edit files in `~/.local/share/pipx/venvs/open-webui/`.
- **NEVER** modify the numz repo (`/home/aldenb/numz/`) from this project.
- **NEVER** clone. This repo IS the source.

## Testing Rule: Always Test via Tailscale

The user accesses OpenNumz through Tailscale at `http://100.103.233.31:3000`. When testing any feature (Studio, Quiz, API endpoints), always verify via the Tailscale IP, not `localhost` or `127.0.0.1`. The LTX backend runs on `127.0.0.1:8001` but is only reachable through the OpenNumz proxy at `/ltx-api/*`. Studio frontend lives at `/studio` and all its API calls go through `/ltx-api/api/...`. File serving for generated images/videos goes through `/ltx-api/file?path=...` and `/ltx-files/...`.

## Build Frontend

```bash
cd frontend-src && npx vite build
cp -a build/* ../open_webui/frontend/
```

## Deploy

```bash
./deploy.sh
```

Restarts the systemd service. Uses `PYTHONPATH` to load from this repo.

## Layout

- `src/` — Svelte source (components, routes, lib)
- `open_webui/main.py` — FastAPI app. numz proxy + session APIs at the bottom.
- `open_webui/static/` — Our injected files (loader.js, numz-gui.js, CSS, images). Edit directly.
- `open_webui/frontend/` — Compiled build output. Don't edit.
- `open_webui/config.py` — Startup config (static/ served as-is, no copy step)
