const toggle = document.querySelector('#toggle');
const status = document.querySelector('#status');
const confirmBox = document.querySelector('#confirm-box');
const confirmMsg = document.querySelector('#confirm-msg');
const confirmOk = document.querySelector('#confirm-ok');
const confirmCancel = document.querySelector('#confirm-cancel');

// 현재 상태 로드
chrome.storage.local.get('enabled', (data) => {
  const enabled = data.enabled !== false;
  toggle.checked = enabled;
  status.textContent = enabled ? 'ON' : 'OFF';
});

toggle.addEventListener('click', (e) => {
  e.preventDefault();

  const willEnable = !toggle.checked;
  confirmMsg.textContent = `타임스탬프를 ${willEnable ? 'ON' : 'OFF'} 하시겠습니까? 현재 탭이 새로고침됩니다.`;
  confirmBox.style.display = 'block';
});

confirmOk.addEventListener('click', () => {
  toggle.checked = !toggle.checked; // 여기서 실제로 변경
  const enabled = toggle.checked;
  confirmBox.style.display = 'none';
  status.textContent = enabled ? 'ON' : 'OFF';

  chrome.storage.local.set({ enabled }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.reload(tabs[0].id);
    });
  });
});


confirmCancel.addEventListener('click', () => {
  confirmBox.style.display = 'none';
});
