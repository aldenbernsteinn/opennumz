// === Replace logos and branding ===
(function() {
  var LOGO_DATA = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20100%2055%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20transform%3D%22rotate%28-2%2C50%2C27%29%22%3E%3Cpath%20d%3D%22M10%2012%20L10%2030%20Q10%2042%2022%2042%20L32%2042%20Q44%2042%2044%2030%20L44%2012%20L10%2012%20Z%22%20stroke-width%3D%224.5%22/%3E%3Cpath%20d%3D%22M54%2012%20L54%2030%20Q54%2042%2066%2042%20L76%2042%20Q88%2042%2088%2030%20L88%2012%20L54%2012%20Z%22%20stroke-width%3D%224.5%22/%3E%3Cpath%20d%3D%22M44%2018%20Q49%2011%2054%2018%22%20stroke-width%3D%223.5%22/%3E%3Cline%20x1%3D%2210%22%20y1%3D%2218%22%20x2%3D%220%22%20y2%3D%2216%22%20stroke-width%3D%223.5%22/%3E%3Cline%20x1%3D%2288%22%20y1%3D%2218%22%20x2%3D%2298%22%20y2%3D%2216%22%20stroke-width%3D%223.5%22/%3E%3C/g%3E%3C/svg%3E';
  function fixBranding() {
    var imgs = document.querySelectorAll('img[src*="favicon"], img[src*="logo"], img[src*="splash"], img.sidebar-new-chat-icon');
    for (var i = 0; i < imgs.length; i++) if (imgs[i].src !== LOGO_DATA) imgs[i].src = LOGO_DATA;
    var nameEl = document.getElementById('sidebar-webui-name');
    if (nameEl && nameEl.textContent !== 'OpenNumz') nameEl.textContent = 'OpenNumz';
  }
  setInterval(fixBranding, 1500);
})();


// === Sidebar buttons (Quiz + Jarvis + Mode Slider) — injected together ===
(function() {
  if (['/code','/jarvis','/quiz'].indexOf(window.location.pathname) !== -1) return;
  function inject() {
    if (document.getElementById('sidebar-custom-btns')) return;
    var btn = document.getElementById('sidebar-new-chat-button');
    if (!btn || btn.classList.contains('hidden')) {
      var all = document.querySelectorAll('#sidebar-new-chat-button');
      btn = null;
      for (var i = 0; i < all.length; i++) { if (!all[i].classList.contains('hidden')) { btn = all[i]; break; } }
      if (!btn) return;
    }
    var container = btn.closest('div.pb-1\\.5') || btn.parentElement?.parentElement;
    if (!container) return;
    var wrap = document.createElement('div');
    wrap.id = 'sidebar-custom-btns';
    wrap.className = 'sidebar-custom-btns';
    wrap.innerHTML = '<a href="/quiz" class="sidebar-link-btn">Quiz</a><a href="/jarvis" class="sidebar-link-btn">Jarvis</a>';
    container.parentElement.insertBefore(wrap, container.nextSibling);
  }
  new MutationObserver(inject).observe(document.documentElement, { childList: true, subtree: true });
})();


// === Thinking toggle ===
(function() {
  var thinkingOn = false, apiToken = null;
  function getToken() {
    if (apiToken) return Promise.resolve(apiToken);
    return fetch('/api/v1/auths/signin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@localhost', password: 'admin' }) })
      .then(function(r) { return r.json(); }).then(function(d) { apiToken = d.token; return apiToken; });
  }
  var BASE = 'You are a helpful assistant named numz. Never say you are Qwen or made by Alibaba.\n\nThe current date and time is {{CURRENT_DATETIME}}.';
  function setThinking(on) { thinkingOn = on; getToken().then(function(t) { fetch('/api/v1/models/model/update', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + t }, body: JSON.stringify({ id: 'numz', name: 'numz', base_model_id: 'numz', params: { system: on ? BASE + '\n\n/think' : BASE }, meta: { description: 'Qwen 3.6 35B-A3B' } }) }); }); }
  function inject() {
    if (document.getElementById('thinking-toggle-btn')) return;
    var s = document.getElementById('send-message-button'); if (!s) return;
    var btn = document.createElement('button');
    btn.id = 'thinking-toggle-btn'; btn.type = 'button';
    btn.className = 'thinking-toggle-btn' + (thinkingOn ? ' active' : '');
    btn.textContent = 'Think'; btn.title = thinkingOn ? 'ON' : 'OFF';
    btn.onclick = function(e) { e.preventDefault(); e.stopPropagation(); thinkingOn = !thinkingOn; btn.classList.toggle('active', thinkingOn); btn.title = thinkingOn ? 'ON' : 'OFF'; setThinking(thinkingOn); };
    s.parentElement.insertBefore(btn, s);
  }
  setInterval(inject, 2000);
})();


// === Code / Chat toggle — two separate worlds ===
(function() {
  var codeMode = sessionStorage.getItem('numzCodeMode') === 'true';
  var codePinVerified = sessionStorage.getItem('numzCodePin') === 'true';
  var folderFilter = '';
  var _pinInProgress = false;
  var _sliderInjected = false;
  var _codeModeRestored = false;
  var _numzContainer = null; // our code view container, sibling of sidebar's parent content

  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;'); }
  window._numzFilterFolder = function(v) { folderFilter = v; showCodeSessions(); };

  // ── Slider injection ─────────────────────────────────────────────
  function injectSlider() {
    if (_sliderInjected) return;
    if (document.getElementById('mode-slider')) { _sliderInjected = true; return; }
    // Insert before sidebar-custom-btns if it exists, otherwise after new chat button area
    var btns = document.getElementById('sidebar-custom-btns');
    if (!btns) {
      var ncb = document.getElementById('sidebar-new-chat-button');
      if (!ncb) return;
      var c = ncb.closest('div.pb-1\\.5') || ncb.parentElement?.parentElement;
      if (!c) return;
      btns = c; // insert after this instead
    }
    var slider = document.createElement('div');
    slider.id = 'mode-slider';
    slider.className = 'mode-slider';
    slider.innerHTML = '<div class="mode-slider-track"><button class="mode-slider-btn' + (codeMode ? '' : ' active') + '" data-mode="chat">Chat</button><button class="mode-slider-btn' + (codeMode ? ' active' : '') + '" data-mode="code">Code</button></div>';
    btns.parentElement.insertBefore(slider, btns);
    _sliderInjected = true;
    slider.querySelectorAll('.mode-slider-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var mode = btn.dataset.mode;
        if (mode === 'code' && !codePinVerified) {
          if (_pinInProgress) return;
          _pinInProgress = true;
          var pin = prompt('Enter Code PIN:');
          _pinInProgress = false;
          if (!pin) return;
          fetch('/api/code/verify-pin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin: pin }) }).then(function(r) { if (r.ok) { codePinVerified = true; sessionStorage.setItem('numzCodePin', 'true'); switchMode('code'); } else { alert('Wrong PIN'); } });
          return;
        }
        switchMode(mode);
      });
    });
    if (!_codeModeRestored && codeMode && codePinVerified) { _codeModeRestored = true; switchMode('code'); }
  }

  // ── Mode switching ───────────────────────────────────────────────
  function switchMode(mode) {
    codeMode = (mode === 'code');
    sessionStorage.setItem('numzCodeMode', codeMode ? 'true' : 'false');
    document.querySelectorAll('.mode-slider-btn').forEach(function(b) {
      var active = b.dataset.mode === mode;
      b.classList.toggle('active', active);
      b.style.background = active ? 'rgba(255,255,255,0.08)' : 'none';
      b.style.color = active ? '#e0e0e0' : '#666';
    });
    if (codeMode) {
      showCodeSessions();
      // Show numz container if a session was active
      if (_numzContainer) _numzContainer.style.display = '';
    } else {
      hideCodeView();
    }
  }

  // ── numz container — fixed overlay right of sidebar ──────────────
  function ensureNumzContainer() {
    if (_numzContainer && _numzContainer.parentElement) {
      _numzContainer.style.display = '';
      updateContainerPosition();
      return;
    }
    _numzContainer = document.createElement('div');
    _numzContainer.id = 'numz-container';
    _numzContainer.style.cssText = 'position:fixed;top:0;right:0;bottom:0;background:#0a0a0a;z-index:9999;display:flex;flex-direction:column';
    document.body.appendChild(_numzContainer);
    updateContainerPosition();
    _numzContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#444;font-family:monospace;font-size:14px">Select a session</div>';
  }

  function updateContainerPosition() {
    if (!_numzContainer) return;
    var sidebar = document.getElementById('sidebar');
    _numzContainer.style.left = (sidebar ? sidebar.offsetWidth : 0) + 'px';
  }

  function hideCodeView() {
    if (_numzContainer) _numzContainer.style.display = 'none';
    if (window.numzGui) window.numzGui.disconnect();
    // Stop hiding chat items
    if (_chatHideInterval) { clearInterval(_chatHideInterval); _chatHideInterval = null; }
    // Show chat sidebar items back
    document.querySelectorAll('[id="sidebar-chat-item"],[id="sidebar-chat-group"],[id="sidebar-folder-button"]').forEach(function(el) { el.style.display = ''; });
    var list = document.getElementById('numz-sessions-list');
    if (list) list.style.display = 'none';
  }

  // ── Code sessions sidebar ────────────────────────────────────────
  // Keep chat items hidden while in code mode
  var _chatHideInterval = null;
  function hideChatItems() {
    document.querySelectorAll('[id="sidebar-chat-item"],[id="sidebar-chat-group"],[id="sidebar-folder-button"]').forEach(function(el) { el.style.display = 'none'; });
  }

  function showCodeSessions() {
    hideChatItems();
    // Keep hiding chat items as Svelte re-renders them
    if (!_chatHideInterval) _chatHideInterval = setInterval(hideChatItems, 500);

    var url = '/api/numz/sessions';
    if (folderFilter) url += '?folder=' + encodeURIComponent(folderFilter);
    fetch(url).then(function(r) { return r.json(); }).then(function(sessions) {
      var list = document.getElementById('numz-sessions-list');
      if (!list) {
        list = document.createElement('div');
        list.id = 'numz-sessions-list';
        var sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        var scrollArea = sidebar.querySelector('div.relative.flex.flex-col.flex-1');
        if (scrollArea) scrollArea.appendChild(list);
      }
      var h = '<div style="padding:4px 8px 6px"><select onchange="window._numzFilterFolder(this.value)" style="width:100%;padding:5px 8px;background:rgba(255,255,255,0.04);color:#ccc;border:1px solid rgba(255,255,255,0.08);border-radius:8px;font-size:12px;cursor:pointer"><option value="">All projects</option>';
      var folders = {};
      sessions.forEach(function(s) { if (s.folder && !folders[s.folder]) folders[s.folder] = s.project; });
      Object.keys(folders).sort().forEach(function(f) {
        h += '<option value="' + folders[f] + '"' + (folderFilter === folders[f] ? ' selected' : '') + '>' + f + '</option>';
      });
      h += '</select></div>';
      var activeSid = sessionStorage.getItem('numzActiveSession');
      sessions.forEach(function(s) {
        var date = new Date(s.updated_at * 1000);
        var dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        var selected = s.id === activeSid;
        var dot = '', status = s.folder || '~';
        if (s.active) { dot = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;margin-right:8px;animation:pulse 1.5s ease-in-out infinite"></span>'; status = 'AI working'; }
        else if (s.live) { dot = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;margin-right:8px"></span>'; status = 'Active'; }
        h += '<div class="numz-session-item" data-sid="' + s.id + '" data-cwd="' + esc(s.project || '') + '" style="margin:1px 7px;cursor:pointer;padding:10px 12px;border-radius:10px' + (selected ? ';background:rgba(255,255,255,0.06)' : '') + '">' +
          '<div style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center" class="text-gray-800 dark:text-gray-200">' + dot + esc(s.title || 'Untitled').substring(0, 50) + '</div>' +
          '<div style="font-size:11px;margin-top:2px" class="text-gray-500">' + status + ' &middot; ' + dateStr + '</div></div>';
      });
      list.innerHTML = h;
      list.style.display = '';
    });
  }

  // ── New Chat in code mode — intercept the existing New Chat button ──
  document.addEventListener('click', function(e) {
    if (!codeMode) return;
    var btn = e.target.closest('#sidebar-new-chat-button, a[href="/"]');
    if (!btn) return;
    // Only intercept if it's the sidebar new chat button area
    var sidebar = document.getElementById('sidebar');
    if (!sidebar || !sidebar.contains(btn)) return;
    e.preventDefault();
    e.stopPropagation();
    // Clear selection
    document.querySelectorAll('.numz-session-item').forEach(function(el) { el.style.background = ''; });
    sessionStorage.removeItem('numzActiveSession');
    // Start fresh numz session (no session ID)
    ensureNumzContainer();
    if (window.numzGui) window.numzGui.disconnect();
    window.numzGui.connect('', null, _numzContainer);
  }, true); // capture phase to intercept before SvelteKit

  // ── Session click → load into numz-gui ───────────────────────────
  document.addEventListener('click', function(e) {
    var item = e.target.closest('.numz-session-item');
    if (!item) return;
    var sid = item.dataset.sid;
    if (!sid) return;
    var cwd = item.dataset.cwd || '';
    // Highlight
    document.querySelectorAll('.numz-session-item').forEach(function(el) { el.style.background = ''; });
    item.style.background = 'rgba(255,255,255,0.06)';
    sessionStorage.setItem('numzActiveSession', sid);
    openSession(sid, cwd);
  });

  function openSession(sid, cwd) {
    ensureNumzContainer();
    if (window.numzGui) window.numzGui.disconnect();
    // Create the GUI first
    window.numzGui.connect(sid, cwd || null, _numzContainer);
    // Then load history from JSONL
    fetch('/api/numz/sessions/' + sid).then(function(r) { return r.json(); }).then(function(data) {
      if (data.messages && window.numzGui.loadHistory) window.numzGui.loadHistory(data.messages);
    }).catch(function() {});
  }

  // ── Shift+Tab: cycle permission mode (same as TUI — shown in status line) ──
  var _permModes = ['auto', 'bypass', 'plan', 'none'];
  var _permModeIdx = 0;
  document.addEventListener('keydown', function(e) {
    if (!codeMode) return;
    if (!(e.shiftKey && e.key === 'Tab')) return;
    e.preventDefault(); e.stopPropagation();
    _permModeIdx = (_permModeIdx + 1) % _permModes.length;
    var mode = _permModes[_permModeIdx];
    // Store for WebSocket URL
    var numzModeMap = { auto: 'default', bypass: 'dangerously-skip-permissions', plan: 'plan', none: 'default' };
    window._numzPermMode = numzModeMap[mode] || 'default';
    var statusEl = document.getElementById('numz-status');
    if (statusEl) {
      var permEl = statusEl.querySelector('.numz-status-perm');
      if (!permEl) {
        permEl = document.createElement('span');
        permEl.className = 'numz-status-perm';
        statusEl.insertBefore(permEl, statusEl.firstChild.nextSibling);
      }
      var labels = { auto: 'auto-accept', bypass: 'bypass-permissions', plan: 'plan', none: 'manual' };
      var colors = { auto: '#22c55e', bypass: '#ef4444', plan: '#06b6d4', none: '#888' };
      permEl.textContent = labels[mode];
      permEl.style.color = colors[mode];
    }
  });

  // ── Init ─────────────────────────────────────────────────────────
  new MutationObserver(function() { injectSlider(); }).observe(document.documentElement, { childList: true, subtree: true });
})();


// === Settings icon (replaces "user" in chat bar) + model overlay ===
(function() {
  function replaceUserWithSettings() {
    // Find the "user" button/text at bottom-left of chat area
    var userBtns = document.querySelectorAll('button');
    for (var i = 0; i < userBtns.length; i++) {
      var b = userBtns[i];
      if (b.textContent.trim() === 'user' && !b.dataset.numzSettings) {
        b.dataset.numzSettings = 'true';
        b.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
        b.title = 'Settings';
        b.addEventListener('click', function(e) {
          e.preventDefault(); e.stopPropagation();
          toggleSettingsOverlay();
        });
        break;
      }
    }
  }

  function toggleSettingsOverlay() {
    var existing = document.getElementById('numz-settings-overlay');
    if (existing) { existing.remove(); return; }

    var overlay = document.createElement('div');
    overlay.id = 'numz-settings-overlay';
    overlay.style.cssText = 'position:fixed;bottom:60px;left:16px;width:340px;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);border-radius:12px;z-index:9999;padding:20px;font-family:monospace;box-shadow:0 8px 32px rgba(0,0,0,0.5)';

    overlay.innerHTML =
      '<div style="display:flex;gap:16px">' +
        '<div style="flex:1">' +
          '<div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Chat</div>' +
          '<div style="font-size:12px;color:#06b6d4;margin-bottom:8px">qwen3.6-35b-a3b</div>' +
          '<div style="color:#444;font-size:11px">via Open WebUI</div>' +
        '</div>' +
        '<div style="width:1px;background:rgba(255,255,255,0.06)"></div>' +
        '<div style="flex:1">' +
          '<div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Code</div>' +
          '<div style="font-size:12px;color:#ec4899;margin-bottom:8px">qwen3.6-35b-a3b</div>' +
          '<div style="color:#444;font-size:11px">via numz TUI</div>' +
        '</div>' +
      '</div>';

    // Close on click outside
    document.addEventListener('click', function closeOverlay(e) {
      if (!overlay.contains(e.target)) {
        overlay.remove();
        document.removeEventListener('click', closeOverlay);
      }
    });

    document.body.appendChild(overlay);
  }

  setInterval(replaceUserWithSettings, 2000);
})();


// === Strip emojis ===
(function() {
  var re = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu;
  setInterval(function() {
    document.querySelectorAll('[data-message-id] .prose').forEach(function(el) {
      var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      var n; while (n = w.nextNode()) { var c = n.nodeValue.replace(re, ''); if (c !== n.nodeValue) n.nodeValue = c; }
    });
  }, 1000);
})();
