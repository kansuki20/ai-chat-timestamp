const i18n = chrome.i18n.getMessage.bind(chrome.i18n);

const toggle = document.querySelector('#toggle');
const status = document.querySelector('#status');
const formatInput = document.querySelector('#format-input');
const formatSave = document.querySelector('#format-save');
const formatReset = document.querySelector('#format-reset');
const preview = document.querySelector('#preview');

// i18n 텍스트 세팅
document.querySelector('#format-label').textContent = i18n('format_label');
document.querySelector('#format-hint').textContent = i18n('format_hint');
formatInput.placeholder = i18n('format_placeholder');
formatSave.textContent = i18n('format_save');
formatReset.textContent = i18n('format_reset');

const DEFAULT_FORMAT = i18n('format_placeholder');
const TOKENS = ['YYYY', 'MM', 'DD', 'HH', 'mm', 'ss'];

function isValidFormat(fmt) {
  return TOKENS.some(token => fmt.includes(token));
}

function applyFormat(fmt) {
  const d = new Date();
  return fmt
    .replace('YYYY', String(d.getFullYear()))
    .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
    .replace('DD', String(d.getDate()).padStart(2, '0'))
    .replace('HH', String(d.getHours()).padStart(2, '0'))
    .replace('mm', String(d.getMinutes()).padStart(2, '0'))
    .replace('ss', String(d.getSeconds()).padStart(2, '0'));
}

function updatePreview() {
  const fmt = formatInput.value.trim() || DEFAULT_FORMAT;
  const valid = isValidFormat(fmt);
  preview.textContent = valid
    ? i18n('format_preview') + applyFormat(fmt)
    : i18n('format_error_no_token');
  preview.style.color = valid ? '#4caf50' : '#e57373';
}

// 현재 상태 로드
chrome.storage.local.get(['enabled', 'format'], (data) => {
  const enabled = data.enabled !== false;
  toggle.checked = enabled;
  status.textContent = enabled ? i18n('status_on') : i18n('status_off');

  formatInput.value = data.format || '';
  updatePreview();
});

formatInput.addEventListener('input', updatePreview);

formatSave.addEventListener('click', () => {
  const fmt = formatInput.value.trim();
  if (fmt && !isValidFormat(fmt)) {
    preview.textContent = i18n('format_error_save');
    preview.style.color = '#e57373';
    return;
  }
  chrome.storage.local.set({ format: fmt || DEFAULT_FORMAT }, () => {
    formatSave.textContent = i18n('format_saved');
    setTimeout(() => { formatSave.textContent = i18n('format_save'); }, 1000);
  });
});

formatReset.addEventListener('click', () => {
  formatInput.value = '';
  chrome.storage.local.set({ format: DEFAULT_FORMAT }, () => {
    updatePreview();
    formatReset.textContent = i18n('format_reset_done');
    setTimeout(() => { formatReset.textContent = i18n('format_reset'); }, 1000);
  });
});

// 토글
toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  status.textContent = enabled ? i18n('status_on') : i18n('status_off');
  chrome.storage.local.set({ enabled });
});