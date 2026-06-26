(() => {
  let isEnabled = true;
  let currentFormat = '[채팅시간:YYYY/MM/DD HH:mm:ss]';

  chrome.storage.local.get(['enabled', 'format'], (data) => {
    isEnabled = data.enabled !== false;
    if (data.format) currentFormat = data.format;
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled !== undefined)
      isEnabled = changes.enabled.newValue;
    if (changes.format !== undefined)
      currentFormat = changes.format.newValue;
  });

  function getAiType() {
    const href = location.href;
    if (href.includes('chatgpt.com')) return 'chatgpt';
    if (href.includes('gemini.google')) return 'gemini';
    if (href.includes('claude.ai')) return 'claude';
    return 'unknown';
  }

  const aiType = getAiType();
  if (aiType === 'unknown') return;

  function getKSTTimestamp() {
    const now = new Date();
    const kst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    return currentFormat
      .replace('YYYY', String(kst.getFullYear()))
      .replace('MM', String(kst.getMonth() + 1).padStart(2, '0'))
      .replace('DD', String(kst.getDate()).padStart(2, '0'))
      .replace('HH', String(kst.getHours()).padStart(2, '0'))
      .replace('mm', String(kst.getMinutes()).padStart(2, '0'))
      .replace('ss', String(kst.getSeconds()).padStart(2, '0'));
  }

  function getEditor() {
    switch (aiType) {
      case 'chatgpt': return document.querySelector('#prompt-textarea');
      case 'gemini': return document.querySelector('.ql-editor');
      case 'claude': return document.querySelector('div[contenteditable="true"][data-testid="chat-input"]');
      default: return null;
    }
  }

  function getSendButton(e) {
    const target = e != null ? e.target : null;
    switch (aiType) {
      case 'chatgpt':
        return target == null
          ? document.querySelector('#composer-submit-button')
          : target.closest('#composer-submit-button');
      case 'gemini':
        return target == null
          ? document.querySelector('[data-test-id=send-button-container]')
          : target.closest('[data-test-id=send-button-container]');
      case 'claude':
        return target == null
          ? document.querySelector(`[aria-label='메시지 보내기']`)
          : target.closest(`[aria-label='메시지 보내기']`);
      default:
        return null;
    }
  }

  // 포맷에서 타임스탬프 패턴을 동적으로 생성
  function buildTimestampPattern() {
    const escaped = currentFormat
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // regex 특수문자 이스케이프
      .replace('YYYY', '\\d{4}')
      .replace('MM', '\\d{2}')
      .replace('DD', '\\d{2}')
      .replace('HH', '\\d{2}')
      .replace('mm', '\\d{2}')
      .replace('ss', '\\d{2}');
    return new RegExp('^' + escaped + '\n');
  }

  function insertTimestamp(checkBtn = true) {
    if (!isEnabled) return;

    const editor = getEditor();
    if (!editor) return;
    if (checkBtn && !getSendButton()) return;

    const stamp = getKSTTimestamp();
    const timestampPattern = buildTimestampPattern();

    switch (aiType) {
      case 'chatgpt': case 'gemini': {
        const firstP = editor.querySelector('p');
        if (firstP && timestampPattern.test(firstP.textContent + '\n')) {
          firstP.textContent = stamp;
          return;
        }
        const p = document.createElement('p');
        p.textContent = stamp;
        editor.insertBefore(p, editor.firstChild);
        break;
      }
      case 'claude': {
        const firstNode = editor.childNodes[0];
        if (firstNode && timestampPattern.test(firstNode.textContent.trim() + '\n')) {
          firstNode.textContent = stamp;
          return;
        }
        const p = document.createElement('p');
        p.textContent = stamp;
        editor.insertBefore(p, editor.firstChild);
        break;
      }
      default:
        return;
    }
  }

  function attachListener() {
    if (!document._click_attached) {
      document.addEventListener('mousedown', (e) => {
        if (getSendButton(e) != null) insertTimestamp();
      }, true);
      document._click_attached = true;
    }

    if (!document._key_attached) {
      document.addEventListener('keydown', (e) => {
        if (e.key === "Enter" && !e.shiftKey) insertTimestamp(false);
      }, true);
      document._key_attached = true;
    }
  }

  const observer = new MutationObserver(() => attachListener());
  observer.observe(document.body, { childList: true, subtree: true });

  attachListener();
})();