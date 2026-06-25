(() => {
  let isEnabled = true; // 활성화

  chrome.storage.local.get('enabled', (data) => {
    isEnabled = data.enabled !== false;
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled !== undefined)
      isEnabled = changes.enabled.newValue;
  });

  // 현재 사용중인 ai 타입 가져오기
  function getAiType() {
    const href = location.href;
    if (href.includes('chatgpt.com'))
      return 'chatgpt';
    if (href.includes('gemini.google'))
      return 'gemini';
    if (href.includes('claude.ai'))
      return 'claude';
    return 'unknown';
  }

  const aiType = getAiType();
  if (aiType === 'unknown')
    return;


  function getKSTTimestamp() {
    const now = new Date();
    const kst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    const yyyy = kst.getFullYear();
    const mm = String(kst.getMonth() + 1).padStart(2, "0");
    const dd = String(kst.getDate()).padStart(2, "0");
    const hh = String(kst.getHours()).padStart(2, "0");
    const min = String(kst.getMinutes()).padStart(2, "0");
    const ss = String(kst.getSeconds()).padStart(2, "0");
    return `[채팅시간:${yyyy}/${mm}/${dd} ${hh}:${min}:${ss}]`;
  }

  // 텍스트 입력창 가져오기
  function getEditor() {
    switch (aiType) {
      case 'chatgpt':
        return document.querySelector('#prompt-textarea'); // TODO
      case 'gemini':
        return document.querySelector('.ql-editor');
      case 'claude':
        return document.querySelector('div[contenteditable="true"][data-testid="chat-input"]');
      default:
        return null;
    }
  }

  // 채팅 보내는 클릭버튼 요소 가져오기
  function getSendButton(e) {
    const target = e != null ? e.target : null;
    switch (aiType) {
      case 'chatgpt':
        if (target == null)
          return document.querySelector('#composer-submit-button');
        else
          return target.closest('#composer-submit-button');
      case 'gemini': {
        if (target == null)
          return document.querySelector('[data-test-id=send-button-container]');
        else
          return target.closest('[data-test-id=send-button-container]');
      }
      case 'claude':
        if (target == null)
          return document.querySelector(`[aria-label='메시지 보내기']`);
        else
          return target.closest(`[aria-label='메시지 보내기']`);
      default:
        return null;
    }
  }


  function insertTimestamp(
    checkBtn = true
  ) {
    if (!isEnabled)
      return;

    const editor = getEditor();
    if (!editor) return;
    if (checkBtn && !getSendButton())
      return;

    const stamp = getKSTTimestamp();
    const timestampPattern = /^\[채팅시간:\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}\]\n/;

    switch (aiType) {
      case 'chatgpt': case 'gemini': {
        // gemini, gpt 같은 방식임
        // 첫 요소에 이미 시간 적혀있으면
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
        if (timestampPattern.test(firstNode.textContent.trim())) {
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
        if (getSendButton(e) != null)
          insertTimestamp();
      }, true);
      document._click_attached = true;
    }

    if (!document._key_attached) {
      document.addEventListener('keydown', (e) => {
        if (e.key === "Enter" && !e.shiftKey)
          insertTimestamp(false);
      }, true);
      document._key_attached = true;
    }
  }

  const observer = new MutationObserver(() => attachListener());
  observer.observe(document.body, { childList: true, subtree: true });

  attachListener();
})();
