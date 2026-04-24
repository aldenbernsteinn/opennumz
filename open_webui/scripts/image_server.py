#!/usr/bin/env python3
"""
ERNIE-Image-Turbo image generation server.

Runs as a separate process. Loads the model on demand, generates images,
then unloads to free VRAM for the LLM.

API:
  POST /generate    — text-to-image
  POST /edit        — img2img (edit existing image)
  GET  /health      — health check
  POST /unload      — force unload model from VRAM

Optimized for RTX 5090 Blackwell (compute 12.0, bf16, torch.compile).
"""

import asyncio
import base64
import io
import json
import logging
import os
import signal
import sys
import time
from pathlib import Path

import torch
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional

logging.basicConfig(level=logging.INFO, format='%(asctime)s [image-server] %(message)s')
log = logging.getLogger(__name__)

app = FastAPI()

# ── Config ──────────────────────────────────────────────────────────────

MODEL_ID = os.environ.get('ERNIE_MODEL', 'baidu/ERNIE-Image-Turbo')
MODEL_CACHE = Path(os.environ.get('ERNIE_CACHE', os.path.expanduser('~/.numz/models/ernie-image')))
PORT = int(os.environ.get('IMAGE_SERVER_PORT', '8898'))
HOST = os.environ.get('IMAGE_SERVER_HOST', '127.0.0.1')
# Auto-unload after N seconds of inactivity to free VRAM for LLM
IDLE_UNLOAD_SECS = int(os.environ.get('ERNIE_IDLE_UNLOAD', '60'))

# ── State ───────────────────────────────────────────────────────────────

_pipe = None
_last_used = 0
_loading = False


# ── Model management ───────────────────────────────────────────────────

def load_model():
    global _pipe, _last_used, _loading
    if _pipe is not None:
        _last_used = time.time()
        return _pipe

    _loading = True
    log.info(f'Loading {MODEL_ID}...')
    start = time.time()

    from diffusers import ErnieImagePipeline

    _pipe = ErnieImagePipeline.from_pretrained(
        MODEL_ID,
        torch_dtype=torch.bfloat16,
        cache_dir=str(MODEL_CACHE),
    )
    _pipe.to('cuda')

    # Blackwell optimizations
    if hasattr(torch, 'compile'):
        try:
            _pipe.transformer = torch.compile(_pipe.transformer, mode='reduce-overhead')
            log.info('torch.compile applied to transformer')
        except Exception as e:
            log.warning(f'torch.compile failed (non-fatal): {e}')

    # Enable memory-efficient attention
    try:
        _pipe.enable_xformers_memory_efficient_attention()
        log.info('xformers memory-efficient attention enabled')
    except Exception:
        pass

    elapsed = time.time() - start
    log.info(f'Model loaded in {elapsed:.1f}s')
    _last_used = time.time()
    _loading = False
    return _pipe


def unload_model():
    global _pipe
    if _pipe is None:
        return
    log.info('Unloading model from VRAM...')
    del _pipe
    _pipe = None
    torch.cuda.empty_cache()
    import gc
    gc.collect()
    log.info('Model unloaded, VRAM freed')


async def idle_unloader():
    """Background task: unload model if idle for IDLE_UNLOAD_SECS."""
    while True:
        await asyncio.sleep(10)
        if _pipe is not None and not _loading and (time.time() - _last_used) > IDLE_UNLOAD_SECS:
            unload_model()


# ── Request models ─────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    prompt: str
    width: int = 1024
    height: int = 1024
    steps: int = 8  # Turbo = 8 steps
    guidance_scale: float = 4.0
    seed: Optional[int] = None
    use_pe: bool = False  # We do our own prompt enhancement via Qwen


class EditRequest(BaseModel):
    prompt: str
    image_base64: str  # Source image as base64
    width: int = 1024
    height: int = 1024
    steps: int = 8
    strength: float = 0.7  # How much to change (0=nothing, 1=full regenerate)
    guidance_scale: float = 4.0
    seed: Optional[int] = None
    use_pe: bool = False


# ── Endpoints ──────────────────────────────────────────────────────────

@app.get('/health')
async def health():
    return {
        'status': 'ok',
        'model_loaded': _pipe is not None,
        'loading': _loading,
        'model': MODEL_ID,
    }


@app.post('/generate')
async def generate(req: GenerateRequest):
    try:
        pipe = load_model()
        generator = torch.Generator('cuda')
        if req.seed is not None:
            generator.manual_seed(req.seed)
        else:
            generator.seed()

        log.info(f'Generating {req.width}x{req.height}, steps={req.steps}...')
        start = time.time()

        result = pipe(
            prompt=req.prompt,
            height=req.height,
            width=req.width,
            num_inference_steps=req.steps,
            guidance_scale=req.guidance_scale,
            generator=generator,
            use_pe=req.use_pe,
        )

        elapsed = time.time() - start
        log.info(f'Generated in {elapsed:.1f}s')

        # Convert to base64
        img = result.images[0]
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        img_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')

        global _last_used
        _last_used = time.time()

        return {
            'image': img_b64,
            'seed': generator.initial_seed(),
            'elapsed_ms': int(elapsed * 1000),
        }

    except Exception as e:
        log.exception('Generation failed')
        return JSONResponse({'error': str(e)}, status_code=500)


@app.post('/edit')
async def edit(req: EditRequest):
    try:
        from PIL import Image

        pipe = load_model()
        generator = torch.Generator('cuda')
        if req.seed is not None:
            generator.manual_seed(req.seed)
        else:
            generator.seed()

        # Decode source image
        img_data = base64.b64decode(req.image_base64)
        source_image = Image.open(io.BytesIO(img_data)).convert('RGB')
        source_image = source_image.resize((req.width, req.height))

        log.info(f'Editing {req.width}x{req.height}, strength={req.strength}...')
        start = time.time()

        # img2img: pass source image + prompt
        result = pipe(
            prompt=req.prompt,
            image=source_image,
            height=req.height,
            width=req.width,
            num_inference_steps=req.steps,
            guidance_scale=req.guidance_scale,
            strength=req.strength,
            generator=generator,
            use_pe=req.use_pe,
        )

        elapsed = time.time() - start
        log.info(f'Edited in {elapsed:.1f}s')

        img = result.images[0]
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        img_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')

        global _last_used
        _last_used = time.time()

        return {
            'image': img_b64,
            'seed': generator.initial_seed(),
            'elapsed_ms': int(elapsed * 1000),
        }

    except Exception as e:
        log.exception('Edit failed')
        return JSONResponse({'error': str(e)}, status_code=500)


@app.post('/unload')
async def force_unload():
    unload_model()
    return {'status': 'unloaded'}


# ── Startup ────────────────────────────────────────────────────────────

@app.on_event('startup')
async def on_startup():
    asyncio.create_task(idle_unloader())
    log.info(f'Image server ready on {HOST}:{PORT}')
    log.info(f'Model: {MODEL_ID}')
    log.info(f'Auto-unload after {IDLE_UNLOAD_SECS}s idle')


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
