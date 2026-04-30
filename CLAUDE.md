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
- `open_webui/static/studio/` — LTX Studio compiled React frontend. Built from `/home/aldenb/LTX-Desktop/frontend/`.
- `open_webui/frontend/` — Compiled build output. Don't edit.
- `open_webui/config.py` — Startup config (static/ served as-is, no copy step)

## Studio (Video Storyboard)

Studio lives at `/studio`. It's a compiled React app from `/home/aldenb/LTX-Desktop/`.

### Studio Build & Deploy

```bash
cd /home/aldenb/LTX-Desktop && pnpm build:frontend
# Then copy to OpenNumz:
NEW_JS=$(basename dist/assets/index-*.js)
NEW_CSS=$(basename dist/assets/index-*.css)
cd /home/aldenb/opennumz
cp /home/aldenb/LTX-Desktop/dist/assets/$NEW_JS open_webui/static/studio/assets/
cp /home/aldenb/LTX-Desktop/dist/assets/$NEW_CSS open_webui/static/studio/assets/
sed -i "s|index-[A-Za-z0-9_-]*\.js|$NEW_JS|" open_webui/static/studio/index.html
sed -i "s|index-[A-Za-z0-9_-]*\.css|$NEW_CSS|" open_webui/static/studio/index.html
find open_webui/static/studio/assets/ -name 'index-*' ! -name "$NEW_JS" ! -name "$NEW_CSS" -delete
./deploy.sh
```

### Models Used

| Model | Purpose | Location | VRAM |
|-------|---------|----------|------|
| **Z-Image Turbo** | Initial character creation (front + side refs), scenes without characters, style samples | `~/.numz/ltx-data/models/Z-Image-Turbo/` | ~8GB |
| **Flux 2 Klein 9B** | Outfit changes & scenes with characters — uses native reference image for face consistency | `~/.cache/huggingface/hub/models--Runware--BFL-FLUX.2-klein-9B/` (via `Runware/BFL-FLUX.2-klein-9B`) | ~18GB with cpu_offload |
| **LTX 2.3** | Video generation from shot prompts | `~/.numz/ltx-data/models/` (GGUF checkpoint + IC-LoRA) | ~20GB |
| **Qwen 3.5 27B** (numz) | Storyboard chat, character descriptions, style samples, outfit descriptions | llama-server at `:8899` | ~24GB |

### VRAM Management

Only ONE heavy model on GPU at a time. The proxy handles swapping:
- **LLM work** (storyboard chat, character refs) → numz stays, LTX stays on standby (0 VRAM)
- **Image generation without character** → stop numz, load Z-Image via LTX backend
- **Image generation with character ref** → stop numz, load Flux 2 Klein via LTX backend
- **Video generation** → stop numz, load LTX video pipeline

LTX backend on standby uses 0 GPU (warmup fails, no models preloaded). Models load on demand only.

### Studio Architecture

- **Frontend**: React + TypeScript + Tailwind, compiled to `open_webui/static/studio/`
- **Backend**: LTX-Desktop Python FastAPI at `127.0.0.1:8001`, proxied via `/ltx-api/*`
- **Streaming chat**: OpenNumz endpoint at `/ltx-api/api/storyboard/chat-stream` calls numz directly (SSE)
- **Character refs**: OpenNumz endpoint at `/ltx-api/api/storyboard/generate-character-refs` calls numz directly
- **Image gen**: Proxied to LTX backend which routes to Z-Image or Klein based on `referenceImagePath`
- **Projects**: Stored in `~/.numz/ltx-data/projects.json`
- **Outputs**: All images/videos in `~/.numz/ltx-data/outputs/`

### Character Consistency Pipeline

1. **Create character** → Z-Image Turbo generates front + side model sheets (gray background, anime style)
2. **Add Look** (outfit change) → Flux 2 Klein takes the Z-Image face as reference image → generates same face in new outfit
3. **Scene with character** → Flux 2 Klein uses character's front view ref for face identity
4. **Scene without character** → Z-Image Turbo (faster, no identity needed)

Klein's native `image` parameter handles reference images — no IP-Adapter, no inpainting, no masking needed.
