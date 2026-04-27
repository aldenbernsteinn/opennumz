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
  if (['/code','/jarvis','/quiz','/studio'].indexOf(window.location.pathname) !== -1) return;
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
    wrap.innerHTML = '<a href="/studio" class="sidebar-link-btn" onclick="event.preventDefault();window.location.href=\'/studio\'">Studio</a><a href="/quiz" class="sidebar-link-btn" onclick="event.preventDefault();window.location.href=\'/quiz\'">Quiz</a>';
    container.parentElement.insertBefore(wrap, container.nextSibling);
  }
  new MutationObserver(inject).observe(document.documentElement, { childList: true, subtree: true });
})();


// === Thinking toggle ===
// Moved to Svelte source: MessageInput.svelte (id="thinking-toggle-btn")


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
    // On mobile, the toggle goes in the open sidebar via injectMobileSlider — skip here
    if (window.innerWidth < 768) return;
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

  // Inject toggle into the mobile open sidebar too
  function injectMobileSlider() {
    var container = document.querySelector('.mode-slider-mobile');
    if (!container || container.children.length > 0) return;
    var slider = document.createElement('div');
    slider.className = 'mode-slider';
    slider.innerHTML = '<div class="mode-slider-track"><button class="mode-slider-btn' + (codeMode ? '' : ' active') + '" data-mode="chat">Chat</button><button class="mode-slider-btn' + (codeMode ? ' active' : '') + '" data-mode="code">Code</button></div>';
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
    container.appendChild(slider);
  }
  // Keep checking since the sidebar opens/closes dynamically
  setInterval(injectMobileSlider, 500);

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
    updateNewChatButton();
    if (codeMode) {
      showCodeSessions(true);
      if (_numzContainer) _numzContainer.style.display = '';
    } else {
      hideCodeView();
    }
  }

  // Change New Chat button to "New Session" with code icon in code mode
  var _newChatInterval = null;
  var PENCIL_ICON = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4.5"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/></svg>';
  var TERMINAL_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4.5"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>';
  function updateNewChatButton() {
    var link = document.querySelector('#sidebar a[href="/"][aria-label]');
    if (!link) return;
    var iconContainer = link.querySelector('div.self-center');
    if (!iconContainer) return;
    if (codeMode) {
      link.setAttribute('aria-label', 'New Session');
      if (iconContainer.innerHTML.indexOf('polyline') === -1) {
        iconContainer.innerHTML = TERMINAL_ICON;
      }
      if (!_newChatInterval) _newChatInterval = setInterval(updateNewChatButton, 500);
    } else {
      link.setAttribute('aria-label', 'New Chat');
      // Restore pencil icon if we replaced it
      if (iconContainer.innerHTML.indexOf('polyline') !== -1) {
        iconContainer.innerHTML = PENCIL_ICON;
      }
      if (_newChatInterval) { clearInterval(_newChatInterval); _newChatInterval = null; }
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
    startPositionSync();
    _numzContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#444;font-family:monospace;font-size:14px">Select a session</div>';
  }

  function updateContainerPosition() {
    if (!_numzContainer) return;
    var sidebar = document.getElementById('sidebar');
    var sidebarWidth = sidebar ? sidebar.offsetWidth : 0;
    if (window.innerWidth < 768) sidebarWidth = 0;
    _numzContainer.style.left = sidebarWidth + 'px';
    // Mobile: z-index below Navbar (z-30) and sidebar (z-50)
    // so both can render on top of the code view
    if (window.innerWidth < 768) {
      _numzContainer.style.zIndex = '20';
    } else {
      _numzContainer.style.zIndex = '9999';
    }
  }

  // Keep container position in sync with sidebar width changes
  // (sidebar open/close, page load, resize)
  var _positionInterval = null;
  function startPositionSync() {
    if (_positionInterval) return;
    _positionInterval = setInterval(updateContainerPosition, 300);
  }
  window.addEventListener('resize', updateContainerPosition);

  // Update active session status in sidebar from WebSocket events
  window._numzUpdateSessionStatus = function(status) {
    var activeSid = sessionStorage.getItem('numzActiveSession');
    if (!activeSid) return;
    var item = document.querySelector('.numz-session-item[data-sid="' + activeSid + '"]');
    if (!item) return;
    var statusEl = item.querySelector('.numz-session-status');
    if (!statusEl) {
      statusEl = document.createElement('span');
      statusEl.className = 'numz-session-status';
      statusEl.style.cssText = 'font-size:10px;margin-left:auto;padding:2px 6px;border-radius:4px';
      item.querySelector('div:first-child').appendChild(statusEl);
    }
    var labels = { working: 'working', approval: 'needs approval', unread: 'sent', idle: '' };
    var colors = { working: '#f59e0b', approval: '#ef4444', unread: '#06b6d4', idle: '' };
    var bgs = { working: 'rgba(245,158,11,0.1)', approval: 'rgba(239,68,68,0.1)', unread: 'rgba(6,182,212,0.1)', idle: 'transparent' };
    statusEl.textContent = labels[status] || '';
    statusEl.style.color = colors[status] || '';
    statusEl.style.background = bgs[status] || '';
  };

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

  var _allCodeSessions = []; // cached for search

  function showCodeSessions(autoOpen) {
    hideChatItems();
    if (!_chatHideInterval) _chatHideInterval = setInterval(hideChatItems, 500);

    var url = '/api/numz/sessions';
    if (folderFilter) url += '?folder=' + encodeURIComponent(folderFilter);
    fetch(url).then(function(r) { return r.json(); }).then(function(sessions) {
      _allCodeSessions = sessions;
      renderCodeSessions(sessions);

      // Auto-open most recent session if none is active
      if (autoOpen && sessions.length > 0) {
        var activeSid = sessionStorage.getItem('numzActiveSession');
        if (!activeSid || !sessions.some(function(s) { return s.id === activeSid; })) {
          var most = sessions[0]; // already sorted by most recent
          sessionStorage.setItem('numzActiveSession', most.id);
          openSession(most.id, most.project || '');
          // Highlight it
          setTimeout(function() {
            var item = document.querySelector('.numz-session-item[data-sid="' + most.id + '"]');
            if (item) item.style.background = 'rgba(255,255,255,0.06)';
          }, 100);
        } else if (activeSid) {
          // Re-open the previously active session
          var prev = sessions.find(function(s) { return s.id === activeSid; });
          if (prev) openSession(prev.id, prev.project || '');
        }
      }
    });
  }

  function renderCodeSessions(sessions) {
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
      // Show folder path (shortened) instead of username
      var folderDisplay = (s.project || '~').replace(/^\/home\/\w+\//, '~/');
      var dot = '';
      if (s.active) { dot = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;margin-right:8px;animation:pulse 1.5s ease-in-out infinite"></span>'; }
      else if (s.live) { dot = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;margin-right:8px"></span>'; }
      h += '<div class="numz-session-item" data-sid="' + s.id + '" data-cwd="' + esc(s.project || '') + '" style="margin:1px 7px;cursor:pointer;padding:10px 12px;border-radius:10px' + (selected ? ';background:rgba(255,255,255,0.06)' : '') + '">' +
        '<div style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center" class="text-gray-800 dark:text-gray-200">' + dot + esc(s.title || 'Untitled').substring(0, 50) + '</div>' +
        '<div style="font-size:11px;margin-top:2px;display:flex;gap:6px" class="text-gray-500"><span style="font-family:monospace">' + esc(folderDisplay) + '</span><span>' + dateStr + '</span></div></div>';
    });
    list.innerHTML = h;
    list.style.display = '';
  }

  // Intercept sidebar search button in code mode
  document.addEventListener('click', function(e) {
    if (!codeMode) return;
    // The search button is in the sidebar after the new chat button
    var btn = e.target.closest('button');
    if (!btn) return;
    var sidebar = document.getElementById('sidebar');
    if (!sidebar || !sidebar.contains(btn)) return;
    // Check if this is the search button (has the magnifying glass SVG)
    var svg = btn.querySelector('svg path[d*="m21 21-5.197"]');
    if (!svg) return;
    e.preventDefault();
    e.stopPropagation();
    showCodeSessionSearch();
  }, true);

  function showCodeSessionSearch() {
    var existing = document.getElementById('numz-session-search');
    if (existing) { existing.remove(); document.getElementById('numz-search-backdrop')?.remove(); return; }

    // Backdrop
    var backdrop = document.createElement('div');
    backdrop.id = 'numz-search-backdrop';
    backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99998';
    backdrop.addEventListener('click', function() { backdrop.remove(); overlay.remove(); });
    document.body.appendChild(backdrop);

    // Overlay
    var overlay = document.createElement('div');
    overlay.id = 'numz-session-search';
    overlay.style.cssText = 'position:fixed;top:15%;left:50%;transform:translateX(-50%);width:480px;max-height:500px;background:rgb(32,33,35);border:1px solid rgba(255,255,255,0.08);border-radius:16px;z-index:99999;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,0.7);overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';

    // Search input
    var header = document.createElement('div');
    header.style.cssText = 'padding:16px 20px 12px;border-bottom:1px solid rgba(255,255,255,0.06)';
    header.innerHTML = '<input type="text" placeholder="Search sessions..." style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#e5e5e5;font-size:14px;outline:none">';
    overlay.appendChild(header);

    // Results
    var results = document.createElement('div');
    results.style.cssText = 'flex:1;overflow-y:auto;padding:4px 8px 8px';
    overlay.appendChild(results);

    document.body.appendChild(overlay);

    var input = header.querySelector('input');
    input.focus();

    var selectedIdx = 0;

    function renderResults(q) {
      var filtered = _allCodeSessions;
      if (q) {
        filtered = _allCodeSessions.filter(function(s) {
          return ((s.title || '') + ' ' + (s.project || '') + ' ' + (s.folder || '')).toLowerCase().indexOf(q) !== -1;
        });
      }
      var h = '';
      filtered.forEach(function(s, i) {
        var folderDisplay = (s.project || '~').replace(/^\/home\/\w+\//, '~/');
        var date = new Date(s.updated_at * 1000);
        var dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        h += '<div class="numz-search-item" data-sid="' + esc(s.id) + '" data-cwd="' + esc(s.project || '') + '" data-idx="' + i + '" style="padding:10px 14px;border-radius:10px;cursor:pointer;margin:2px 0' + (i === selectedIdx ? ';background:rgba(255,255,255,0.06)' : '') + '">' +
          '<div style="font-size:13px;color:#e5e5e5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(s.title || 'Untitled') + '</div>' +
          '<div style="font-size:11px;color:#666;margin-top:2px;font-family:monospace">' + esc(folderDisplay) + ' · ' + dateStr + '</div></div>';
      });
      if (!filtered.length) h = '<div style="padding:20px;text-align:center;color:#555;font-size:13px">No sessions found</div>';
      results.innerHTML = h;

      // Click handlers
      results.querySelectorAll('.numz-search-item').forEach(function(item) {
        item.addEventListener('click', function() { openFromSearch(item.dataset.sid, item.dataset.cwd); });
        item.addEventListener('mouseover', function() {
          selectedIdx = parseInt(item.dataset.idx);
          results.querySelectorAll('.numz-search-item').forEach(function(r) { r.style.background = ''; });
          item.style.background = 'rgba(255,255,255,0.06)';
        });
      });
    }

    function openFromSearch(sid, cwd) {
      backdrop.remove();
      overlay.remove();
      document.querySelectorAll('.numz-session-item').forEach(function(el) { el.style.background = ''; });
      var item = document.querySelector('.numz-session-item[data-sid="' + sid + '"]');
      if (item) item.style.background = 'rgba(255,255,255,0.06)';
      sessionStorage.setItem('numzActiveSession', sid);
      openSession(sid, cwd);
    }

    renderResults('');

    input.addEventListener('input', function() {
      selectedIdx = 0;
      renderResults(input.value.toLowerCase());
    });

    input.addEventListener('keydown', function(e) {
      var items = results.querySelectorAll('.numz-search-item');
      if (e.key === 'Escape') { backdrop.remove(); overlay.remove(); e.preventDefault(); }
      else if (e.key === 'ArrowDown') { selectedIdx = Math.min(selectedIdx + 1, items.length - 1); updateHighlight(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { selectedIdx = Math.max(selectedIdx - 1, 0); updateHighlight(); e.preventDefault(); }
      else if (e.key === 'Enter' && items[selectedIdx]) { openFromSearch(items[selectedIdx].dataset.sid, items[selectedIdx].dataset.cwd); e.preventDefault(); }
    });

    function updateHighlight() {
      results.querySelectorAll('.numz-search-item').forEach(function(r, i) {
        r.style.background = i === selectedIdx ? 'rgba(255,255,255,0.06)' : '';
      });
      var focused = results.querySelectorAll('.numz-search-item')[selectedIdx];
      if (focused) focused.scrollIntoView({ block: 'nearest' });
    }
  }

  // ── New Chat in code mode — show workspace picker ──
  document.addEventListener('click', function(e) {
    if (!codeMode) return;
    var btn = e.target.closest('#sidebar-new-chat-button, a[href="/"]');
    if (!btn) return;
    var sidebar = document.getElementById('sidebar');
    if (!sidebar || !sidebar.contains(btn)) return;
    e.preventDefault();
    e.stopPropagation();
    showWorkspacePicker();
  }, true);

  function showWorkspacePicker() {
    var existing = document.getElementById('numz-workspace-picker');
    if (existing) { existing.remove(); return; }

    // Backdrop
    var backdrop = document.createElement('div');
    backdrop.id = 'numz-workspace-backdrop';
    backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99998';
    backdrop.addEventListener('click', function() { backdrop.remove(); picker.remove(); });
    document.body.appendChild(backdrop);

    var picker = document.createElement('div');
    picker.id = 'numz-workspace-picker';
    picker.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:480px;max-height:600px;background:rgb(32,33,35);border:1px solid rgba(255,255,255,0.08);border-radius:16px;z-index:99999;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,0.7);overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';

    // Header: computer selector + search + breadcrumb
    var header = document.createElement('div');
    header.id = 'numz-wp-header';
    header.style.cssText = 'padding:16px 20px 12px;border-bottom:1px solid rgba(255,255,255,0.06)';
    // Dynamic computer selector — fetches terminal servers
    header.innerHTML =
      '<div id="numz-wp-computers" style="display:flex;gap:8px;margin-bottom:12px"><span style="color:#555;font-size:12px;padding:7px">Loading machines...</span></div>' +
      '<input id="numz-wp-search" type="text" placeholder="Search all folders..." style="width:100%;padding:7px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#ccc;font-size:13px;outline:none;margin-bottom:10px">' +
      '<div id="numz-wp-breadcrumb" style="display:flex;align-items:center;gap:4px;font-size:12px;color:#888;flex-wrap:wrap"></div>';
    picker.appendChild(header);

    var _wpSelectedServer = null; // { id, name, url, key }
    var _wpServers = [];

    // Fetch terminal servers and build computer buttons
    var token = localStorage.token || '';
    fetch('/api/v1/terminals/', { headers: { Authorization: 'Bearer ' + token } })
      .then(function(r) { return r.json(); })
      .then(function(servers) {
        _wpServers = servers;
        var container = document.getElementById('numz-wp-computers');
        if (!container) return;
        if (servers.length === 0) {
          container.innerHTML = '<span style="color:#888;font-size:12px;padding:7px">No machines connected. Set up spawn-hook.</span>';
          return;
        }
        var h = '';
        servers.forEach(function(s, i) {
          var isFirst = i === 0;
          h += '<button class="numz-computer-btn' + (isFirst ? ' active' : '') + '" data-server-id="' + esc(s.id) + '" style="flex:1;padding:7px;border-radius:8px;border:1px solid ' + (isFirst ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.06)') + ';background:' + (isFirst ? 'rgba(236,72,153,0.1)' : 'none') + ';color:' + (isFirst ? '#ec4899' : '#888') + ';font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">' + esc(s.name) + '</button>';
        });
        container.innerHTML = h;
        // Select first by default
        if (servers[0]) selectServer(servers[0]);
        // Click handlers
        container.querySelectorAll('.numz-computer-btn').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var sid = btn.dataset.serverId;
            var srv = servers.find(function(s) { return s.id === sid; });
            if (srv) selectServer(srv);
            container.querySelectorAll('.numz-computer-btn').forEach(function(b) {
              var active = b.dataset.serverId === sid;
              b.style.borderColor = active ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.06)';
              b.style.background = active ? 'rgba(236,72,153,0.1)' : 'none';
              b.style.color = active ? '#ec4899' : '#888';
              b.classList.toggle('active', active);
            });
          });
        });
      });

    function selectServer(srv) {
      _wpSelectedServer = srv;
      navigateTo('~');
    }

    // Search logic — filters current file list
    setTimeout(function() {
      var searchEl = document.getElementById('numz-wp-search');
      if (searchEl) {
        searchEl.addEventListener('input', function() {
          var q = searchEl.value.toLowerCase();
          var entries = document.querySelectorAll('#numz-wp-files .numz-wp-entry');
          entries.forEach(function(entry) {
            if (entry.dataset.type === 'parent') { entry.style.display = q ? 'none' : ''; return; }
            var text = (entry.textContent || '').toLowerCase();
            entry.style.display = text.indexOf(q) !== -1 ? '' : 'none';
          });
        });
      }
    }, 50);

    // Quick access sidebar + file list
    var body = document.createElement('div');
    body.style.cssText = 'display:flex;flex:1;min-height:0;overflow:hidden';

    // Sidebar — quick access
    var sidebar = document.createElement('div');
    sidebar.style.cssText = 'width:130px;padding:8px;border-right:1px solid rgba(255,255,255,0.06);flex-shrink:0;overflow-y:auto';
    var quickLinks = [
      { name: 'Home', path: '~', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>' },
      { name: 'Desktop', path: '~/Desktop', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' },
      { name: 'Documents', path: '~/Documents', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
    ];
    quickLinks.forEach(function(link) {
      var btn = document.createElement('button');
      btn.style.cssText = 'display:flex;align-items:center;gap:8px;width:100%;padding:6px 8px;border:none;background:none;color:#aaa;font-size:12px;cursor:pointer;border-radius:6px;text-align:left';
      btn.innerHTML = link.icon + '<span>' + link.name + '</span>';
      btn.addEventListener('click', function() { navigateTo(link.path); });
      btn.addEventListener('mouseover', function() { btn.style.background = 'rgba(255,255,255,0.06)'; });
      btn.addEventListener('mouseout', function() { btn.style.background = ''; });
      sidebar.appendChild(btn);
    });
    body.appendChild(sidebar);

    // File list
    var fileList = document.createElement('div');
    fileList.id = 'numz-wp-files';
    fileList.style.cssText = 'flex:1;overflow-y:auto;padding:4px';
    body.appendChild(fileList);

    picker.appendChild(body);

    // Footer with actions
    var footer = document.createElement('div');
    footer.style.cssText = 'padding:12px 20px;border-top:1px solid rgba(255,255,255,0.06);display:flex;justify-content:space-between;align-items:center;gap:8px';
    footer.innerHTML = '<div id="numz-wp-path" style="font-size:11px;color:#666;font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1"></div>' +
      '<button id="numz-wp-mkdir" style="padding:6px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:none;color:#aaa;font-size:12px;cursor:pointer">New Folder</button>' +
      '<button id="numz-wp-select" style="padding:6px 16px;border-radius:8px;border:none;background:#e5e5e5;color:#1a1a1a;font-size:12px;font-weight:600;cursor:pointer">Open Here</button>';
    picker.appendChild(footer);

    document.body.appendChild(picker);

    var currentPath = '~';

    function navigateTo(dirPath) {
      currentPath = dirPath;
      fileList.innerHTML = '<div style="padding:20px;text-align:center;color:#555;font-size:12px">Loading...</div>';
      // Browse via the selected terminal server (spawn-hook), or local fallback
      var browseUrl;
      if (_wpSelectedServer) {
        browseUrl = '/api/v1/terminals/' + _wpSelectedServer.id + '/files/list?directory=' + encodeURIComponent(dirPath === '~' ? '' : dirPath);
      } else {
        browseUrl = '/api/numz/browse?path=' + encodeURIComponent(dirPath);
      }
      var headers = { Authorization: 'Bearer ' + (localStorage.token || '') };
      fetch(browseUrl, { headers: headers }).then(function(r) { return r.json(); }).then(function(rawData) {
        // Normalize: terminal server returns {entries:[...]}, local returns {path,display,parent,entries}
        var data;
        if (rawData.display) {
          data = rawData; // local browse format
        } else {
          // Terminal server format — build compatible structure
          var resolvedPath = dirPath === '~' ? '~' : dirPath;
          var parentPath = resolvedPath.split('/').slice(0, -1).join('/') || '~';
          data = {
            path: resolvedPath,
            display: resolvedPath.replace(/^\/home\/\w+/, '~'),
            parent: resolvedPath !== '~' ? parentPath : null,
            entries: (rawData.entries || []).filter(function(e) { return e.type === 'directory'; }).map(function(e) {
              var fullPath = (resolvedPath === '~' ? '~/' : resolvedPath + '/') + e.name;
              return { name: e.name, path: fullPath, type: 'directory', git: false };
            }),
          };
        }
        return data;
      }).then(function(data) {
        if (data.error) { fileList.innerHTML = '<div style="padding:20px;text-align:center;color:#ef4444;font-size:12px">' + esc(data.error) + '</div>'; return; }
        currentPath = data.path;

        // Update breadcrumb
        var bc = document.getElementById('numz-wp-breadcrumb');
        if (bc) {
          var parts = data.display.split('/');
          var bcHtml = '';
          var buildPath = '';
          parts.forEach(function(part, i) {
            if (!part && i > 0) return;
            buildPath += (i > 0 ? '/' : '') + part;
            var p = buildPath;
            if (i > 0) bcHtml += '<span style="color:#555">/</span>';
            bcHtml += '<button onclick="document.getElementById(\'numz-wp-files\')._nav(\'' + esc(p) + '\')" style="background:none;border:none;color:#aaa;font-size:12px;cursor:pointer;padding:2px 4px;border-radius:4px" onmouseover="this.style.background=\'rgba(255,255,255,0.06)\'" onmouseout="this.style.background=\'\'">' + esc(part || '~') + '</button>';
          });
          bc.innerHTML = bcHtml;
        }

        // Update path display
        var pathEl = document.getElementById('numz-wp-path');
        if (pathEl) pathEl.textContent = data.path;

        // Render entries
        var h = '';
        if (data.parent) {
          h += '<div class="numz-wp-entry" data-path="' + esc(data.parent) + '" data-type="parent" style="display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;border-radius:8px;margin:1px 0">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>' +
            '<span style="color:#aaa;font-size:13px">..</span></div>';
        }
        data.entries.forEach(function(e) {
          var icon = e.git
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
          var gitBadge = e.git ? '<span style="font-size:9px;padding:1px 5px;border-radius:4px;background:rgba(245,158,11,0.1);color:#f59e0b;margin-left:auto;flex-shrink:0">git</span>' : '';
          h += '<div class="numz-wp-entry" data-path="' + esc(e.path) + '" data-type="dir" style="display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;border-radius:8px;margin:1px 0">' +
            icon + '<span style="color:#e5e5e5;font-size:13px">' + esc(e.name) + '</span>' + gitBadge + '</div>';
        });
        if (data.entries.length === 0 && !data.parent) {
          h = '<div style="padding:30px;text-align:center;color:#555;font-size:12px">Empty folder</div>';
        }
        fileList.innerHTML = h;

        // Click handlers
        fileList.querySelectorAll('.numz-wp-entry').forEach(function(entry) {
          entry.addEventListener('click', function() {
            navigateTo(entry.dataset.path);
          });
          entry.addEventListener('mouseover', function() { entry.style.background = 'rgba(255,255,255,0.04)'; });
          entry.addEventListener('mouseout', function() { entry.style.background = ''; });
        });

        // Expose nav function for breadcrumb buttons
        fileList._nav = navigateTo;
      });
    }

    // "Open Here" button — start session in current directory
    document.getElementById('numz-wp-select').addEventListener('click', function() {
      backdrop.remove();
      picker.remove();
      document.querySelectorAll('.numz-session-item').forEach(function(el) { el.style.background = ''; });
      sessionStorage.removeItem('numzActiveSession');
      ensureNumzContainer();
      if (window.numzGui) window.numzGui.disconnect();
      window.numzGui.connect('', currentPath, _numzContainer);
    });

    // "New Folder" button
    document.getElementById('numz-wp-mkdir').addEventListener('click', function() {
      var name = prompt('New folder name:');
      if (!name || !name.trim()) return;
      var newPath = currentPath + '/' + name.trim();
      fetch('/api/numz/browse?path=' + encodeURIComponent(currentPath)).then(function() {
        // Use a simple mkdir via the browse API — we need a separate endpoint
        // For now, create via fetch to a helper
        var cmd = 'mkdir -p "' + newPath.replace(/"/g, '\\"') + '"';
        // Execute mkdir via a POST to a simple endpoint
        fetch('/api/numz/mkdir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: newPath })
        }).then(function() {
          navigateTo(currentPath);
        });
      });
    });

    // Start at home
    navigateTo('~');

    // ESC to close
    function handleEsc(e) {
      if (e.key === 'Escape') { backdrop.remove(); picker.remove(); document.removeEventListener('keydown', handleEsc); }
    }
    document.addEventListener('keydown', handleEsc);
  }

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


// === Settings overlay (called from Svelte sidebar gear icon) ===
window.toggleSettingsOverlay = function() {
  var existing = document.getElementById('numz-settings-overlay');
  if (existing) { existing.remove(); return; }

  var overlay = document.createElement('div');
  overlay.id = 'numz-settings-overlay';
  overlay.style.cssText = 'position:fixed;bottom:60px;left:16px;width:340px;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);border-radius:12px;z-index:9999;padding:20px;font-family:monospace;box-shadow:0 8px 32px rgba(0,0,0,0.5)';

  overlay.innerHTML =
    '<div style="display:flex;gap:16px">' +
      '<div style="flex:1">' +
        '<div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Chat</div>' +
        '<div style="font-size:12px;color:#06b6d4">qwen3.6-35b-a3b</div>' +
      '</div>' +
      '<div style="width:1px;background:rgba(255,255,255,0.06)"></div>' +
      '<div style="flex:1">' +
        '<div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Code</div>' +
        '<div style="font-size:12px;color:#ec4899">qwen3.6-35b-a3b</div>' +
      '</div>' +
    '</div>';

  setTimeout(function() {
    document.addEventListener('click', function closeOverlay(e) {
      if (!overlay.contains(e.target)) {
        overlay.remove();
        document.removeEventListener('click', closeOverlay);
      }
    });
  }, 100);

  document.body.appendChild(overlay);
};


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
