# OpenNumz

Chat GUI. Customized Open WebUI. Separate product from numz (the TUI).

## Source

`open_webui/` is the full source — Python, frontend build, migrations, static assets. Edit directly.

## Rules

- **NEVER** run `pip install`, `pipx install`, `pipx inject`, or `pipx upgrade` for open-webui.
- **NEVER** edit files in `~/.local/share/pipx/venvs/open-webui/`. We don't use it.
- Edit `open_webui/` in this repo. Run `./deploy.sh`.

## Deploy

```bash
./deploy.sh
```

Starts uvicorn from `open_webui/` in this repo. Uses the pipx venv's Python for dependencies only.

## Layout

- `open_webui/main.py` — FastAPI app + numz session/chat/stream APIs at the bottom
- `open_webui/env.py` — config
- `open_webui/routers/openai.py` — OpenAI proxy
- `open_webui/static/` — compiled frontend + injected files (loader.js, custom.css, logos, html pages)
- `customizations/` — legacy copies (kept for git history reference)
