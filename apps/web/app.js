const API_BASE = localStorage.getItem('entrustory_api_base') || 'http://localhost:3001/api/v1';

const workItemIdInput = document.getElementById('workItemId');
const fileInput = document.getElementById('fileInput');
const createBtn = document.getElementById('createBtn');
const createOutput = document.getElementById('createOutput');

const versionIdInput = document.getElementById('versionId');
const shaInput = document.getElementById('shaInput');
const verifyBtn = document.getElementById('verifyBtn');
const verifyOutput = document.getElementById('verifyOutput');

async function sha256Hex(file) {
  const bytes = await file.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

createBtn.addEventListener('click', async () => {
  const file = fileInput.files?.[0];
  if (!file) {
    createOutput.textContent = 'Please select a file first.';
    return;
  }

  createOutput.textContent = 'Hashing file...';
  const hash = await sha256Hex(file);
  shaInput.value = hash;

  const payload = {
    work_item_id: workItemIdInput.value.trim(),
    files: [{ file_name: file.name, file_size: file.size, sha256_hash: hash }]
  };

  const res = await fetch(`${API_BASE}/versions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  createOutput.textContent = JSON.stringify(data, null, 2);

  if (res.ok) {
    versionIdInput.value = data.version_id;
  }
});

verifyBtn.addEventListener('click', async () => {
  const payload = { version_id: versionIdInput.value.trim(), sha256_hash: shaInput.value.trim() };
  const res = await fetch(`${API_BASE}/verify`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  verifyOutput.textContent = JSON.stringify(data, null, 2);
});
