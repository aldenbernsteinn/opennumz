// === Replace logos and branding ===
(function() {
  // Our logo as a data URI so we can set it as img src without SvelteKit fighting us
  var LOGO_DATA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAeAAAADwCAYAAADYdbe6AAAFKklEQVR4nO3dzXabMBCAUaun7//KdNOc+tTG5kfSaKR7l1kkGJz5EIbk8QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPop0RsAsIJt27YeP6eUYq4n8Tt6A4Ax9QoGrEqACWfQAysS4BuEA4Crpg+wSAIwoik/rBddICs3Ua1jqgMtvPDq6EB/9/uzWgyO7oMjs2a1fcd5KS9BC208w+U7QZuX40gNqQJ8NryllLJt2+aX5TjRAOhj+ABfWe0+B0M8ABjRsAG+stpttS0AUNtwAXZzAwArCA/w0ZWu6AIwk7AACy8AK+seYOEFgA4BdjMVALxqFmArXSATz8DTW7UAW+kCwHG3Anz3j2QAwKqafwYsuADwqlmAhRcA9v2q+c3Kk5rfl36u/us1AM65tQIWWgC4puoKGAA4RoABIIAAA0AAAQaAAAIMAAEEGAACCDAABBBgAAggwAAQQIABIIAAA0AAAQaAAAIMAAEEGAACCDAABBBgAAggwLwopZTobQCYnQBzyLZtW/Q2AMxEgIHlvTvBdCWI1gQYAAIIMAAEEGAACCDAABBAgAEggABDI+6iBT4RYOjI89TADwEGgAACDLzlEjq0JcCAS+MQQIABIIAAA0AAAQaAAAIMAAEEGAACCDBveQQFoC0B5jCPqgDUI8AAEECAASCAAANLe/fRinsg6EGAASCAAANAAAEGgAACDPDE57/0IsDA2+is8Nz3Cq+RcQkwAAQQYAAIIMDQiOdL83F86EmAgSX5/JdoAgwAAQQYWI7VLyMQYGCXUEE7AgwsZe+kwg1Y9CbA7DKQ1rJ3vK2CoQ0B5hTDmMysfhmJAEMDWU9UhAj6EWDgq6wnFM+sfhmNAENl2Qd9lu08Y4YTCOYjwMAhM0ZsxpMN8hBgPlr139TVlm3Qz3RHdPYrEsxLgKGijIGamfgyMgGGxrIO+5lWwTAiAeYSQ/iVfTIWq19GJ8BQwazDPusqeO9/MWc/HsxFgPkq6xCmjr1wjXr89+IbsS3wiQDDTbOufv83eoS3v/7/+mzHgXkIMIdYBfN47Ec48n3w6eeLLyMTYLhhxcE/ysnYt/DPfAyYgzcop6wYnD2rD/+o138k9Cvsf/KzAuaUUVY/I1tl+H96nS0uS0df6obalhgU1LX6yu/xcCXgx9EgXt0vZ4O72v4nN29WLlk5QCu/9j3RK9OV9z15uQTNJS5F8ywqgP64Bpl543LLSqtBl96P6XESZn8zA29ibvk2bGcYlMJ7Ta0Q28fMyhub27Zt20opZcbVsPjW5REi+McbnSpmWwnP9nqA8bgJiyq+BSnTM5xZthPIzVk81WVdPbo8CvRkmNBEtphl214gPwOFZjJELcM2AnMyWGhutMid+YxXfIFWDBe6uHJjU+34CS8wEkOGrnqHeITwA7xj0NDdiI/5iC7Qm6FDmBFCLLxAFMOHofhD/sAqDCKGVTvGwguMxEBieGdDLLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaf0Bljf48z+gPFMAAAAASUVORK5CYII=';

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
  if (page === '/code.html' || page === '/code' || page === '/jarvis.html' || page === '/jarvis') return;

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

    var code = document.createElement('a');
    code.href = '/code';
    code.className = 'sidebar-link-btn';
    code.textContent = 'Code';

    var jarvis = document.createElement('a');
    jarvis.href = '/jarvis';
    jarvis.className = 'sidebar-link-btn';
    jarvis.textContent = 'Jarvis';

    wrap.appendChild(code);
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
