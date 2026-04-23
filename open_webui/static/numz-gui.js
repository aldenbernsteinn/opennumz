// numz GUI — full TUI recreated as web GUI components
// Every TUI feature remade for the browser
(function() {
  'use strict';

  var ws, messagesEl, spinnerEl, statusEl, inputEl, cmdMenuEl;
  var currentAssistantEl, streamingText = '', streamingThinking = '';
  var _toolInputBuffers = {};
  var _spinnerTimer = null;
  var _spinnerStart = 0;

  // ── Public API ───────────────────────────────────────────────────────

  window.numzGui = {
    connect: function(sessionId, cwd, target) {
      target.innerHTML = '';
      var app = el('div', { id: 'numz-app' });

      // Messages scroll
      var scroll = el('div', { id: 'numz-messages-scroll' });
      messagesEl = el('div', { id: 'numz-messages' });
      // Spinner created but NOT appended yet — showSpinner appends it to the end each time
      spinnerEl = el('div', { className: 'numz-spinner', style: 'display:none' });
      scroll.appendChild(messagesEl);
      app.appendChild(scroll);

      // Status line — shows model, workspace, tokens
      statusEl = el('div', { id: 'numz-status' });
      var cwdDisplay = cwd ? cwd.replace(/^\/home\/\w+\//, '~/') : '~';
      statusEl.innerHTML = '<span class="numz-status-model">numz</span><span class="numz-status-cwd" style="color:#888">' + esc(cwdDisplay) + '</span>';
      app.appendChild(statusEl);

      // Input bar
      var inputBar = el('div', { id: 'numz-input-bar', style: 'position:relative' });
      inputBar.innerHTML = '<span class="numz-prompt">&#10095;</span>';
      inputEl = el('input', { type: 'text', placeholder: 'Message numz...' });
      inputEl.addEventListener('keydown', handleInputKey);
      inputBar.appendChild(inputEl);

      // Think toggle
      var thinkBtn = el('button', { id: 'numz-think-btn' });
      thinkBtn.textContent = 'Think';
      thinkBtn.style.cssText = 'padding:6px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:none;color:#666;cursor:pointer;font-size:12px;font-weight:600;font-family:inherit;margin-right:4px';
      thinkBtn.addEventListener('click', function() {
        window._numzThinking = !window._numzThinking;
        thinkBtn.style.color = window._numzThinking ? '#fff' : '#666';
        thinkBtn.style.background = window._numzThinking ? 'rgba(255,255,255,0.12)' : 'none';
        thinkBtn.style.borderColor = window._numzThinking ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)';
      });
      inputBar.appendChild(thinkBtn);

      var sendBtn = el('button', { className: 'numz-send-btn' });
      sendBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
      sendBtn.addEventListener('click', sendMessage);
      inputBar.appendChild(sendBtn);

      // Slash command menu
      cmdMenuEl = el('div', { className: 'numz-cmd-menu' });
      inputBar.appendChild(cmdMenuEl);

      app.appendChild(inputBar);
      target.appendChild(app);

      // Connect WebSocket immediately — one connection per session, stays alive
      var url = 'ws://' + location.host + '/api/numz/ws?session=' + (sessionId || '') + '&cwd=' + encodeURIComponent(cwd || '');
      window._numzSessionId = sessionId;
      ws = new WebSocket(url);
      ws.onopen = function() { inputEl.focus(); };
      ws.onmessage = function(e) { try { handleEvent(JSON.parse(e.data)); } catch(err) {} };
      ws.onclose = function() {};
      ws.onerror = function() { addSystem('Connection failed', 'error'); };
      inputEl.focus();
    },

    disconnect: function() {
      if (ws) { ws.close(); ws = null; }
      clearSpinner();
    },

    // Load history from JSONL API (messages array with role/content)
    loadHistory: function(messages) {
      if (!messagesEl) return;
      for (var i = 0; i < messages.length; i++) {
        var m = messages[i];
        if (m.role === 'user') {
          addUser(m.content);
        } else if (m.role === 'assistant') {
          var d = el('div', { className: 'numz-msg-assistant' });
          var textDiv = el('div', { className: 'numz-text-content' });
          textDiv.innerHTML = renderMarkdown(m.content);
          d.appendChild(textDiv);
          messagesEl.appendChild(d);
        }
      }
      scrollBottom();
    }
  };

  // ── Input handling ───────────────────────────────────────────────────

  function handleInputKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (e.key === 'Escape') { sendInterrupt(); }
    if (e.key === '/' && inputEl.value === '') { showCmdMenu(); }
    if (e.key === 'Escape' && cmdMenuEl.classList.contains('open')) {
      cmdMenuEl.classList.remove('open'); e.preventDefault();
    }
  }

  function sendMessage() {
    if (!inputEl) return;
    var text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    if (cmdMenuEl) cmdMenuEl.classList.remove('open');
    addUser(text);
    if (!ws || ws.readyState !== 1) {
      addSystem('Not connected', 'error');
      return;
    }
    showSpinner('numz');
    if (window._numzUpdateSessionStatus) window._numzUpdateSessionStatus('unread');
    ws.send(JSON.stringify({ type: 'user', message: { role: 'user', content: text } }));
  }

  function sendInterrupt() {
    if (ws && ws.readyState === 1) ws.send(JSON.stringify({ type: 'interrupt' }));
  }

  function showCmdMenu() {
    var cmds = [
      { name: '/clear', desc: 'Clear conversation' },
      { name: '/compact', desc: 'Compact context' },
      { name: '/cost', desc: 'Show cost' },
      { name: '/help', desc: 'Show help' },
      { name: '/model', desc: 'Switch model' },
      { name: '/plan', desc: 'Enter plan mode' },
      { name: '/status', desc: 'Show status' },
      { name: '/thinking', desc: 'Toggle thinking' },
      { name: '/vim', desc: 'Vim mode' },
    ];
    var h = '';
    cmds.forEach(function(c) {
      h += '<div class="numz-cmd-item" data-cmd="' + c.name + '"><span class="numz-cmd-name">' + c.name + '</span><span class="numz-cmd-desc">' + c.desc + '</span></div>';
    });
    cmdMenuEl.innerHTML = h;
    cmdMenuEl.classList.add('open');
    cmdMenuEl.querySelectorAll('.numz-cmd-item').forEach(function(item) {
      item.addEventListener('click', function() {
        inputEl.value = item.dataset.cmd;
        cmdMenuEl.classList.remove('open');
        inputEl.focus();
      });
    });
  }

  // ── Event dispatcher ─────────────────────────────────────────────────

  function handleEvent(ev) {
    var type = ev.type || '';
    if (type === 'stream_event') handleStreamEvent(ev);
    else if (type === 'assistant') handleAssistant(ev);
    else if (type === 'user') handleUserEvent(ev);
    else if (type === 'system') handleSystemEvent(ev);
    else if (type === 'result') handleResult(ev);
    else if (type === 'control_request') handleControlRequest(ev);
  }

  // ── Stream events ────────────────────────────────────────────────────

  function handleStreamEvent(ev) {
    var event = ev.event || {};
    var t = event.type || '';

    if (t === 'content_block_start') {
      var block = event.content_block || {};
      if (block.type === 'thinking') { streamingThinking = ''; ensureAssistant(); }
      else if (block.type === 'text') { streamingText = ''; ensureAssistant(); }
      else if (block.type === 'tool_use') { addToolStart(block); }
    }
    else if (t === 'content_block_delta') {
      var delta = event.delta || {};
      if (delta.type === 'thinking_delta') { streamingThinking += delta.thinking || ''; updateThinking(); }
      else if (delta.type === 'text_delta') { streamingText += delta.text || ''; updateText(); }
      else if (delta.type === 'input_json_delta') { updateToolInput(delta.partial_json || ''); }
    }
    else if (t === 'content_block_stop') { /* handled by finishAssistant */ }
  }

  function ensureAssistant() {
    if (!currentAssistantEl) {
      currentAssistantEl = el('div', { className: 'numz-msg-assistant' });
      messagesEl.appendChild(currentAssistantEl);
    }
  }

  function updateText() {
    ensureAssistant();
    var textEl = currentAssistantEl.querySelector('.numz-text-content');
    if (!textEl) {
      textEl = el('div', { className: 'numz-text-content' });
      currentAssistantEl.appendChild(textEl);
    }
    textEl.innerHTML = renderMarkdown(streamingText);
    scrollBottom();
  }

  var _thinkingStartTime = 0;
  var _thinkingTimer = null;

  function updateThinking() {
    if (!window._numzThinking) return;
    ensureAssistant();
    var thinkEl = currentAssistantEl.querySelector('.numz-thinking');
    if (!thinkEl) {
      _thinkingStartTime = Date.now();
      thinkEl = el('div', { className: 'numz-thinking' });
      thinkEl.innerHTML =
        '<div class="numz-thinking-header" onclick="this.parentElement.classList.toggle(\'open\')">' +
          '<span class="numz-thinking-label">Thinking</span>' +
          '<span style="margin-left:auto;color:#444;font-size:10px">&#9660;</span>' +
        '</div>' +
        '<div class="numz-thinking-content"></div>';
      currentAssistantEl.insertBefore(thinkEl, currentAssistantEl.firstChild);
    }
    thinkEl.querySelector('.numz-thinking-content').textContent = streamingThinking;
    scrollBottom();
  }

  function stopThinking() {
    if (_thinkingTimer) { clearInterval(_thinkingTimer); _thinkingTimer = null; }
    if (!currentAssistantEl) return;
    var thinkEl = currentAssistantEl.querySelector('.numz-thinking');
    if (!thinkEl) return;
    // Stop spinner, show duration
    var spinner = thinkEl.querySelector('.numz-thinking-spinner');
    if (spinner) spinner.style.display = 'none';
    var label = thinkEl.querySelector('.numz-thinking-label');
    var elapsed = Math.round((Date.now() - _thinkingStartTime) / 1000);
    if (label) label.textContent = 'Thought for ' + elapsed + 's';
    var elapsedEl = thinkEl.querySelector('.numz-thinking-elapsed');
    if (elapsedEl) elapsedEl.textContent = '';
  }

  // Handle complete assistant messages (non-streaming — numz sends these)
  function handleAssistant(ev) {
    if (window._numzUpdateSessionStatus) window._numzUpdateSessionStatus('working');
    var msg = ev.message || {};
    var content = msg.content;
    if (!Array.isArray(content)) return;

    ensureAssistant();
    for (var i = 0; i < content.length; i++) {
      var block = content[i];
      if (block.type === 'text' && block.text) {
        stopThinking(); // Thinking is done when text arrives
        streamingText += block.text;
        updateText();
      } else if (block.type === 'thinking' && block.thinking && window._numzThinking) {
        streamingThinking += block.thinking;
        updateThinking();
      } else if (block.type === 'tool_use') {
        addToolStart(block);
        // If input is already complete, render it
        if (block.input) {
          _toolInputBuffers[block.id] = JSON.stringify(block.input);
          updateToolInput('');
        }
      }
    }
    scrollBottom();
  }

  function finishAssistant() {
    stopThinking();
    currentAssistantEl = null;
    streamingText = '';
    streamingThinking = '';
    clearSpinner();
  }

  // ── Tool calls ───────────────────────────────────────────────────────

  function addToolStart(block) {
    ensureAssistant();
    var card = el('div', { className: 'numz-tool-card', dataset: { toolId: block.id || '' } });
    card.innerHTML =
      '<div class="numz-tool-header" onclick="this.parentElement.classList.toggle(\'open\')">' +
        '<span class="numz-tool-marker">&#9084;</span>' +
        '<span class="numz-tool-name">' + esc(block.name || '') + '</span>' +
        '<span class="numz-tool-desc"></span>' +
        '<span class="numz-tool-spinner" style="animation:pulse 1.5s ease-in-out infinite">Running...</span>' +
      '</div>' +
      '<div class="numz-tool-body">' +
        '<div class="numz-tool-input"></div>' +
        '<div class="numz-tool-output" style="display:none"></div>' +
      '</div>';
    currentAssistantEl.appendChild(card);
    _toolInputBuffers[block.id] = '';
    showSpinner(block.name);
    scrollBottom();
  }

  function updateToolInput(partialJson) {
    var cards = messagesEl.querySelectorAll('.numz-tool-card');
    if (!cards.length) return;
    var card = cards[cards.length - 1];
    var tid = card.dataset.toolId;
    _toolInputBuffers[tid] = (_toolInputBuffers[tid] || '') + partialJson;

    var descEl = card.querySelector('.numz-tool-desc');
    var inputEl2 = card.querySelector('.numz-tool-input');
    try {
      var parsed = JSON.parse(_toolInputBuffers[tid]);
      var desc = parsed.description || parsed.command || parsed.file_path || parsed.pattern || parsed.query || '';
      if (descEl) descEl.textContent = String(desc).substring(0, 80);
      if (inputEl2) inputEl2.textContent = JSON.stringify(parsed, null, 2).substring(0, 500);
    } catch(e) {
      if (inputEl2) inputEl2.textContent = _toolInputBuffers[tid].substring(0, 300);
    }
  }

  function addToolResult(toolUseId, content, isError) {
    clearSpinner();
    var card = messagesEl.querySelector('.numz-tool-card[data-tool-id="' + toolUseId + '"]');
    if (!card) card = messagesEl.querySelector('.numz-tool-card:last-child');
    if (!card) return;

    // Remove spinner
    var spinner = card.querySelector('.numz-tool-spinner');
    if (spinner) spinner.remove();

    // Open the card to show result
    card.classList.add('open');

    var outputEl = card.querySelector('.numz-tool-output');
    if (!outputEl) return;
    outputEl.style.display = '';
    if (isError) outputEl.classList.add('error');

    var text = '';
    if (typeof content === 'string') text = content;
    else if (Array.isArray(content)) {
      text = content.filter(function(p) { return p.type === 'text'; }).map(function(p) { return p.text; }).join('\n');
    }
    if (text.length > 4000) text = text.substring(0, 4000) + '\n... (truncated)';

    // Detect diffs
    if (text.indexOf('@@') !== -1 && (text.indexOf('+') !== -1 || text.indexOf('-') !== -1)) {
      outputEl.innerHTML = renderDiff(text);
    } else {
      outputEl.innerHTML = '<pre><code>' + esc(text) + '</code></pre>';
    }
    scrollBottom();
  }

  // ── User events ──────────────────────────────────────────────────────

  function handleUserEvent(ev) {
    var msg = ev.message || {};
    var content = msg.content;

    if (typeof content === 'string' && content.trim()) {
      if (isMetadata(content)) return;
      addUser(content);
      return;
    }
    if (Array.isArray(content)) {
      for (var i = 0; i < content.length; i++) {
        var part = content[i];
        if (part.type === 'tool_result') {
          addToolResult(part.tool_use_id, part.content, part.is_error);
        } else if (part.type === 'text' && part.text && !isMetadata(part.text)) {
          addUser(part.text);
        }
      }
    }
  }

  function isMetadata(s) {
    return s.startsWith('<local-command') || s.startsWith('<command-name') ||
           s.startsWith('<system-reminder') || s.startsWith('<command-message') ||
           s.startsWith('<command-args') || s.startsWith('<local-command-stdout');
  }

  // ── System events ────────────────────────────────────────────────────

  function handleSystemEvent(ev) {
    var sub = ev.subtype || '';
    if (sub === 'init') {
      var model = ev.model || 'numz';
      var tools = ev.tools || [];
      var cwdInit = ev.cwd ? ev.cwd.replace(/^\/home\/\w+\//, '~/') : '';
      var permMode = ev.permissionMode || 'default';
      statusEl.innerHTML =
        (cwdInit ? '<span class="numz-status-cwd" style="color:#888">' + esc(cwdInit) + '</span>' : '') +
        (permMode && permMode !== 'default' ? '<span class="numz-status-perm" style="color:#22c55e">' + esc(permMode) + '</span>' : '') +
        '<span class="numz-status-tokens" style="color:#555">' + tools.length + ' tools</span>';
    }
    else if (sub === 'tool_progress') { showSpinner(ev.tool_name); }
    else if (sub === 'status') {
      if (ev.status === 'compacting') addSystem('Compacting context...', 'warning');
    }
    else if (sub === 'hook_started') { showSpinner(ev.hook_name); }
    else if (sub === 'hook_response') { clearSpinner(); }
    else if (sub === 'api_retry') { addSystem('API retry (attempt ' + (ev.attempt || '?') + ')...', 'warning'); }
    else if (sub === 'task_started') { addSystem('Task started: ' + (ev.description || '')); }
    else if (sub === 'task_notification') {
      var status = ev.status || '';
      addSystem('Task ' + status + ': ' + (ev.summary || ''), status === 'failed' ? 'error' : '');
    }
  }

  function handleResult(ev) {
    if (window._numzUpdateSessionStatus) window._numzUpdateSessionStatus('idle');
    finishAssistant();

    if (ev.subtype === 'success') {
      var usage = ev.usage || {};
      var parts = [];
      if (ev.duration_ms) parts.push(Math.round(ev.duration_ms / 1000) + 's');
      if (usage.output_tokens) parts.push(usage.output_tokens + ' tokens');
      if (ev.cost_usd) parts.push('$' + ev.cost_usd.toFixed(4));

      if (parts.length) {
        var turnEnd = el('div', { className: 'numz-turn-end' });
        turnEnd.textContent = parts.join(' · ');
        messagesEl.appendChild(turnEnd);
      }

      // Update status
      var tokensEl = statusEl.querySelector('.numz-status-tokens');
      if (tokensEl && usage.input_tokens) {
        tokensEl.textContent = usage.input_tokens + ' in / ' + (usage.output_tokens || 0) + ' out';
      }
      var costEl = statusEl.querySelector('.numz-status-cost');
      if (!costEl && ev.cost_usd) {
        costEl = el('span', { className: 'numz-status-cost' });
        statusEl.appendChild(costEl);
      }
      if (costEl && ev.cost_usd) costEl.textContent = '$' + ev.cost_usd.toFixed(4);
    }
    else if (ev.subtype && ev.subtype.startsWith('error')) {
      addSystem('Error: ' + (ev.error || ev.subtype), 'error');
    }

    if (inputEl) { inputEl.disabled = false; inputEl.focus(); }
    scrollBottom();
  }

  // ── Permission prompts ───────────────────────────────────────────────

  function handleControlRequest(ev) {
    if (window._numzUpdateSessionStatus) window._numzUpdateSessionStatus('approval');
    if (!ev.request_id) return;
    var req = ev.request || {};
    if (req.type !== 'can_use_tool') return;

    var tool = req.tool_name || 'Unknown';
    var input = req.input || {};
    var desc = input.description || input.command || input.file_path || JSON.stringify(input).substring(0, 200);

    var perm = el('div', { className: 'numz-permission' });
    perm.innerHTML =
      '<div class="numz-permission-title">Permission: ' + esc(tool) + '</div>' +
      '<div class="numz-permission-desc">' + esc(desc) + '</div>' +
      '<div class="numz-permission-btns">' +
        '<button class="numz-perm-allow" data-action="allow">Allow</button>' +
        '<button class="numz-perm-deny" data-action="deny">Deny</button>' +
        '<button class="numz-perm-always" data-action="always">Always</button>' +
      '</div>';

    perm.querySelectorAll('button').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var action = btn.dataset.action;
        if (ws && ws.readyState === 1) {
          ws.send(JSON.stringify({
            type: 'control_response',
            request_id: ev.request_id,
            response: { type: 'can_use_tool', allowed: action !== 'deny', remember: action === 'always' }
          }));
        }
        perm.remove();
      });
    });

    messagesEl.appendChild(perm);
    scrollBottom();
  }

  // ── Spinner ──────────────────────────────────────────────────────────

  // Same verb list as TUI (from numz/src/constants/spinnerVerbs.ts)
  var NUMZ_WORDS = ['kaisum','gunnersum','loversum','kissykinky','kinkynumz','kissybaby','kissylover','namakaisum','aciccia','numz','numanumz','akinaaaaaa','buggaboo','gucciboo','pradababy','seepybaby','kissylovernum','kissykaisum','namakinaaa','kinaaaaa','bubbakas','bubbas','tittytoos','tittytoosforbuggaboos','kina anamakina','ijustababy','shesjustababy','webabies','lubu','laboooboo','keesum','Mr.woodpecker','Megatron','Mushroom','Mashroooommm','Cuddlebaby','Ppnumz','Penits','Bigsquishy','Bacockkkk','peenar','californiaaa','daygo','tummywummies'];

  // Glasses SVG for spinner icon (same as logo, inline)
  var GLASSES_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 55" style="width:20px;height:11px;vertical-align:middle;margin-right:8px;animation:numz-glasses-pulse 1.2s ease-in-out infinite"><g fill="none" stroke="#ec4899" stroke-linecap="round" stroke-linejoin="round" transform="rotate(-2,50,27)"><path d="M10 12 L10 30 Q10 42 22 42 L32 42 Q44 42 44 30 L44 12 L10 12 Z" stroke-width="4.5"/><path d="M54 12 L54 30 Q54 42 66 42 L76 42 Q88 42 88 30 L88 12 L54 12 Z" stroke-width="4.5"/><path d="M44 18 Q49 11 54 18" stroke-width="3.5"/><line x1="10" y1="18" x2="0" y2="16" stroke-width="3.5"/><line x1="88" y1="18" x2="98" y2="16" stroke-width="3.5"/></g></svg>';

  function showSpinner(toolName) {
    if (!spinnerEl || !messagesEl) return;
    // Always move spinner to end of messages (under the most recent content)
    messagesEl.appendChild(spinnerEl);
    _spinnerStart = _spinnerStart || Date.now();
    // Pick random numz word (same as TUI)
    var verb = NUMZ_WORDS[Math.floor(Math.random() * NUMZ_WORDS.length)];
    spinnerEl.style.display = '';
    spinnerEl.innerHTML = GLASSES_SVG +
      '<span class="numz-spinner-verb" style="color:#ec4899">' + esc(verb) + '</span>' +
      '<span class="numz-spinner-elapsed" style="color:#555;margin-left:8px"></span>';

    clearInterval(_spinnerTimer);
    _spinnerTimer = setInterval(function() {
      var elapsed = Math.round((Date.now() - _spinnerStart) / 1000);
      var elEl = spinnerEl.querySelector('.numz-spinner-elapsed');
      if (elEl) elEl.textContent = elapsed + 's';
    }, 1000);
  }

  function clearSpinner() {
    if (spinnerEl) { spinnerEl.style.display = 'none'; spinnerEl.innerHTML = ''; }
    clearInterval(_spinnerTimer);
    _spinnerTimer = null;
    _spinnerStart = 0;
  }

  // ── Render helpers ───────────────────────────────────────────────────

  function addUser(text) {
    if (!messagesEl) return;
    var d = el('div', { className: 'numz-msg-user' });
    d.innerHTML = '<span class="numz-prompt">&#10095;</span>' + esc(text);
    messagesEl.appendChild(d);
    scrollBottom();
  }

  function addSystem(text, level) {
    if (!messagesEl) return;
    var d = el('div', { className: 'numz-msg-system' + (level ? ' ' + level : '') });
    d.textContent = text;
    messagesEl.appendChild(d);
    scrollBottom();
  }

  function scrollBottom() {
    var scroll = document.getElementById('numz-messages-scroll');
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
  }

  function el(tag, props) {
    var e = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function(k) {
        if (k === 'className') e.className = props[k];
        else if (k === 'dataset') Object.assign(e.dataset, props[k]);
        else if (k === 'style') e.style.cssText = props[k];
        else e[k] = props[k];
      });
    }
    return e;
  }

  function esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function renderMarkdown(text) {
    var h = esc(text);
    // Code blocks with language
    h = h.replace(/```(\w*)\n([\s\S]*?)```/g, function(_, lang, code) {
      return '<div class="numz-code-block">' +
        (lang ? '<span class="numz-code-lang">' + lang + '</span>' : '') +
        '<button class="numz-code-copy" onclick="navigator.clipboard.writeText(this.parentElement.querySelector(\'code\').textContent)">copy</button>' +
        '<pre><code>' + code + '</code></pre></div>';
    });
    // Inline code
    h = h.replace(/`([^`]+)`/g, '<span class="numz-inline-code">$1</span>');
    // Bold
    h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic
    h = h.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Headers
    h = h.replace(/^### (.+)$/gm, '<h3 style="color:#fff;font-size:14px;margin:12px 0 4px">$1</h3>');
    h = h.replace(/^## (.+)$/gm, '<h2 style="color:#fff;font-size:15px;margin:14px 0 6px">$1</h2>');
    h = h.replace(/^# (.+)$/gm, '<h1 style="color:#fff;font-size:16px;margin:16px 0 8px">$1</h1>');
    // Lists
    h = h.replace(/^- (.+)$/gm, '<div style="padding-left:16px">&#8226; $1</div>');
    h = h.replace(/^\d+\. (.+)$/gm, function(m, content) {
      return '<div style="padding-left:16px">' + m.match(/^\d+/)[0] + '. ' + content + '</div>';
    });
    // Line breaks
    h = h.replace(/\n/g, '<br>');
    return h;
  }

  function renderDiff(text) {
    var lines = text.split('\n');
    var h = '';
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var cls = 'numz-diff-context';
      if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('diff ')) cls = 'numz-diff-header';
      else if (line.startsWith('@@')) cls = 'numz-diff-header';
      else if (line.startsWith('+')) cls = 'numz-diff-add';
      else if (line.startsWith('-')) cls = 'numz-diff-remove';
      h += '<div class="' + cls + '">' + esc(line) + '</div>';
    }
    return '<div class="numz-diff">' + h + '</div>';
  }

})();
