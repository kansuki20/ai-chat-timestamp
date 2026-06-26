const toggle = document.querySelector('#toggle');
const status = document.querySelector('#status');
const confirmBox = document.querySelector('#confirm-box');
const confirmMsg = document.querySelector('#confirm-msg');
const confirmOk = document.querySelector('#confirm-ok');
const confirmCancel = document.querySelector('#confirm-cancel');


let pendingState = true;

// 현재 상태 로드
chrome.storage.local.get('enabled', (data) => {
  const enabled = data.enabled !== false;
  toggle.checked = enabled;
  status.textContent = enabled ? 'ON' : 'OFF';
});

toggle.addEventListener('click', (e) => {
  e.preventDefault();

  pendingState = !toggle.checked;
  confirmMsg.textContent = `타임스탬프를 ${pendingState ? 'ON' : 'OFF'} 하시겠습니까?`;
  confirmBox.style.display = 'block';
});

confirmOk.addEventListener('click', () => {
  toggle.checked = pendingState;
  status.textContent = pendingState ? 'ON' : 'OFF';
  chrome.storage.local.set({ enabled: pendingState });
  confirmBox.style.display = 'none';
});


confirmCancel.addEventListener('click', () => {
  confirmBox.style.display = 'none';
});
