#!/usr/bin/env python3
"""
ERNIE-Image-Turbo GGUF image generation server.

Uses stable-diffusion.cpp binary for GGUF inference.
Runs alongside Qwen (no model swapping needed — Q4_K_M fits in ~6GB VRAM).

API:
  POST /generate    — text-to-image
  GET  /health      — health check
"""

import base64
import io
import json
import logging
import os
import subprocess
import tempfile
import time

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional

logging.basicConfig(level=logging.INFO, format='%(asctime)s [image-server] %(message)s')
log = logging.getLogger(__name__)

app = FastAPI()

SD_CPP_BIN = os.environ.get('SD_CPP_BIN', '/home/aldenb/stable-diffusion.cpp/build/bin/sd-cli')
MODEL_PATH = os.environ.get('ERNIE_GGUF', '/home/aldenb/.numz/models/ernie-turbo-gguf/ernie-image-turbo-UD-Q4_K_M.gguf')
PORT = int(os.environ.get('IMAGE_SERVER_PORT', '8898'))
HOST = os.environ.get('IMAGE_SERVER_HOST', '127.0.0.1')


class GenerateRequest(BaseModel):
    prompt: str
    width: int = 1024
    height: int = 1024
    steps: int = 8
    cfg_scale: float = 4.0
    seed: Optional[int] = None


@app.get('/health')
async def health():
    return {
        'status': 'ok',
        'model': MODEL_PATH,
        'binary': SD_CPP_BIN,
        'model_exists': os.path.isfile(MODEL_PATH),
        'binary_exists': os.path.isfile(SD_CPP_BIN),
    }


@app.post('/generate')
async def generate(req: GenerateRequest):
    if not os.path.isfile(SD_CPP_BIN):
        return JSONResponse({'error': f'sd binary not found: {SD_CPP_BIN}'}, status_code=500)
    if not os.path.isfile(MODEL_PATH):
        return JSONResponse({'error': f'Model not found: {MODEL_PATH}'}, status_code=500)

    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
        output_path = tmp.name

    try:
        cmd = [
            SD_CPP_BIN,
            '-m', MODEL_PATH,
            '-p', req.prompt,
            '-W', str(req.width),
            '-H', str(req.height),
            '--steps', str(req.steps),
            '--cfg-scale', str(req.cfg_scale),
            '-o', output_path,
        ]
        if req.seed is not None:
            cmd += ['--seed', str(req.seed)]

        log.info(f'Generating {req.width}x{req.height}, steps={req.steps}...')
        start = time.time()

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120,
        )

        elapsed = time.time() - start

        if result.returncode != 0:
            log.error(f'sd failed: {result.stderr}')
            return JSONResponse({'error': f'Generation failed: {result.stderr[:500]}'}, status_code=500)

        if not os.path.isfile(output_path) or os.path.getsize(output_path) == 0:
            return JSONResponse({'error': 'No image generated'}, status_code=500)

        log.info(f'Generated in {elapsed:.1f}s')

        with open(output_path, 'rb') as f:
            img_b64 = base64.b64encode(f.read()).decode('utf-8')

        return {
            'image': img_b64,
            'elapsed_ms': int(elapsed * 1000),
        }

    except subprocess.TimeoutExpired:
        return JSONResponse({'error': 'Generation timed out (120s)'}, status_code=504)
    except Exception as e:
        log.exception('Generation failed')
        return JSONResponse({'error': str(e)}, status_code=500)
    finally:
        try:
            os.unlink(output_path)
        except Exception:
            pass


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
