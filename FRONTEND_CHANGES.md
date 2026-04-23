# Frontend changes to preserve when rebuilding from source

## index.html additions (add these to src/app.html before build)
```html
<script src="/static/numz-gui.js" defer crossorigin="use-credentials"></script>
<script src="/static/loader.js" defer crossorigin="use-credentials"></script>
<link rel="stylesheet" href="/static/custom.css" crossorigin="use-credentials" />
<link rel="stylesheet" href="/static/numz-gui.css" crossorigin="use-credentials" />
```

## Static files (NOT part of Svelte build — safe)
- static/loader.js — branding, sidebar, code mode toggle, settings
- static/numz-gui.js — WebSocket TUI renderer
- static/numz-gui.css — TUI component styles
- static/custom.css — mode slider, sidebar, thinking styles
- static/code.html — code mode page
- static/quiz.html — quiz page
- static/favicon.svg, favicon.png, splash.png, splash-dark.png, logo.png, numz-logo.svg
- static/quiz/questions.js

## config.py change
Removed the startup file-copy logic that copied frontend/static/* over static/*

## Svelte component changes needed (for when we have source)
- Replace user button in sidebar bottom with settings gear icon
- Settings overlay: shows Chat + Code model names
