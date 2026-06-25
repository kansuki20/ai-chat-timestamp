(() => {
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
          return document.querySelector('[data-test-id=send-button-container] .mat-focus-indicator');
        else
          return target.closest('[data-test-id=send-button-container] .mat-focus-indicator');
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


  function insertTimestamp() {
    const editor = getEditor();
    if (!editor) return;

    const stamp = getKSTTimestamp();
    const timestampPattern = /^\[채팅시간:\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}\]\n/;

    switch (aiType) {
      case 'chatgpt': case 'gemini': {
        // gemini, gpt 같은 방식임
        const sendBtn = getSendButton();
        if (!sendBtn)
          return;
        // 첫 요소에 이미 시간 적혀있으면
        const firstP = editor.querySelector('p');
        /*if (firstP && timestampPattern.test(firstP.textContent + '\n')) {
          firstP.textContent = stamp;
          return;
        }*/

        const p = document.createElement('p');
        p.textContent = stamp;
        editor.insertBefore(p, editor.firstChild);
        break;
      }
      case 'claude': {
        const sendBtn = getSendButton();
        if (!sendBtn) return;

        const currentText = editor.innerText.trim();
        if (!currentText) return;

        const newText = stamp + "\n" + currentText;
        // 시간 적힌 것 중복 체크
        /*let newText;
        if (timestampPattern.test(currentText))
          newText = currentText.replace(timestampPattern, stamp + "\n");
        else
          newText = stamp + "\n" + currentText;*/

        editor.focus();

        // 전체 선택 후 교체해야 기존 텍스트 안 겹침
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editor);
        selection.removeAllRanges();
        selection.addRange(range);

        document.execCommand("insertText", false, newText);

        break;
      }
      default:
        return;
    }
  }

  function handleKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      const editor = getEditor();
      if (!editor) return;
      const text = editor.innerText.trim();
      if (!text) return;
      insertTimestamp();
    }
  }

  function handleClick(e) {
    const btn = getSendButton(e);
    if (!btn) return;

    const editor = getEditor();
    if (!editor) return;
    const text = editor.innerText.trim();
    if (!text) return;
    insertTimestamp();
  }

  document.addEventListener("keydown", handleKeydown, true);
  document.addEventListener("click", handleClick, true);
})();
