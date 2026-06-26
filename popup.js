const toggle = document.querySelector('#toggle');
const status = document.querySelector('#status');
const confirmBox = document.querySelector('#confirm-box');
const confirmMsg = document.querySelector('#confirm-msg');
const confirmOk = document.querySelector('#confirm-ok');
const confirmCancel = document.querySelector('#confirm-cancel');
const formatInput = document.querySelector('#format-input');
const formatSave = document.querySelector('#format-save');
const formatReset = document.querySelector('#format-reset');
const preview = document.querySelector('#preview');

const DEFAULT_FORMAT = '[채팅시간:YYYY/MM/DD HH:mm:ss]';

function applyFormat(fmt) {
  const now = new Date();
  const kst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  return fmt
    .replace('YYYY', String(kst.getFullYear()))
    .replace('MM', String(kst.getMonth() + 1).padStart(2, '0'))
    .replace('DD', String(kst.getDate()).padStart(2, '0'))
    .replace('HH', String(kst.getHours()).padStart(2, '0'))
    .replace('mm', String(kst.getMinutes()).padStart(2, '0'))
    .replace('ss', String(kst.getSeconds()).padStart(2, '0'));
}

// 현재 상태 로드
chrome.storage.local.get(['enabled', 'format'], (data) => {
  const enabled = data.enabled !== false;
  toggle.checked = enabled;
  status.textContent = enabled ? 'ON' : 'OFF';

  const fmt = data.format || '';
  formatInput.value = fmt;
  updatePreview();
});

const TOKENS = ['YYYY', 'MM', 'DD', 'HH', 'mm', 'ss'];

function isValidFormat(fmt) {
  return TOKENS.some(token => fmt.includes(token));
}

function updatePreview() {
  const fmt = formatInput.value.trim() || DEFAULT_FORMAT;
  const valid = isValidFormat(fmt);
  preview.textContent = valid
    ? '미리보기: ' + applyFormat(fmt)
    : '⚠ YYYY MM DD HH mm ss 중 하나는 있어야 합니다';
  preview.style.color = valid ? '#4caf50' : '#e57373';
}

formatInput.addEventListener('input', updatePreview);

formatSave.addEventListener('click', () => {
  const fmt = formatInput.value.trim();
  if (fmt && !isValidFormat(fmt)) {
    preview.textContent = '⚠ 저장 불가: 토큰이 없습니다';
    preview.style.color = '#e57373';
    return;
  }
  chrome.storage.local.set({ format: fmt || DEFAULT_FORMAT }, () => {
    formatSave.textContent = '저장됨!';
    setTimeout(() => { formatSave.textContent = '저장'; }, 1000);
  });
});

formatReset.addEventListener('click', () => {
  formatInput.value = '';
  chrome.storage.local.set({ format: DEFAULT_FORMAT }, () => {
    updatePreview();
    formatReset.textContent = '완료';
    setTimeout(() => { formatReset.textContent = '초기화'; }, 1000);
  });
});

// 토글
toggle.addEventListener('click', (e) => {
  e.preventDefault();

  const willEnable = !toggle.checked;
  confirmMsg.textContent = `타임스탬프를 ${willEnable ? 'ON' : 'OFF'} 하시겠습니까?`;
  confirmBox.style.display = 'block';
});

confirmOk.addEventListener('click', () => {
  toggle.checked = !toggle.checked;
  const enabled = toggle.checked;
  confirmBox.style.display = 'none';
  status.textContent = enabled ? 'ON' : 'OFF';
  chrome.storage.local.set({ enabled });
});

confirmCancel.addEventListener('click', () => {
  confirmBox.style.display = 'none';
});