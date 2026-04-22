// numz GUI — renders numz NDJSON events in the browser
// This is the TUI, remade for the web. Every event type rendered.

(function() {
  'use strict';

  var ws = null;
  var container = null;
  var inputEl = null;
  var messagesEl = null;
  var spinnerEl = null;
  var statusEl = null;
  var currentAssistantEl = null;
  var streamingText = '';
  var streamingThinking = '';
  var MONO = "'SF Mono','Cascadia Code','Fira Code',Consolas,monospace";

  // ── Connect to numz ──────────────────────────────────────────────────

  window.numzGui = {
    connect: function(sessionId, cwd, targetEl) {
      container = targetEl;
      container.innerHTML = '';
      container.style.cssText = 'height:100%;display:flex;flex-direction:column;font-family:' + MONO + ';background:#0a0a0a;color:#ccc;font-size:13px;line-height:1.7';

      // Messages area
      messagesEl = document.createElement('div');
      messagesEl.id = 'numz-messages';
      messagesEl.style.cssText = 'flex:1;overflow-y:auto;padding:16px;max-width:52rem;margin:0 auto;width:100%';
      container.appendChild(messagesEl);

      // Spinner area
      spinnerEl = document.createElement('div');
      spinnerEl.id = 'numz-spinner';
      spinnerEl.style.cssText = 'padding:0 16px;max-width:52rem;margin:0 auto;width:100%;display:none';
      container.appendChild(spinnerEl);

      // Status line
      statusEl = document.createElement('div');
      statusEl.id = 'numz-status';
      statusEl.style.cssText = 'padding:4px 16px;font-size:11px;color:#444;border-top:1px solid rgba(255,255,255,0.04);max-width:52rem;margin:0 auto;width:100%';
      container.appendChild(statusEl);

      // Input bar
      var inputBar = document.createElement('div');
      inputBar.style.cssText = 'padding:12px 16px;border-top:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;gap:10px;max-width:52rem;margin:0 auto;width:100%';
      inputBar.innerHTML = '<span style="color:#ec4899;font-weight:700;font-size:16px">&#10095;</span>';
      inputEl = document.createElement('input');
      inputEl.type = 'text';
      inputEl.placeholder = 'Message numz...';
      inputEl.style.cssText = 'flex:1;padding:10px 14px;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:10px;color:#e0e0e0;font-size:14px;font-family:' + MONO + ';outline:none';
      inputEl.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
        if (e.key === 'Escape') {
          sendInterrupt();
        }
      });
      inputBar.appendChild(inputEl);
      container.appendChild(inputBar);

      // Connect WebSocket
      var proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
      var url = proto + '//' + location.host + '/api/numz/ws?session=' + (sessionId || '') + '&cwd=' + encodeURIComponent(cwd || '');
      ws = new WebSocket(url);

      ws.onmessage = function(e) {
        try {
          var ev = JSON.parse(e.data);
          handleEvent(ev);
        } catch(err) {}
      };

      ws.onclose = function() {
        addSystem('Session ended.');
      };

      ws.onerror = function() {
        addSystem('Connection error.');
      };

      inputEl.focus();
    },

    disconnect: function() {
      if (ws) { ws.close(); ws = null; }
    }
  };

  // ── Send message ─────────────────────────────────────────────────────

  function sendMessage() {
    if (!inputEl || !ws || ws.readyState !== 1) return;
    var text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';

    // Render user message
    addUser(text);

    // Send as NDJSON user message
    var msg = JSON.stringify({
      type: 'user',
      message: { role: 'user', content: text }
    });
    ws.send(msg);
  }

  function sendInterrupt() {
    if (!ws || ws.readyState !== 1) return;
    ws.send(JSON.stringify({ type: 'interrupt' }));
  }

  // ── Event handler ────────────────────────────────────────────────────

  function handleEvent(ev) {
    var type = ev.type || '';
    var subtype = ev.subtype || '';

    if (type === 'stream_event') {
      handleStreamEvent(ev);
    } else if (type === 'assistant') {
      finishAssistant(ev);
    } else if (type === 'user') {
      handleUserEvent(ev);
    } else if (type === 'system') {
      handleSystemEvent(ev);
    } else if (type === 'result') {
      handleResult(ev);
    } else if (type === 'control_request') {
      handleControlRequest(ev);
    }
  }

  // ── Stream events (partial assistant messages) ───────────────────────

  function handleStreamEvent(ev) {
    var event = ev.event || {};
    var eventType = event.type || '';

    if (eventType === 'content_block_start') {
      var block = event.content_block || {};
      if (block.type === 'thinking') {
        streamingThinking = '';
        ensureAssistantEl();
      } else if (block.type === 'text') {
        streamingText = '';
        ensureAssistantEl();
      } else if (block.type === 'tool_use') {
        addToolUseStart(block);
      }
    } else if (eventType === 'content_block_delta') {
      var delta = event.delta || {};
      if (delta.type === 'thinking_delta') {
        streamingThinking += delta.thinking || '';
        updateThinkingBlock();
      } else if (delta.type === 'text_delta') {
        streamingText += delta.text || '';
        updateTextBlock();
      } else if (delta.type === 'input_json_delta') {
        updateToolInput(delta.partial_json || '');
      }
    } else if (eventType === 'content_block_stop') {
      // Block finished — handled by full assistant message
    } else if (eventType === 'message_start' || eventType === 'message_delta' || eventType === 'message_stop') {
      // Message lifecycle — result handles completion
    }
  }

  function ensureAssistantEl() {
    if (!currentAssistantEl) {
      currentAssistantEl = document.createElement('div');
      currentAssistantEl.className = 'numz-assistant';
      currentAssistantEl.style.cssText = 'margin:4px 0 12px';
      messagesEl.appendChild(currentAssistantEl);
    }
  }

  function updateTextBlock() {
    ensureAssistantEl();
    var textEl = currentAssistantEl.querySelector('.numz-text');
    if (!textEl) {
      textEl = document.createElement('div');
      textEl.className = 'numz-text';
      textEl.style.cssText = 'color:#b0b0b0';
      currentAssistantEl.appendChild(textEl);
    }
    textEl.innerHTML = renderMarkdown(streamingText);
    scrollToBottom();
  }

  function updateThinkingBlock() {
    ensureAssistantEl();
    var thinkEl = currentAssistantEl.querySelector('.numz-thinking');
    if (!thinkEl) {
      thinkEl = document.createElement('details');
      thinkEl.className = 'numz-thinking';
      thinkEl.style.cssText = 'margin:4px 0 8px;padding:8px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:8px';
      thinkEl.innerHTML = '<summary style="color:#666;cursor:pointer;font-size:12px;user-select:none"><span style="animation:pulse 1.5s ease-in-out infinite">Thinking...</span></summary><div class="numz-thinking-content" style="color:#555;font-size:12px;margin-top:8px;white-space:pre-wrap"></div>';
      currentAssistantEl.insertBefore(thinkEl, currentAssistantEl.firstChild);
    }
    thinkEl.querySelector('.numz-thinking-content').textContent = streamingThinking;
    scrollToBottom();
  }

  function finishAssistant(ev) {
    currentAssistantEl = null;
    streamingText = '';
    streamingThinking = '';
    hideSpinner();
  }

  // ── Tool use ─────────────────────────────────────────────────────────

  var _toolInputBuffer = {};

  function addToolUseStart(block) {
    ensureAssistantEl();
    var toolEl = document.createElement('div');
    toolEl.className = 'numz-tool';
    toolEl.dataset.toolId = block.id || '';
    toolEl.style.cssText = 'margin:8px 0;padding:10px 14px;background:rgba(177,185,249,0.04);border:1px solid rgba(177,185,249,0.1);border-radius:8px';
    toolEl.innerHTML =
      '<div style="display:flex;align-items:center;gap:8px">' +
        '<span style="color:#505050">&#9084;</span>' +
        '<span style="color:#b1b9f9;font-weight:600;font-size:13px">' + esc(block.name || '') + '</span>' +
        '<span class="numz-tool-spinner" style="color:#666;font-size:11px;animation:pulse 1.5s ease-in-out infinite">Running...</span>' +
      '</div>' +
      '<div class="numz-tool-input" style="color:#888;font-size:12px;margin-top:4px;max-height:100px;overflow:hidden"></div>' +
      '<div class="numz-tool-output" style="display:none;margin-top:8px"></div>';
    currentAssistantEl.appendChild(toolEl);
    _toolInputBuffer[block.id] = '';
    scrollToBottom();
  }

  function updateToolInput(partialJson) {
    // Accumulate partial JSON for the current tool
    var toolEls = messagesEl.querySelectorAll('.numz-tool');
    if (toolEls.length === 0) return;
    var lastTool = toolEls[toolEls.length - 1];
    var toolId = lastTool.dataset.toolId;
    _toolInputBuffer[toolId] = (_toolInputBuffer[toolId] || '') + partialJson;
    var inputEl = lastTool.querySelector('.numz-tool-input');
    if (inputEl) {
      try {
        var parsed = JSON.parse(_toolInputBuffer[toolId]);
        var desc = parsed.description || parsed.command || parsed.file_path || parsed.pattern || '';
        inputEl.textContent = desc.substring(0, 200);
      } catch(e) {
        // Still partial — show what we have
        inputEl.textContent = _toolInputBuffer[toolId].substring(0, 200);
      }
    }
  }

  // ── User events (tool results) ──────────────────────────────────────

  function handleUserEvent(ev) {
    var msg = ev.message || {};
    var content = msg.content;
    if (typeof content === 'string' && content.trim()) {
      // Filter metadata
      if (content.startsWith('<local-command') || content.startsWith('<command-name') || content.startsWith('<system-reminder')) return;
      // Regular user message replay
      addUser(content);
      return;
    }
    if (Array.isArray(content)) {
      for (var i = 0; i < content.length; i++) {
        var part = content[i];
        if (part.type === 'tool_result') {
          addToolResult(part);
        } else if (part.type === 'text') {
          if (part.text && !part.text.startsWith('<local-command') && !part.text.startsWith('<system-reminder')) {
            addUser(part.text);
          }
        }
      }
    }
  }

  function addToolResult(result) {
    // Find the tool card and add output
    var toolId = result.tool_use_id;
    var toolEl = messagesEl.querySelector('.numz-tool[data-tool-id="' + toolId + '"]');
    if (!toolEl) {
      toolEl = messagesEl.querySelector('.numz-tool:last-child');
    }
    if (!toolEl) return;

    // Remove spinner
    var spinner = toolEl.querySelector('.numz-tool-spinner');
    if (spinner) spinner.remove();

    var outputEl = toolEl.querySelector('.numz-tool-output');
    if (!outputEl) return;
    outputEl.style.display = '';

    var resultContent = result.content;
    var text = '';
    if (typeof resultContent === 'string') {
      text = resultContent;
    } else if (Array.isArray(resultContent)) {
      text = resultContent.filter(function(p) { return p.type === 'text'; }).map(function(p) { return p.text; }).join('\n');
    }

    if (text.length > 3000) text = text.substring(0, 3000) + '\n... (truncated)';

    // Style based on success/error
    var isError = result.is_error;
    outputEl.innerHTML = '<pre style="background:#0a0a0a;border-left:3px solid ' + (isError ? '#ef4444' : '#ec4899') + ';border-radius:4px;padding:8px 12px;overflow-x:auto;font-size:12px;color:' + (isError ? '#f87171' : '#888') + ';max-height:300px;overflow-y:auto"><code>' + esc(text) + '</code></pre>';
    scrollToBottom();
  }

  // ── System events ────────────────────────────────────────────────────

  function handleSystemEvent(ev) {
    var subtype = ev.subtype || '';
    if (subtype === 'init') {
      var tools = ev.tools || [];
      var model = ev.model || '';
      updateStatus(model, tools.length);
    } else if (subtype === 'tool_progress') {
      showSpinner(ev.tool_name, ev.verb);
    } else if (subtype === 'status') {
      if (ev.status === 'compacting') {
        addSystem('Compacting context...');
      }
    } else if (subtype === 'hook_started') {
      showSpinner(ev.hook_name, 'Running hook');
    } else if (subtype === 'hook_response') {
      hideSpinner();
    } else if (subtype === 'api_retry') {
      addSystem('API retry (attempt ' + (ev.attempt || '?') + ')...');
    }
  }

  function handleResult(ev) {
    hideSpinner();
    currentAssistantEl = null;
    streamingText = '';
    streamingThinking = '';
    if (ev.subtype === 'success') {
      var usage = ev.usage || {};
      var cost = ev.cost_usd;
      var duration = ev.duration_ms;
      var info = [];
      if (duration) info.push(Math.round(duration / 1000) + 's');
      if (usage.output_tokens) info.push(usage.output_tokens + ' tokens');
      if (cost) info.push('$' + cost.toFixed(4));
      if (info.length) {
        updateStatusExtra(info.join(' | '));
      }
    } else if (ev.subtype && ev.subtype.startsWith('error')) {
      addSystem('Error: ' + (ev.error || ev.subtype));
    }
    // Re-enable input
    if (inputEl) { inputEl.disabled = false; inputEl.focus(); }
  }

  // ── Control requests (permissions) ───────────────────────────────────

  function handleControlRequest(ev) {
    if (!ev.request_id) return;
    var request = ev.request || {};
    var type = request.type || '';

    if (type === 'can_use_tool') {
      showPermissionPrompt(ev.request_id, request);
    }
  }

  function showPermissionPrompt(requestId, request) {
    var tool = request.tool_name || 'Unknown';
    var input = request.input || {};
    var desc = input.description || input.command || input.file_path || JSON.stringify(input).substring(0, 200);

    var promptEl = document.createElement('div');
    promptEl.style.cssText = 'margin:8px 0;padding:14px;background:rgba(249,115,22,0.06);border:1px solid rgba(249,115,22,0.15);border-radius:10px';
    promptEl.innerHTML =
      '<div style="color:#f97316;font-weight:600;margin-bottom:8px">Permission: ' + esc(tool) + '</div>' +
      '<div style="color:#888;font-size:12px;margin-bottom:12px">' + esc(desc) + '</div>' +
      '<div style="display:flex;gap:8px">' +
        '<button class="numz-perm-btn" data-action="allow" style="padding:6px 16px;border-radius:8px;border:1px solid rgba(34,197,94,0.3);background:rgba(34,197,94,0.08);color:#22c55e;cursor:pointer;font-size:13px;font-weight:600">Allow</button>' +
        '<button class="numz-perm-btn" data-action="deny" style="padding:6px 16px;border-radius:8px;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);color:#ef4444;cursor:pointer;font-size:13px;font-weight:600">Deny</button>' +
        '<button class="numz-perm-btn" data-action="always" style="padding:6px 16px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#999;cursor:pointer;font-size:13px">Always</button>' +
      '</div>';

    promptEl.querySelectorAll('.numz-perm-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var action = btn.dataset.action;
        var response = {
          type: 'control_response',
          request_id: requestId,
          response: { type: 'can_use_tool', allowed: action !== 'deny', remember: action === 'always' }
        };
        if (ws && ws.readyState === 1) {
          ws.send(JSON.stringify(response));
        }
        promptEl.remove();
      });
    });

    messagesEl.appendChild(promptEl);
    scrollToBottom();
  }

  // ── Spinner ──────────────────────────────────────────────────────────

  function showSpinner(toolName, verb) {
    if (!spinnerEl) return;
    spinnerEl.style.display = '';
    spinnerEl.innerHTML = '<div style="color:#666;font-size:12px;padding:4px 0"><span style="color:#ec4899;animation:pulse 1.5s ease-in-out infinite">&#9679;</span> <span style="color:#888">' + esc(verb || toolName || 'Working') + '...</span></div>';
  }

  function hideSpinner() {
    if (!spinnerEl) return;
    spinnerEl.style.display = 'none';
    spinnerEl.innerHTML = '';
  }

  // ── Status line ──────────────────────────────────────────────────────

  function updateStatus(model, toolCount) {
    if (!statusEl) return;
    statusEl.textContent = (model || 'numz') + (toolCount ? ' | ' + toolCount + ' tools' : '');
  }

  function updateStatusExtra(info) {
    if (!statusEl) return;
    var base = statusEl.textContent.split(' | ').slice(0, 2).join(' | ');
    statusEl.textContent = base + ' | ' + info;
  }

  // ── Render helpers ───────────────────────────────────────────────────

  function addUser(text) {
    var el = document.createElement('div');
    el.style.cssText = 'margin:16px 0 4px;padding:10px 14px;background:#1a1a1a;border-radius:10px;color:#fff;font-size:14px';
    el.innerHTML = '<span style="color:#ec4899;margin-right:8px;font-weight:700">&#10095;</span>' + esc(text);
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function addSystem(text) {
    var el = document.createElement('div');
    el.style.cssText = 'margin:4px 0;padding:6px 12px;color:#666;font-size:12px;font-style:italic';
    el.textContent = text;
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function scrollToBottom() {
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function renderMarkdown(text) {
    // Basic markdown → HTML
    var h = esc(text);
    // Code blocks
    h = h.replace(/```(\w*)\n([\s\S]*?)```/g, function(_, lang, code) {
      return '<pre style="background:#0a0a0a;border-left:3px solid #ec4899;border-radius:4px;padding:10px 12px;margin:6px 0;overflow-x:auto;font-size:12px;color:#999"><code>' + code + '</code></pre>';
    });
    // Inline code
    h = h.replace(/`([^`]+)`/g, '<code style="background:#1a1a1a;padding:1px 5px;border-radius:3px;color:#ec4899">$1</code>');
    // Bold
    h = h.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#fff">$1</strong>');
    // Italic
    h = h.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Line breaks
    h = h.replace(/\n/g, '<br>');
    return h;
  }

})();
