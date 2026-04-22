# OpenNumz

Customized Open WebUI. Two separate services in one GUI shell.

## Two Services — Don't Conflate

### Chat mode
Regular Open WebUI chat. Uses the `numz` model registered in Open WebUI. Goes through Open WebUI's normal pipeline → llama-server at :8899. Standard Open WebUI behavior. Nothing custom.

### Code mode
GUI for the numz TUI. numz is a **separate product** at `/home/aldenb/numz/`. We do NOT modify the numz repo from here. We communicate with it:
- Read its JSONL session files (`~/.claude/projects/*/`) for history
- Spawn its CLI via `/api/numz/chat` proxy for new messages
- Both TUI and GUI read/write the same JSONL — single source of truth

## Source

`open_webui/` is the full source. Edit directly. Run `./deploy.sh` to restart.

## Rules

- **NEVER** run `pip install`, `pipx install`, `pipx inject`, or `pipx upgrade` for open-webui.
- **NEVER** edit files in `~/.local/share/pipx/venvs/open-webui/`.
- **NEVER** modify the numz repo (`/home/aldenb/numz/`) from this project.

## Deploy

```bash
./deploy.sh
```

Restarts the systemd service. Uses `PYTHONPATH` to load from this repo.

## Layout

- `open_webui/main.py` — FastAPI app. numz proxy + session APIs at the bottom.
- `open_webui/env.py` — config
- `open_webui/static/` — loader.js, custom.css, logos. Edit directly.
- `open_webui/config.py` — startup config (static/ served as-is, no copy step)
