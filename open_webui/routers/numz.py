"""
numz model management router.

Reads from ~/.numz/models.json (shared with the numz CLI) and provides
endpoints to list available models and switch between them.

Switching updates models.json + server.env and restarts llama-server
via systemd — the same flow as numz CLI's /model command.
"""

import json
import logging
import asyncio
import subprocess
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

log = logging.getLogger(__name__)

router = APIRouter()

NUMZ_DIR = Path.home() / ".numz"
MODELS_JSON = NUMZ_DIR / "models.json"
SERVER_ENV = NUMZ_DIR / "server.env"
ACTIVE_MAIN_FILE = NUMZ_DIR / "active-main.json"


def _get_tailscale_ip() -> str:
    """Get the tailscale IPv4 address, falling back to localhost."""
    try:
        result = subprocess.run(
            ["tailscale", "ip", "-4"],
            capture_output=True, text=True, timeout=2,
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except Exception:
        pass
    return "localhost"


def _read_models_json() -> dict:
    try:
        return json.loads(MODELS_JSON.read_text())
    except Exception:
        return {"models": {}, "defaults": {"main": "unknown"}}


def _get_active_model() -> str:
    """Active model from active-main.json (written by numz on switch),
    falling back to defaults.main in models.json."""
    try:
        data = json.loads(ACTIVE_MAIN_FILE.read_text())
        if data.get("model"):
            return data["model"]
    except Exception:
        pass
    return _read_models_json().get("defaults", {}).get("main", "unknown")


class NumzModelInfo(BaseModel):
    name: str
    displayName: str
    description: str
    contextWindow: int
    vramGB: int
    active: bool


class NumzModelsResponse(BaseModel):
    active: str
    models: list[NumzModelInfo]


class SwitchRequest(BaseModel):
    model: str


class SwitchResponse(BaseModel):
    success: bool
    active: str
    message: str


@router.get("/models", response_model=NumzModelsResponse)
async def get_numz_models():
    """List all available numz models and which is currently active."""
    config = _read_models_json()
    active = _get_active_model()
    models = []
    for name, entry in config.get("models", {}).items():
        if entry.get("tier") != "main":
            continue
        models.append(NumzModelInfo(
            name=name,
            displayName=entry.get("displayName", name),
            description=entry.get("description", ""),
            contextWindow=entry.get("contextWindow", 0),
            vramGB=entry.get("vramGB", 0),
            active=(name == active),
        ))
    return NumzModelsResponse(active=active, models=models)


@router.post("/switch", response_model=SwitchResponse)
async def switch_numz_model(req: SwitchRequest):
    """Switch the active model. Updates models.json + server.env and
    restarts llama-server via systemd."""
    config = _read_models_json()
    target = req.model

    if target not in config.get("models", {}):
        available = list(config.get("models", {}).keys())
        raise HTTPException(400, f"Unknown model '{target}'. Available: {available}")

    active = _get_active_model()
    if target == active:
        return SwitchResponse(success=True, active=target, message=f"Already running {target}")

    # 1. Update defaults.main in models.json
    config["defaults"]["main"] = target
    config["defaults"]["fast"] = target
    MODELS_JSON.write_text(json.dumps(config, indent=2) + "\n")

    # 2. Update NUMZ_ACTIVE_MODEL in server.env (preserve other vars)
    env_content = ""
    if SERVER_ENV.exists():
        env_content = SERVER_ENV.read_text()
    if "NUMZ_ACTIVE_MODEL=" in env_content:
        lines = env_content.splitlines()
        lines = [
            f"NUMZ_ACTIVE_MODEL={target}" if l.startswith("NUMZ_ACTIVE_MODEL=") else l
            for l in lines
        ]
        env_content = "\n".join(lines) + "\n"
    else:
        env_content = f"NUMZ_ACTIVE_MODEL={target}\n{env_content}"
    SERVER_ENV.write_text(env_content)

    # 3. Update active-main.json
    import time
    ACTIVE_MAIN_FILE.write_text(json.dumps({"model": target, "updatedAt": int(time.time() * 1000)}))

    # 4. Restart llama-server via systemd
    try:
        proc = await asyncio.create_subprocess_exec(
            "systemctl", "--user", "restart", "numz-server.service",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _, stderr = await asyncio.wait_for(proc.communicate(), timeout=10)
        if proc.returncode != 0:
            log.error(f"systemctl restart failed: {stderr.decode()}")
            return SwitchResponse(success=False, active=target, message=f"Restart failed: {stderr.decode()}")
    except asyncio.TimeoutError:
        return SwitchResponse(success=False, active=target, message="systemctl restart timed out")

    # 5. Wait for server to come up (poll /v1/models)
    #    llama-server binds to the tailscale IP, not localhost.
    entry = config["models"][target]
    port = entry.get("port", 8899)
    tailscale_ip = _get_tailscale_ip()
    ready = False
    for _ in range(120):  # up to 60s
        await asyncio.sleep(0.5)
        try:
            proc = await asyncio.create_subprocess_exec(
                "curl", "-sf", f"http://{tailscale_ip}:{port}/v1/models",
                stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.DEVNULL,
            )
            await asyncio.wait_for(proc.communicate(), timeout=2)
            if proc.returncode == 0:
                ready = True
                break
        except Exception:
            continue

    if ready:
        log.info(f"Switched to {target} — server ready on :{port}")
        return SwitchResponse(success=True, active=target, message=f"Now serving {target}")
    else:
        log.warning(f"Switched to {target} but server not responding after 30s")
        return SwitchResponse(success=False, active=target, message=f"Server restarting — {target} may take longer to load")
