// === Replace logos and branding ===
(function() {
  var LOGO_DATA = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20100%2055%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20transform%3D%22rotate%28-2%2C50%2C27%29%22%3E%3Cpath%20d%3D%22M10%2012%20L10%2030%20Q10%2042%2022%2042%20L32%2042%20Q44%2042%2044%2030%20L44%2012%20L10%2012%20Z%22%20stroke-width%3D%224.5%22/%3E%3Cpath%20d%3D%22M54%2012%20L54%2030%20Q54%2042%2066%2042%20L76%2042%20Q88%2042%2088%2030%20L88%2012%20L54%2012%20Z%22%20stroke-width%3D%224.5%22/%3E%3Cpath%20d%3D%22M44%2018%20Q49%2011%2054%2018%22%20stroke-width%3D%223.5%22/%3E%3Cline%20x1%3D%2210%22%20y1%3D%2218%22%20x2%3D%220%22%20y2%3D%2216%22%20stroke-width%3D%223.5%22/%3E%3Cline%20x1%3D%2288%22%20y1%3D%2218%22%20x2%3D%2298%22%20y2%3D%2216%22%20stroke-width%3D%223.5%22/%3E%3C/g%3E%3C/svg%3E';

  function fixBranding() {
    var imgs = document.querySelectorAll('img[src*="favicon"], img[src*="logo"], img[src*="splash"], img.sidebar-new-chat-icon');
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i].src !== LOGO_DATA) imgs[i].src = LOGO_DATA;
    }
    var nameEl = document.getElementById('sidebar-webui-name');
    if (nameEl && nameEl.textContent !== 'OpenNumz') nameEl.textContent = 'OpenNumz';
  }

  setInterval(fixBranding, 1500);
})();


// === Sidebar buttons (Quiz + Jarvis) ===
(function() {
  var page = window.location.pathname;
  if (page === '/code' || page === '/jarvis' || page === '/quiz') return;

  function injectSidebarButtons() {
    if (document.getElementById('sidebar-custom-btns')) return;
    var newChatBtn = document.getElementById('sidebar-new-chat-button');
    if (!newChatBtn) return;
    if (newChatBtn.classList.contains('hidden')) {
      var all = document.querySelectorAll('#sidebar-new-chat-button');
      newChatBtn = null;
      for (var i = 0; i < all.length; i++) {
        if (!all[i].classList.contains('hidden')) { newChatBtn = all[i]; break; }
      }
      if (!newChatBtn) return;
    }
    var container = newChatBtn.closest('div.pb-1\\.5') || newChatBtn.parentElement?.parentElement;
    if (!container) return;

    var wrap = document.createElement('div');
    wrap.id = 'sidebar-custom-btns';
    wrap.className = 'sidebar-custom-btns';
    wrap.innerHTML =
      '<a href="/quiz" class="sidebar-link-btn">Quiz</a>' +
      '<a href="/jarvis" class="sidebar-link-btn">Jarvis</a>';
    container.parentElement.insertBefore(wrap, container.nextSibling);
  }

  var obs = new MutationObserver(injectSidebarButtons);
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();


// === Thinking toggle for Qwen ===
(function() {
  var thinkingOn = false;
  var apiToken = null;

  function getToken() {
    if (apiToken) return Promise.resolve(apiToken);
    return fetch('/api/v1/auths/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@localhost', password: 'admin' })
    }).then(function(r) { return r.json(); })
    .then(function(d) { apiToken = d.token; return apiToken; });
  }

  var BASE_PROMPT = 'You are a helpful assistant named numz. Never say you are Qwen or made by Alibaba.\n\nThe current date and time is {{CURRENT_DATETIME}}.';

  function setThinking(on) {
    thinkingOn = on;
    getToken().then(function(token) {
      fetch('/api/v1/models/model/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
          id: 'numz', name: 'numz', base_model_id: 'numz',
          params: { system: on ? BASE_PROMPT + '\n\n/think' : BASE_PROMPT },
          meta: { description: 'Qwen 3.6 35B-A3B' }
        })
      });
    });
  }

  function injectThinkButton() {
    if (document.getElementById('thinking-toggle-btn')) return;
    var sendBtn = document.getElementById('send-message-button');
    var target = sendBtn ? sendBtn.parentElement : null;
    if (!target) {
      var mic = document.getElementById('message-input-container');
      if (!mic) return;
      var divs = mic.querySelectorAll('div');
      for (var i = 0; i < divs.length; i++) {
        if ((divs[i].className || '').indexOf('justify-between') !== -1) {
          target = divs[i].lastElementChild; break;
        }
      }
    }
    if (!target) return;

    var btn = document.createElement('button');
    btn.id = 'thinking-toggle-btn';
    btn.type = 'button';
    btn.className = 'thinking-toggle-btn' + (thinkingOn ? ' active' : '');
    btn.textContent = 'Think';
    btn.title = thinkingOn ? 'Thinking ON' : 'Thinking OFF';
    btn.addEventListener('click', function(e) {
      e.preventDefault(); e.stopPropagation();
      thinkingOn = !thinkingOn;
      btn.classList.toggle('active', thinkingOn);
      btn.title = thinkingOn ? 'Thinking ON' : 'Thinking OFF';
      setThinking(thinkingOn);
    });
    target.insertBefore(btn, target.firstChild);
  }

  setInterval(injectThinkButton, 2000);
})();


// === Code Mode: sidebar slider + session list ===
(function() {
  var codeMode = sessionStorage.getItem('numzCodeMode') === 'true';
  var codePinVerified = sessionStorage.getItem('numzCodePin') === 'true';
  var folderFilter = '';
  var _pinInProgress = false;
  var _sliderInjected = false;
  var _codeModeRestored = false;

  function injectSlider() {
    if (_sliderInjected) return;
    if (document.getElementById('mode-slider')) { _sliderInjected = true; return; }
    var customBtns = document.getElementById('sidebar-custom-btns');
    if (!customBtns) return;

    var slider = document.createElement('div');
    slider.id = 'mode-slider';
    slider.className = 'mode-slider';
    slider.innerHTML =
      '<div class="mode-slider-track">' +
        '<button class="mode-slider-btn' + (codeMode ? '' : ' active') + '" data-mode="chat">Chat</button>' +
        '<button class="mode-slider-btn' + (codeMode ? ' active' : '') + '" data-mode="code">Code</button>' +
      '</div>';
    customBtns.parentElement.insertBefore(slider, customBtns);
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
          fetch('/api/code/verify-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: pin })
          }).then(function(r) {
            if (r.ok) {
              codePinVerified = true;
              sessionStorage.setItem('numzCodePin', 'true');
              switchMode('code');
            } else { alert('Wrong PIN'); }
          });
          return;
        }
        switchMode(mode);
      });
    });

    // Restore code mode once after page load
    if (!_codeModeRestored && codeMode && codePinVerified) {
      _codeModeRestored = true;
      showCodeSessions();
    }
  }

  function switchMode(mode) {
    codeMode = (mode === 'code');
    sessionStorage.setItem('numzCodeMode', codeMode ? 'true' : 'false');
    document.querySelectorAll('.mode-slider-btn').forEach(function(b) {
      var isActive = b.dataset.mode === mode;
      b.classList.toggle('active', isActive);
      b.style.background = isActive ? 'rgba(255,255,255,0.08)' : 'none';
      b.style.color = isActive ? '#e0e0e0' : '#666';
    });
    if (codeMode) {
      showCodeSessions();
    } else {
      showChatSessions();
    }
  }

  function showCodeSessions() {
    var url = '/api/numz/sessions';
    if (folderFilter) url += '?folder=' + encodeURIComponent(folderFilter);

    fetch(url).then(function(r) { return r.json(); }).then(function(sessions) {
      // Hide chat items
      document.querySelectorAll('[id="sidebar-chat-item"],[id="sidebar-chat-group"],[id="sidebar-folder-button"]').forEach(function(el) {
        el.style.display = 'none';
      });

      var list = document.getElementById('numz-sessions-list');
      if (!list) {
        list = document.createElement('div');
        list.id = 'numz-sessions-list';
        var sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        var scrollArea = sidebar.querySelector('div.relative.flex.flex-col.flex-1');
        if (scrollArea) scrollArea.appendChild(list);
      }

      var h = '<div style="padding:4px 8px 6px"><select onchange="window._numzFilterFolder(this.value)" style="width:100%;padding:5px 8px;background:rgba(255,255,255,0.04);color:#ccc;border:1px solid rgba(255,255,255,0.08);border-radius:8px;font-size:12px;font-family:inherit;cursor:pointer"><option value="">All projects</option>';
      var folders = {};
      sessions.forEach(function(s) { if (s.folder && !folders[s.folder]) folders[s.folder] = s.project; });
      Object.keys(folders).sort().forEach(function(f) {
        h += '<option value="' + folders[f] + '"' + (folderFilter === folders[f] ? ' selected' : '') + '>' + f + '</option>';
      });
      h += '</select></div>';

      var currentHash = window.location.hash.replace('#', '');
      sessions.forEach(function(s) {
        var date = new Date(s.updated_at * 1000);
        var dateStr = date.toLocaleDateString([], {month:'short',day:'numeric'});
        var isSelected = (s.id === currentHash);
        var liveDot = '';
        var statusText = s.folder || '~';
        if (s.active) {
          liveDot = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;margin-right:8px;flex-shrink:0;animation:pulse 1.5s ease-in-out infinite"></span>';
          statusText = 'AI working';
        } else if (s.live) {
          liveDot = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;margin-right:8px;flex-shrink:0"></span>';
          statusText = 'Active';
        }
        h += '<a href="/code#' + s.id + '" class="numz-session-item" data-session-id="' + s.id + '" style="display:block;margin:1px 7px;text-decoration:none;color:inherit;padding:10px 12px;border-radius:10px' + (isSelected ? ';background:rgba(255,255,255,0.06)' : '') + '">' +
          '<div style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center" class="text-gray-800 dark:text-gray-200">' + liveDot + esc(s.title || 'Untitled').substring(0, 50) + '</div>' +
          '<div style="font-size:11px;margin-top:2px" class="text-gray-500">' + statusText + ' &middot; ' + dateStr + '</div>' +
        '</a>';
      });

      list.innerHTML = h;
      list.style.display = '';
    });
  }

  function showChatSessions() {
    // Show chat items
    document.querySelectorAll('[id="sidebar-chat-item"],[id="sidebar-chat-group"],[id="sidebar-folder-button"]').forEach(function(el) {
      el.style.display = '';
    });
    // Hide code sessions
    var list = document.getElementById('numz-sessions-list');
    if (list) list.style.display = 'none';
    // Navigate to home if on /code
    if (window.location.pathname === '/code') {
      window.location.href = '/';
    }
  }

  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;'); }
  window._numzFilterFolder = function(val) { folderFilter = val; showCodeSessions(); };

  // Inject slider via MutationObserver (fires once, then stops)
  var obs = new MutationObserver(function() {
    injectSlider();
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();


// === Strip emojis from assistant messages ===
(function() {
  var emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu;

  function stripEmojis() {
    var msgs = document.querySelectorAll('[data-message-id] .prose');
    for (var i = 0; i < msgs.length; i++) {
      var walker = document.createTreeWalker(msgs[i], NodeFilter.SHOW_TEXT);
      var node;
      while (node = walker.nextNode()) {
        var cleaned = node.nodeValue.replace(emojiRegex, '');
        if (cleaned !== node.nodeValue) node.nodeValue = cleaned;
      }
    }
  }

  setInterval(stripEmojis, 1000);
})();
