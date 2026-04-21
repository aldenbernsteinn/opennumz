// === Replace logos and branding ===
(function() {
  // Our logo as a data URI so we can set it as img src without SvelteKit fighting us
  var LOGO_DATA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAAAEBUlEQVR4nO3cUZOaMBiGUej0//9lelM6dmdXQTD53uSca3eUkCdBdF0WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJb11QO2bdv+PXhdb3888L71MTjmdHZhPvu33/29xf0eAoZgv3q/AOB9AoZgAoZgAoZgb999BPq77Vb+s9B9ZPC9V4vjq3G78pn70b+1gNf2u/cL4H1XFsa7FtURF+ezm1GPRW5/HQKGC1rE+2yRFHBH67r6Ik0xvc/H2SuaJgFv27aNeKl1Ve/JQn9Xu7ADw4d9cvMSMFzw9W1Q6ytNAXfkPfAYer499E0sCCZgCCZgOKjiJykC5m0VJ/RsbgvYyYT27MAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQrFnAfjoG7mcHhmAChmAChr8S3+YJGIIJGIIJGIIJGILdGrBfpoS27MAQTMBwQNWrSwFDMAFDMAFDMAFDMAFDMAFDMAFDMAFDMAFDMAFDsKYBJ/7iAVRmB4ZgAoZgAoZgAoYl9/7M7QFX/b9JGJEdGIIJGIIJGF6o/LZQwEwv9QbWsgiYC5In/igEDE9UvnxeFgFDNAF35BK0v/Rz0Dzg9AGbzatLyJHPZ/XL52WxAzOxERYfAXcywuRJNsr4C7ioSpdvM15GVxr/Zz4ScMrBM6dXC07S/LUDc0jSpH5mtKuFLgGPNohnjbQD7GY/p73YgYtJjDfFkUUmbfw/FvCMNz5Gl3xOK7+2K+zAjY06kXbJx5e2+y6LgJsa4b1vwmv8asRL591HA06+5OJnSed15HiXpcEOnHSyP2mW49xtf/V+Da8ekxzvsriEbmLEiXT09faI+OjikTbm3ykRcO+VurfUiVQp4u3BkcenjvlXzQ5ilhXxqxmO+2ygdx9v7+fvqemBjHAX9oyZdoN3d9krx/7Oc44w1o9KBbws4wzwTPHurl4q/zQWd12CjzTWu+YHNEPEM8a7q3g/Y8Rx3nU5sJEjnjneR1VCHn2cux3ciBGL9389I55ljEsHvEs4GeL9WeuQZxrjrgc6QsQjHEMLLSKecXy7H3BqADN/9niVu8r3KTMAKSH77PFeFsJrSg1Gjy8DHFH1dUG5CfapLwO8S7xUVnKS3XnD40hIj8+3rut65fmFS0tlJ1uVLwKcIV5aKz/hEkIWLr3ETLyqIYuXnuImX4WQRUsVJX6R44ze8fR+fng0xGT85K4sWCobcnL6GAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOjkD+EuvMoWU0C7AAAAAElFTkSuQmCC';

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
