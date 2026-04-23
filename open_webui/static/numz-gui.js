// numz GUI — full TUI recreated as web GUI components
// Every TUI feature remade for the browser
(function() {
  'use strict';

  var ws, messagesEl, spinnerEl, statusEl, inputEl, cmdMenuEl, sendBtn;
  var currentAssistantEl, streamingText = '', streamingThinking = '';
  var _toolInputBuffers = {};
  var _spinnerTimer = null;
  var _spinnerStart = 0;
  var _activeTasks = {}; // task_id → {description, status, tool_name}
  var _generating = false;
  var _wsSessionId = '', _wsCwd = '', _wsTarget = null;
  var _intentionalDisconnect = false;
  var _reconnectTimer = null;

  function _connectWebSocket() {
    var proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    var url = proto + '//' + location.host + '/api/numz/ws?session=' + (_wsSessionId || '') + '&cwd=' + encodeURIComponent(_wsCwd || '');
    window._numzSessionId = _wsSessionId;
    ws = new WebSocket(url);
    ws.onopen = function() {
      if (inputEl) inputEl.focus();
      if (_reconnectTimer) { clearTimeout(_reconnectTimer); _reconnectTimer = null; }
    };
    ws.onmessage = function(e) { try { handleEvent(JSON.parse(e.data)); } catch(err) {} };
    ws.onclose = function() {
      if (_intentionalDisconnect) return;
      // Auto-reconnect after 1 second
      _reconnectTimer = setTimeout(function() {
        if (!_intentionalDisconnect) _connectWebSocket();
      }, 1000);
    };
    ws.onerror = function() {};
  }

  var ARROW_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
  var STOP_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm6-2.438c0-.724.588-1.312 1.313-1.312h4.874c.725 0 1.313.588 1.313 1.313v4.874c0 .725-.588 1.313-1.313 1.313H9.564a1.312 1.312 0 01-1.313-1.313V9.564z" clip-rule="evenodd"/></svg>';

  function setGenerating(on) {
    _generating = on;
    if (sendBtn) {
      sendBtn.innerHTML = on ? STOP_SVG : ARROW_SVG;
    }
    // Show/hide ESC hint
    var hint = document.getElementById('numz-esc-hint');
    if (hint) hint.style.display = on ? '' : 'none';
  }

  // ── Public API ───────────────────────────────────────────────────────

  window.numzGui = {
    connect: function(sessionId, cwd, target) {
      target.innerHTML = '';
      var app = el('div', { id: 'numz-app' });
      var mainWrap = el('div', { id: 'numz-main-wrap' });

      // Messages scroll
      var scroll = el('div', { id: 'numz-messages-scroll' });
      messagesEl = el('div', { id: 'numz-messages' });
      // Spinner created but NOT appended yet — showSpinner appends it to the end each time
      spinnerEl = el('div', { className: 'numz-spinner', style: 'display:none' });
      scroll.appendChild(messagesEl);
      mainWrap.appendChild(scroll);

      // Status line — shows model, workspace, tokens + panels button
      statusEl = el('div', { id: 'numz-status' });
      var cwdDisplay = cwd ? cwd.replace(/^\/home\/\w+\//, '~/') : '~';

      // Git + Files side panels — content pushes over like chat mode's right panel
      var _numzPanelEl = null;
      var _numzActivePanel = null;
      var _numzMainWrap = null; // wraps scroll+status+input, shrinks when panel opens

      function gitCmd(command) {
        return fetch('/api/numz/git', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: command, cwd: _wsCwd || '' })
        }).then(function(r) { return r.json(); });
      }

      function togglePanel(name) {
        if (_numzActivePanel === name) { closePanel(); return; }
        _numzActivePanel = name;
        updatePanelBtnStyles();
        if (!_numzPanelEl) {
          _numzPanelEl = el('div', { id: 'numz-side-panel' });
          _numzPanelEl.style.cssText = 'width:320px;flex-shrink:0;background:#111;border-left:1px solid rgba(255,255,255,0.08);overflow-y:auto;font-size:12px';
          // Insert as sibling of main wrap inside the flex row
          app.appendChild(_numzPanelEl);
        }
        if (name === 'git') loadGitPanel();
        else if (name === 'files') loadFilesPanel();
      }

      function closePanel() {
        if (_numzPanelEl) { _numzPanelEl.remove(); _numzPanelEl = null; }
        _numzActivePanel = null;
        updatePanelBtnStyles();
      }

      function updatePanelBtnStyles() {
        gitBtn.style.color = _numzActivePanel === 'git' ? '#fff' : '#888';
        gitBtn.style.borderColor = _numzActivePanel === 'git' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)';
        filesBtn.style.color = _numzActivePanel === 'files' ? '#fff' : '#888';
        filesBtn.style.borderColor = _numzActivePanel === 'files' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)';
      }

      function loadGitPanel() {
        if (!_numzPanelEl) return;
        _numzPanelEl.innerHTML = '<div style="padding:12px;color:#666">Loading...</div>';
        Promise.all([
          gitCmd('git status --porcelain 2>/dev/null'),
          gitCmd('git branch --show-current 2>/dev/null'),
          gitCmd("git branch -a --sort=-committerdate --format='%(refname:short)\t%(HEAD)\t%(committerdate:relative)' 2>/dev/null"),
        ]).then(function(results) {
          if (!_numzPanelEl) return;
          var statusOut = (results[0].output || '').trim();
          var branch = (results[1].output || '').trim();
          var branchLines = (results[2].output || '').trim().split('\n').filter(Boolean);
          // Header
          var h = '<div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between">' +
            '<span style="font-weight:600;color:#e5e5e5;font-size:13px">Git</span>' +
            '<div style="display:flex;align-items:center;gap:6px"><span style="font-family:monospace;color:#888;font-size:11px">' + esc(branch) + '</span>' +
            '<button id="numz-panel-close" style="background:none;border:none;color:#555;cursor:pointer;font-size:16px;padding:0 2px">&times;</button></div></div>';
          // Status
          var modified = [], staged = [], untracked = [];
          statusOut.split('\n').forEach(function(line) {
            if (line.length < 3) return;
            var x = line[0], y = line[1], f = line.slice(3).trim();
            if (x === '?' && y === '?') untracked.push(f);
            else if ('MADRC'.indexOf(x) >= 0) staged.push(f);
            if ('MD'.indexOf(y) >= 0) modified.push(f);
          });
          if (!modified.length && !staged.length && !untracked.length) {
            h += '<div style="padding:16px;text-align:center;color:#555">Working tree clean</div>';
          } else {
            modified.forEach(function(f) { h += '<div style="padding:3px 14px;color:#eab308;font-family:monospace;font-size:11px">M ' + esc(f) + '</div>'; });
            staged.forEach(function(f) { h += '<div style="padding:3px 14px;color:#22c55e;font-family:monospace;font-size:11px">S ' + esc(f) + '</div>'; });
            untracked.forEach(function(f) { h += '<div style="padding:3px 14px;color:#555;font-family:monospace;font-size:11px">? ' + esc(f) + '</div>'; });
          }
          // Commit & push
          h += '<div style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06)">' +
            '<div style="display:flex;gap:6px"><input id="numz-git-msg" type="text" placeholder="Commit message..." style="flex:1;padding:6px 10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;color:#ccc;font-size:11px;outline:none">' +
            '<button id="numz-git-commit" style="padding:6px 10px;border-radius:6px;border:none;background:#e5e5e5;color:#1a1a1a;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap">Commit & Push</button></div>' +
            '<div style="display:flex;gap:6px;margin-top:6px">' +
            '<button id="numz-git-pull" style="flex:1;padding:5px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);background:none;color:#aaa;font-size:11px;cursor:pointer">Pull</button>' +
            '<button id="numz-git-push" style="flex:1;padding:5px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);background:none;color:#aaa;font-size:11px;cursor:pointer">Push</button></div></div>';
          // Branches
          h += '<div style="padding:8px 14px;border-top:1px solid rgba(255,255,255,0.06)"><div style="font-weight:600;color:#aaa;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">Branches</div>';
          branchLines.forEach(function(line) {
            var parts = line.split('\t');
            var name = (parts[0] || '').trim().replace(/^'|'$/g, '');
            var isCurrent = (parts[1] || '').trim() === '*';
            var date = (parts[2] || '').trim().replace(/^'|'$/g, '');
            if (!name || name.startsWith('origin/HEAD')) return;
            var icon = isCurrent ? '<span style="color:#22c55e;margin-right:6px">●</span>' : (name.startsWith('origin/') ? '<span style="color:#555;margin-right:6px">↗</span>' : '<span style="color:#444;margin-right:6px">○</span>');
            h += '<div style="padding:3px 0;display:flex;align-items:center">' + icon +
              '<span style="flex:1;font-family:monospace;color:' + (isCurrent ? '#e5e5e5' : '#888') + ';font-size:11px;overflow:hidden;text-overflow:ellipsis">' + esc(name) + '</span>' +
              '<span style="color:#555;font-size:10px;margin-left:8px">' + esc(date) + '</span></div>';
          });
          h += '</div>';
          _numzPanelEl.innerHTML = h;
          // Wire buttons
          document.getElementById('numz-panel-close')?.addEventListener('click', closePanel);
          document.getElementById('numz-git-commit')?.addEventListener('click', function() {
            var msg = document.getElementById('numz-git-msg')?.value || '';
            if (!msg.trim()) return;
            this.textContent = '...';
            gitCmd("git add -A && git commit -m '" + msg.replace(/'/g, "'\\''") + "' && git push 2>&1 || git push -u origin $(git branch --show-current) 2>&1").then(function() { loadGitPanel(); });
          });
          document.getElementById('numz-git-pull')?.addEventListener('click', function() { this.textContent = '...'; gitCmd('git pull 2>&1').then(function() { loadGitPanel(); }); });
          document.getElementById('numz-git-push')?.addEventListener('click', function() { this.textContent = '...'; gitCmd('git push 2>&1 || git push -u origin $(git branch --show-current) 2>&1').then(function() { loadGitPanel(); }); });
        });
      }

      function loadFilesPanel() {
        if (!_numzPanelEl) return;
        _numzPanelEl.innerHTML = '<div style="padding:12px;color:#666">Loading...</div>';
        fetch('/api/numz/browse?path=' + encodeURIComponent(_wsCwd || '~'))
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (!_numzPanelEl) return;
            var h = '<div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between">' +
              '<div><span style="font-weight:600;color:#e5e5e5;font-size:13px">Files</span>' +
              '<span style="font-family:monospace;color:#555;font-size:11px;margin-left:8px">' + esc(data.display || '') + '</span></div>' +
              '<button id="numz-panel-close" style="background:none;border:none;color:#555;cursor:pointer;font-size:16px;padding:0 2px">&times;</button></div>';
            if (data.parent) {
              h += '<div class="numz-fp-entry" data-path="' + esc(data.parent) + '" style="padding:6px 14px;cursor:pointer;color:#aaa;font-size:12px">..</div>';
            }
            (data.entries || []).forEach(function(e) {
              var gitBadge = e.git ? '<span style="font-size:9px;padding:1px 4px;border-radius:3px;background:rgba(245,158,11,0.1);color:#f59e0b;margin-left:auto">git</span>' : '';
              h += '<div class="numz-fp-entry" data-path="' + esc(e.path) + '" style="padding:6px 14px;cursor:pointer;display:flex;align-items:center;gap:8px">' +
                '<span style="color:#888">📁</span><span style="color:#ccc;font-size:12px">' + esc(e.name) + '</span>' + gitBadge + '</div>';
            });
            _numzPanelEl.innerHTML = h;
            document.getElementById('numz-panel-close')?.addEventListener('click', closePanel);
            _numzPanelEl.querySelectorAll('.numz-fp-entry').forEach(function(entry) {
              entry.addEventListener('click', function() { _wsCwd = entry.dataset.path; loadFilesPanel(); });
              entry.addEventListener('mouseover', function() { entry.style.background = 'rgba(255,255,255,0.04)'; });
              entry.addEventListener('mouseout', function() { entry.style.background = ''; });
            });
          });
      }

      // Git button (branch icon)
      var gitBtn = el('button', { id: 'numz-git-btn' });
      gitBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M9.5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm-4 5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM4 8.084V9.4a3 3 0 1 0 1.5.082v-2.17A3.001 3.001 0 0 0 8 4.5h1.586l-.293.293a.5.5 0 0 0 .707.707l1.146-1.146a.5.5 0 0 0 0-.708L10 2.5a.5.5 0 0 0-.707.707L9.586 3.5H8a4.5 4.5 0 0 0-4 2.084Z" clip-rule="evenodd"/></svg>';
      gitBtn.title = 'Git';
      gitBtn.style.cssText = 'background:none;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#888;cursor:pointer;padding:4px 6px;display:flex;align-items:center';
      gitBtn.addEventListener('click', function() { togglePanel('git'); });

      // Files button (folder icon)
      var filesBtn = el('button', { id: 'numz-files-btn' });
      filesBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
      filesBtn.title = 'Files';
      filesBtn.style.cssText = 'background:none;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#888;cursor:pointer;padding:4px 6px;display:flex;align-items:center';
      filesBtn.addEventListener('click', function() { togglePanel('files'); });

      statusEl.innerHTML = '<span class="numz-status-model">numz</span><span class="numz-status-cwd" style="color:#888">' + esc(cwdDisplay) + '</span>';
      var btnGroup = el('div');
      btnGroup.style.cssText = 'display:flex;gap:4px;margin-left:auto';
      btnGroup.appendChild(gitBtn);
      btnGroup.appendChild(filesBtn);
      statusEl.appendChild(btnGroup);
      mainWrap.appendChild(statusEl);

      // Task/agent tracker — shows running background tasks
      var taskBar = el('div', { id: 'numz-taskbar', style: 'display:none;max-width:52rem;margin:0 auto;width:100%;padding:0 16px' });
      mainWrap.appendChild(taskBar);

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

      sendBtn = el('button', { className: 'numz-send-btn' });
      sendBtn.innerHTML = ARROW_SVG;
      sendBtn.addEventListener('click', function() {
        if (_generating) { sendInterrupt(); } else { sendMessage(); }
      });
      inputBar.appendChild(sendBtn);

      // ESC hint — shown while generating
      var escHint = el('div', { id: 'numz-esc-hint' });
      escHint.textContent = 'press esc to interrupt';
      escHint.style.cssText = 'display:none;position:absolute;top:-20px;left:50%;transform:translateX(-50%);font-size:11px;color:#666;white-space:nowrap';
      inputBar.appendChild(escHint);

      // Slash command menu
      cmdMenuEl = el('div', { className: 'numz-cmd-menu' });
      inputBar.appendChild(cmdMenuEl);

      mainWrap.appendChild(inputBar);
      app.appendChild(mainWrap);
      target.appendChild(app);

      // Connect WebSocket — auto-reconnects on disconnect
      _wsSessionId = sessionId;
      _wsCwd = cwd;
      _wsTarget = target;
      _intentionalDisconnect = false;
      _connectWebSocket();
      inputEl.focus();
    },

    disconnect: function() {
      _intentionalDisconnect = true;
      if (ws) { ws.close(); ws = null; }
      clearSpinner();
      setGenerating(false);
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
    if (e.key === 'Escape') {
      // Check permission prompt first
      var openPerm = document.querySelector('.numz-permission');
      if (openPerm) {
        var denyBtn = openPerm.querySelector('[data-action="deny"]');
        if (denyBtn) denyBtn.click();
      } else if (cmdMenuEl && cmdMenuEl.classList.contains('open')) {
        cmdMenuEl.classList.remove('open');
      } else if (_generating) {
        sendInterrupt();
      }
      e.preventDefault();
    }
    if (e.key === '/' && inputEl.value === '') { showCmdMenu(); }
  }

  // Global ESC handler — works even when input is not focused
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    // Only handle if we're in code mode (numz container visible)
    var nc = document.getElementById('numz-container');
    if (!nc || nc.style.display === 'none') return;
    // Check if a permission prompt is open — ESC = deny
    var openPerm = document.querySelector('.numz-permission');
    if (openPerm) {
      var denyBtn = openPerm.querySelector('[data-action="deny"]');
      if (denyBtn) denyBtn.click();
      e.preventDefault();
      return;
    }
    // Always send interrupt — works for generating, permission waits, everything
    sendInterrupt();
    e.preventDefault();
  });

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
    setGenerating(true);
    if (window._numzUpdateSessionStatus) window._numzUpdateSessionStatus('unread');
    ws.send(JSON.stringify({ type: 'user', message: { role: 'user', content: text } }));
  }

  function renderTaskBar() {
    var bar = document.getElementById('numz-taskbar');
    if (!bar) return;
    var keys = Object.keys(_activeTasks);
    if (keys.length === 0) { bar.style.display = 'none'; return; }
    bar.style.display = '';
    var h = '';
    keys.forEach(function(tid) {
      var t = _activeTasks[tid];
      h += '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:12px">' +
        '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#f59e0b;animation:pulse 1.5s ease-in-out infinite"></span>' +
        '<span style="color:#f59e0b">' + esc(t.description || 'Agent') + '</span>' +
        (t.tool_name ? '<span style="color:#555">' + esc(t.tool_name) + '</span>' : '') +
      '</div>';
    });
    bar.innerHTML = h;
  }

  function sendInterrupt() {
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'interrupt' }));
      setGenerating(false);
    }
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
    else console.log('[numz-gui] unhandled event type:', type, JSON.stringify(ev).substring(0, 200));
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

    // Keep card closed by default — user can click to expand

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
    if (sub === 'state_sync') {
      // Server tells us current session state on connect/reconnect
      var serverState = ev.state || 'idle';
      if (serverState === 'generating') {
        setGenerating(true);
        showSpinner('numz');
      } else {
        setGenerating(false);
        clearSpinner();
      }
      return;
    }
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
    else if (sub === 'task_started') {
      _activeTasks[ev.task_id || Math.random()] = { description: ev.description || 'Agent', status: 'running', tool_name: ev.tool_name || '' };
      renderTaskBar();
    }
    else if (sub === 'task_progress') {
      var tid = ev.task_id;
      if (tid && _activeTasks[tid]) {
        _activeTasks[tid].description = ev.description || _activeTasks[tid].description;
        _activeTasks[tid].tool_name = ev.last_tool_name || _activeTasks[tid].tool_name;
        renderTaskBar();
      }
    }
    else if (sub === 'task_notification') {
      var tid2 = ev.task_id;
      if (tid2 && _activeTasks[tid2]) {
        if (ev.status === 'completed' || ev.status === 'failed' || ev.status === 'stopped') {
          delete _activeTasks[tid2];
          renderTaskBar();
        }
      }
      if (ev.summary) addSystem((ev.status === 'failed' ? 'Failed: ' : 'Done: ') + ev.summary, ev.status === 'failed' ? 'error' : '');
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

    setGenerating(false);
    if (inputEl) { inputEl.disabled = false; inputEl.focus(); }
    scrollBottom();
  }

  // ── Permission prompts ───────────────────────────────────────────────

  function handleControlRequest(ev) {
    console.log('[numz-gui] control_request received:', JSON.stringify(ev).substring(0, 500));
    if (window._numzUpdateSessionStatus) window._numzUpdateSessionStatus('approval');
    if (!ev.request_id) { console.log('[numz-gui] no request_id, bailing'); return; }
    var req = ev.request || {};
    if (req.subtype !== 'can_use_tool' && req.type !== 'can_use_tool') { console.log('[numz-gui] not can_use_tool, subtype=' + req.subtype + ' type=' + req.type); return; }

    var tool = req.tool_name || 'Unknown';
    var input = req.input || {};

    // Format the permission message like the TUI does for each tool type
    var title = '';
    var detail = '';
    var detailStyle = 'color:#888;font-size:12px;font-family:monospace;white-space:pre-wrap;max-height:200px;overflow-y:auto;margin-bottom:12px;padding:8px 10px;background:rgba(255,255,255,0.02);border-radius:6px';

    switch (tool) {
      case 'Write':
      case 'FileWriteTool':
        title = 'Write to ' + esc(input.file_path || '');
        detail = input.content ? esc((input.content || '').substring(0, 500)) + (input.content.length > 500 ? '\n...' : '') : '';
        break;
      case 'Edit':
      case 'FileEditTool':
        title = 'Edit ' + esc(input.file_path || '');
        var old_s = input.old_string || input.old_text || '';
        var new_s = input.new_string || input.new_text || '';
        detail = '<span style="color:#ef4444">- ' + esc(old_s.substring(0, 300)) + '</span>\n<span style="color:#22c55e">+ ' + esc(new_s.substring(0, 300)) + '</span>';
        break;
      case 'Bash':
      case 'BashTool':
        title = 'Run command';
        detail = esc(input.command || input.description || '');
        break;
      case 'Read':
      case 'FileReadTool':
        title = 'Read ' + esc(input.file_path || '');
        break;
      case 'Glob':
      case 'GlobTool':
        title = 'Search files: ' + esc(input.pattern || '');
        break;
      case 'Grep':
      case 'GrepTool':
        title = 'Search content: ' + esc(input.pattern || '');
        break;
      case 'NotebookEdit':
      case 'NotebookEditTool':
        title = 'Edit notebook ' + esc(input.notebook_path || '');
        break;
      default:
        title = tool;
        detail = esc(input.description || input.command || input.file_path || JSON.stringify(input).substring(0, 300));
    }

    var perm = el('div', { className: 'numz-permission' });
    var permOptions = [
      { key: '1', action: 'allow', label: 'Yes', cls: 'numz-perm-allow' },
      { key: '2', action: 'always', label: 'Yes, always', cls: 'numz-perm-always' },
      { key: '3', action: 'deny', label: 'No', cls: 'numz-perm-deny' },
    ];
    var permFocused = 0;
    var permInFeedback = false;

    perm.innerHTML =
      '<div class="numz-permission-title">' + title + '</div>' +
      (detail ? '<div style="' + detailStyle + '">' + detail + '</div>' : '') +
      '<div style="font-size:12px;color:#888;margin-bottom:8px">Do you want to proceed? <span style="color:#555">(↑↓ or 1-3)</span></div>' +
      '<div class="numz-permission-opts"></div>' +
      '<div id="numz-perm-feedback-' + ev.request_id + '" style="display:none;margin-top:8px">' +
        '<input type="text" placeholder="Tell numz what to do differently..." style="width:100%;padding:6px 10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;color:#ccc;font-size:12px;outline:none">' +
      '</div>';

    var optsEl = perm.querySelector('.numz-permission-opts');
    permOptions.forEach(function(opt, i) {
      var row = el('div', { className: 'numz-perm-opt ' + opt.cls });
      row.dataset.action = opt.action;
      row.dataset.idx = i;
      row.innerHTML = '<span class="numz-perm-key">' + opt.key + '</span><span>' + opt.label + '</span>';
      row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;border-radius:8px;margin:2px 0;transition:background 0.1s';
      row.addEventListener('click', function() { selectPermOption(i); });
      row.addEventListener('mouseover', function() { permFocused = i; highlightPermOption(); });
      optsEl.appendChild(row);
    });

    function highlightPermOption() {
      optsEl.querySelectorAll('.numz-perm-opt').forEach(function(r, i) {
        r.style.background = i === permFocused ? 'rgba(255,255,255,0.06)' : '';
        r.querySelector('.numz-perm-key').style.background = i === permFocused ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)';
      });
    }

    function selectPermOption(idx) {
      var opt = permOptions[idx];
      if (!opt) return;
      if (opt.action === 'deny') {
        // Show feedback input
        permInFeedback = true;
        var fb = document.getElementById('numz-perm-feedback-' + ev.request_id);
        if (fb) { fb.style.display = ''; var inp = fb.querySelector('input'); if (inp) inp.focus(); }
      } else {
        sendPermResponse(opt.action);
      }
    }

    function sendPermResponse(action, feedback) {
      // Remove keyboard handler
      document.removeEventListener('keydown', permKeyHandler);
      if (ws && ws.readyState === 1) {
        var resp = { behavior: action === 'deny' ? 'deny' : 'allow' };
        if (action === 'always') {
          resp.updatedPermissions = [{ type: 'addRules', rules: [{ toolName: tool }], behavior: 'allow', destination: 'localSettings' }];
        }
        if (action === 'deny' && feedback) {
          resp.message = feedback;
        }
        ws.send(JSON.stringify({
          type: 'control_response',
          request_id: ev.request_id,
          response: { subtype: 'success', request_id: ev.request_id, response: resp }
        }));
      }
      perm.remove();
      if (window._numzUpdateSessionStatus) window._numzUpdateSessionStatus('working');
    }

    // Keyboard navigation
    function permKeyHandler(e) {
      if (permInFeedback) {
        // In feedback mode — Enter sends, Escape cancels
        if (e.key === 'Enter') {
          var fbInput = perm.querySelector('#numz-perm-feedback-' + ev.request_id + ' input');
          sendPermResponse('deny', fbInput ? fbInput.value : '');
          e.preventDefault();
        } else if (e.key === 'Escape') {
          sendPermResponse('deny', '');
          e.preventDefault();
        }
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'k') { permFocused = Math.max(0, permFocused - 1); highlightPermOption(); e.preventDefault(); }
      else if (e.key === 'ArrowDown' || e.key === 'j') { permFocused = Math.min(permOptions.length - 1, permFocused + 1); highlightPermOption(); e.preventDefault(); }
      else if (e.key === 'Enter') { selectPermOption(permFocused); e.preventDefault(); }
      else if (e.key === '1') { selectPermOption(0); e.preventDefault(); }
      else if (e.key === '2') { selectPermOption(1); e.preventDefault(); }
      else if (e.key === '3') { selectPermOption(2); e.preventDefault(); }
      else if (e.key === 'Escape') { sendPermResponse('deny', ''); e.preventDefault(); }
      else if (e.key === 'y' || e.key === 'Y') { selectPermOption(0); e.preventDefault(); }
      else if (e.key === 'n' || e.key === 'N') { selectPermOption(2); e.preventDefault(); }
    }
    document.addEventListener('keydown', permKeyHandler);

    highlightPermOption();
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
    // Wrap each character in a span for the shimmer sweep animation
    var verbChars = '';
    for (var ci = 0; ci < verb.length; ci++) {
      verbChars += '<span class="numz-shimmer-char" style="animation-delay:' + (ci * 0.08) + 's">' + esc(verb[ci]) + '</span>';
    }
    spinnerEl.innerHTML = GLASSES_SVG +
      '<span class="numz-spinner-verb">' + verbChars + '<span style="color:#ec4899">…</span></span>' +
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
