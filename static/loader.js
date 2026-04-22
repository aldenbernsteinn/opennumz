// === Replace logos and branding ===
(function() {
  // Our logo as a data URI so we can set it as img src without SvelteKit fighting us
  var LOGO_DATA = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20100%2055%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20transform%3D%22rotate%28-2%2C50%2C27%29%22%3E%3Cpath%20d%3D%22M10%2012%20L10%2030%20Q10%2042%2022%2042%20L32%2042%20Q44%2042%2044%2030%20L44%2012%20L10%2012%20Z%22%20stroke-width%3D%224.5%22/%3E%3Cpath%20d%3D%22M54%2012%20L54%2030%20Q54%2042%2066%2042%20L76%2042%20Q88%2042%2088%2030%20L88%2012%20L54%2012%20Z%22%20stroke-width%3D%224.5%22/%3E%3Cpath%20d%3D%22M44%2018%20Q49%2011%2054%2018%22%20stroke-width%3D%223.5%22/%3E%3Cline%20x1%3D%2210%22%20y1%3D%2218%22%20x2%3D%220%22%20y2%3D%2216%22%20stroke-width%3D%223.5%22/%3E%3Cline%20x1%3D%2288%22%20y1%3D%2218%22%20x2%3D%2298%22%20y2%3D%2216%22%20stroke-width%3D%223.5%22/%3E%3C/g%3E%3C/svg%3E';

  function fixBranding() {
    // Force all logo/icon img src to our logo
    var imgs = document.querySelectorAll('img[src*="favicon"], img[src*="logo"], img[src*="splash"], img.sidebar-new-chat-icon');
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i].src !== LOGO_DATA) {
        imgs[i].src = LOGO_DATA;
      }
    }

    // Replace sidebar name
    var nameEl = document.getElementById('sidebar-webui-name');
    if (nameEl && nameEl.textContent !== 'OpenNumz') {
      nameEl.textContent = 'OpenNumz';
    }
  }

  setInterval(fixBranding, 1500);
})();


// === Sidebar buttons (Code + Jarvis, near New Chat) ===
(function() {
  var page = window.location.pathname;
  if (page === '/code.html' || page === '/code' || page === '/jarvis.html' || page === '/jarvis' || page === '/quiz.html' || page === '/quiz') return;

  var injecting = false;

  function injectSidebarButtons() {
    if (injecting) return;
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

    injecting = true;

    var wrap = document.createElement('div');
    wrap.id = 'sidebar-custom-btns';
    wrap.className = 'sidebar-custom-btns';

    var jarvis = document.createElement('a');
    jarvis.href = '/jarvis';
    jarvis.className = 'sidebar-link-btn';
    jarvis.textContent = 'Jarvis';

    var quiz = document.createElement('a');
    quiz.href = '/quiz';
    quiz.className = 'sidebar-link-btn';
    quiz.textContent = 'Quiz';

    wrap.appendChild(quiz);
    wrap.appendChild(jarvis);

    container.parentElement.insertBefore(wrap, container.nextSibling);
    injecting = false;
  }

  setInterval(injectSidebarButtons, 2000);
})();


// === Thinking toggle for Qwen ===
(function() {
  var thinkingOn = false;
  var apiToken = null;
  var injecting = false;

  function getToken() {
    if (apiToken) return Promise.resolve(apiToken);
    return fetch('/api/v1/auths/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@localhost', password: 'admin' })
    })
    .then(function(r) { return r.json(); })
    .then(function(d) { apiToken = d.token; return apiToken; });
  }

  var BASE_PROMPT = 'You are a helpful assistant named numz. Never say you are Qwen or made by Alibaba.\n\nThe current date and time is {{CURRENT_DATETIME}}.';

  function setThinking(on) {
    thinkingOn = on;
    getToken().then(function(token) {
      fetch('/api/v1/models/model/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          id: 'numz',
          name: 'numz',
          base_model_id: 'numz',
          params: { system: on ? BASE_PROMPT + '\n\n/think' : BASE_PROMPT },
          meta: { description: 'Qwen 3.6 35B-A3B' }
        })
      });
    });
  }

  function injectThinkButton() {
    if (injecting) return;
    if (document.getElementById('thinking-toggle-btn')) return;

    var sendBtn = document.getElementById('send-message-button');
    var target = null;

    if (sendBtn) {
      target = sendBtn.parentElement;
    }

    if (!target) {
      var mic = document.getElementById('message-input-container');
      if (!mic) return;
      var divs = mic.querySelectorAll('div');
      for (var i = 0; i < divs.length; i++) {
        var cl = divs[i].className || '';
        if (cl.indexOf('justify-between') !== -1) {
          target = divs[i].lastElementChild;
          break;
        }
      }
    }

    if (!target) return;

    injecting = true;

    var btn = document.createElement('button');
    btn.id = 'thinking-toggle-btn';
    btn.type = 'button';
    btn.className = 'thinking-toggle-btn' + (thinkingOn ? ' active' : '');
    btn.textContent = 'Think';
    btn.title = thinkingOn ? 'Thinking ON' : 'Thinking OFF';

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      thinkingOn = !thinkingOn;
      btn.classList.toggle('active', thinkingOn);
      btn.title = thinkingOn ? 'Thinking ON' : 'Thinking OFF';
      setThinking(thinkingOn);
    });

    target.insertBefore(btn, target.firstChild);
    injecting = false;
  }

  setInterval(injectThinkButton, 2000);
})();


// === Code Mode: sidebar slider ===
// ALWAYS starts in Chat mode. Slider toggles sidebar chat list only.
// All sidebar widgets (new chat, search, etc.) stay visible in both modes.
(function() {
  var codeMode = false; // ALWAYS start in Chat mode
  var codePinVerified = sessionStorage.getItem('numzCodePin') === 'true';
  var folderFilter = '';

  function injectSlider() {
    if (document.getElementById('mode-slider')) return;
    var customBtns = document.getElementById('sidebar-custom-btns');
    if (!customBtns) return;

    var slider = document.createElement('div');
    slider.id = 'mode-slider';
    slider.className = 'mode-slider';
    slider.innerHTML =
      '<div class="mode-slider-track">' +
        '<button class="mode-slider-btn active" data-mode="chat">Chat</button>' +
        '<button class="mode-slider-btn" data-mode="code">Code</button>' +
      '</div>';

    customBtns.parentElement.insertBefore(slider, customBtns);

    slider.querySelectorAll('.mode-slider-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var mode = btn.dataset.mode;
        if (mode === 'code' && !codePinVerified) {
          var pin = prompt('Enter Code PIN:');
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
  }

  function switchMode(mode) {
    codeMode = (mode === 'code');
    document.querySelectorAll('.mode-slider-btn').forEach(function(b) {
      b.classList.toggle('active', b.dataset.mode === mode);
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
      // Hide ONLY sidebar-chat-item elements
      document.querySelectorAll('[id="sidebar-chat-item"]').forEach(function(el) {
        el.style.display = 'none';
      });
      // Also hide sidebar-chat-group and sidebar-folder-button
      document.querySelectorAll('[id="sidebar-chat-group"],[id="sidebar-folder-button"]').forEach(function(el) {
        el.style.display = 'none';
      });

      // Create or update numz list
      var list = document.getElementById('numz-sessions-list');
      if (!list) {
        list = document.createElement('div');
        list.id = 'numz-sessions-list';
        // Insert into the scrollable chat area
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

      sessions.forEach(function(s) {
        var date = new Date(s.updated_at * 1000);
        var dateStr = date.toLocaleDateString([], {month:'short',day:'numeric'});
        h += '<div class="group flex items-center rounded-2xl px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition cursor-pointer" style="display:block;margin:1px 7px" onclick="window._numzOpenSession(\'' + s.id + '\')">' +
          '<div style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" class="text-gray-800 dark:text-gray-200">' + _esc(s.title || 'Untitled').substring(0, 50) + '</div>' +
          '<div style="font-size:11px;margin-top:2px" class="text-gray-500">' + (s.folder || '~') + ' &middot; ' + dateStr + '</div>' +
        '</div>';
      });

      list.innerHTML = h;
      list.style.display = '';
    });
  }

  function showChatSessions() {
    // Show all hidden chat items
    document.querySelectorAll('[id="sidebar-chat-item"],[id="sidebar-chat-group"],[id="sidebar-folder-button"]').forEach(function(el) {
      el.style.display = '';
    });
    // Hide numz list
    var list = document.getElementById('numz-sessions-list');
    if (list) list.style.display = 'none';
  }

  function _esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;'); }

  window._numzFilterFolder = function(val) { folderFilter = val; showCodeSessions(); };

  window._numzOpenSession = function(id) {
    fetch('/api/numz/sessions/' + id).then(function(r) { return r.json(); }).then(function(data) {
      _renderSession(data.messages);
    });
  };

  function _findMainContent() {
    // The main content is the flex-1 div that's a sibling of the sidebar
    var sidebar = document.getElementById('sidebar');
    if (sidebar) {
      // Walk siblings — the resizer is next, then the content pane
      var el = sidebar.parentElement;
      if (el) {
        var kids = el.children;
        for (var i = 0; i < kids.length; i++) {
          if (kids[i].id !== 'sidebar' && !kids[i].id.includes('resizer') &&
              kids[i].className && kids[i].className.indexOf('flex-1') !== -1) {
            return kids[i];
          }
        }
      }
    }
    return null;
  }

  var _renderedSessionId = null;
  var BATCH_SIZE = 40; // Load 40 messages at a time
  var _allMessages = [];
  var _loadedCount = 0;

  function _renderSession(messages) {
    var container = _findMainContent();
    if (!container) return;

    _allMessages = messages;
    // Start from the end (most recent) and load BATCH_SIZE
    _loadedCount = Math.min(BATCH_SIZE, messages.length);
    var startIdx = messages.length - _loadedCount;

    var MONO = "'SF Mono','Cascadia Code','Fira Code',Consolas,monospace";

    var h = '<div id="numz-session-view" style="height:100%;overflow-y:auto;display:flex;flex-direction:column">';
    // Load more button at top
    if (startIdx > 0) {
      h += '<div id="numz-load-more" style="text-align:center;padding:16px"><button onclick="window._numzLoadMore()" style="padding:6px 16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#999;font-size:12px;cursor:pointer;font-family:inherit">Load earlier messages (' + startIdx + ' more)</button></div>';
    }
    h += '<div id="numz-messages" style="max-width:52rem;margin:0 auto;padding:16px;width:100%;font-family:' + MONO + '">';
    h += _renderMessageBatch(messages.slice(startIdx));
    h += '</div></div>';

    container.innerHTML = h;

    // Scroll to bottom
    var view = document.getElementById('numz-session-view');
    if (view) view.scrollTop = view.scrollHeight;
  }

  window._numzLoadMore = function() {
    var newLoaded = Math.min(_loadedCount + BATCH_SIZE, _allMessages.length);
    var startIdx = _allMessages.length - newLoaded;
    _loadedCount = newLoaded;

    var msgDiv = document.getElementById('numz-messages');
    var loadMore = document.getElementById('numz-load-more');
    if (msgDiv) {
      var oldH = msgDiv.scrollHeight;
      msgDiv.innerHTML = _renderMessageBatch(_allMessages.slice(startIdx, _allMessages.length - _loadedCount + BATCH_SIZE)) + msgDiv.innerHTML;
      // Keep scroll position
      var view = document.getElementById('numz-session-view');
      if (view) view.scrollTop = view.scrollTop + (msgDiv.scrollHeight - oldH);
    }
    if (loadMore) {
      if (startIdx <= 0) {
        loadMore.style.display = 'none';
      } else {
        loadMore.innerHTML = '<button onclick="window._numzLoadMore()" style="padding:6px 16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#999;font-size:12px;cursor:pointer;font-family:inherit">Load earlier messages (' + startIdx + ' more)</button>';
      }
    }
  };

  function _renderMessageBatch(msgs) {
    var h = '';
    for (var i = 0; i < msgs.length; i++) {
      var m = msgs[i];
      if (m.role === 'user') {
        h += '<div style="margin:16px 0 4px;padding:10px 14px;background:#373737;border-radius:10px;color:#fff;font-size:14px">' +
          '<span style="color:#ec4899;margin-right:8px;font-weight:700">❯</span>' + _esc(m.content) + '</div>';
      } else if (m.role === 'assistant') {
        h += '<div style="margin:4px 0 12px;font-size:13px;line-height:1.7;color:#ccc">';
        var lines = m.content.split('\n');
        var inCode = false, codeBlock = '';
        for (var j = 0; j < lines.length; j++) {
          var line = lines[j];
          if (line.startsWith('```')) {
            if (inCode) {
              h += '<pre style="background:#0a0a0a;border-left:3px solid #fd5db1;border-radius:4px;padding:10px 12px;margin:6px 0 6px 20px;overflow-x:auto;font-size:12px;color:#999"><code>' + _esc(codeBlock) + '</code></pre>';
              codeBlock = ''; inCode = false;
            } else { inCode = true; }
            continue;
          }
          if (inCode) { codeBlock += (codeBlock ? '\n' : '') + line; continue; }
          if (line.startsWith('**') && line.indexOf('**:') !== -1) {
            var toolLine = line.replace(/\*\*/g, '');
            h += '<div style="color:#999;margin:8px 0 2px"><span style="color:#505050;margin-right:6px">⎿</span><span style="color:#b1b9f9">' + _esc(toolLine) + '</span></div>';
          } else if (line.trim()) {
            h += '<div style="padding-left:20px;color:#b0b0b0">' + _esc(line).replace(/\*\*([^*]+)\*\*/g,'<strong style="color:#fff">$1</strong>').replace(/`([^`]+)`/g,'<code style="background:#1a1a1a;padding:1px 5px;border-radius:3px;color:#ec4899">$1</code>') + '</div>';
          }
        }
        if (inCode && codeBlock) {
          h += '<pre style="background:#0a0a0a;border-left:3px solid #fd5db1;border-radius:4px;padding:10px 12px;margin:6px 0 6px 20px;overflow-x:auto;font-size:12px;color:#999"><code>' + _esc(codeBlock) + '</code></pre>';
        }
        h += '</div>';
      }
    }
    return h;
  }

  // Intercept fetch when in code mode
  var _origFetch = window.fetch;
  window.fetch = function(url, opts) {
    if (codeMode && typeof url === 'string' && url.indexOf('/api/chat/completions') !== -1 && opts && opts.method === 'POST') {
      return _origFetch.call(this, '/api/numz/chat', opts);
    }
    return _origFetch.apply(this, arguments);
  };

  setInterval(injectSlider, 2000);
})();


// === Strip emojis from assistant messages ===
(function() {
  var emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu;

  function stripEmojis() {
    // Target rendered markdown content in assistant messages
    var msgs = document.querySelectorAll('[data-message-id] .prose');
    for (var i = 0; i < msgs.length; i++) {
      var walker = document.createTreeWalker(msgs[i], NodeFilter.SHOW_TEXT);
      var node;
      while (node = walker.nextNode()) {
        var cleaned = node.nodeValue.replace(emojiRegex, '');
        if (cleaned !== node.nodeValue) {
          node.nodeValue = cleaned;
        }
      }
    }
  }

  setInterval(stripEmojis, 1000);
})();
