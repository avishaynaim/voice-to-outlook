// Shared by index.html and taskpane.html: config, gist client, helpers.
const $ = id => document.getElementById(id);
let cfg = JSON.parse(localStorage.getItem('v2o-cfg') || '{}');

function toggleSettings() {
  const s = $('settings');
  s.style.display = s.style.display === 'block' ? 'none' : 'block';
  $('token').value = cfg.token || '';
  $('gistId').value = cfg.gistId || '';
}
function saveSettings() {
  cfg = { token: $('token').value.trim(), gistId: $('gistId').value.trim() };
  localStorage.setItem('v2o-cfg', JSON.stringify(cfg));
  $('settings').style.display = 'none';
  showMsg('Settings saved', true);
  loadList();
}
function showMsg(t, ok) { $('msg').textContent = t; $('msg').className = ok ? 'ok' : 'err'; setTimeout(() => $('msg').textContent = '', 4000); }
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

async function gistGet() {
  const r = await fetch('https://api.github.com/gists/' + cfg.gistId, {
    headers: { 'Authorization': 'Bearer ' + cfg.token, 'Accept': 'application/vnd.github+json' },
    cache: 'no-store'
  });
  if (!r.ok) throw new Error('Read failed (' + r.status + ') — check token/gist ID in ⚙️');
  const g = await r.json();
  const f = g.files && g.files['transcripts.json'];
  if (!f) return { items: [] };
  if (f.truncated) throw new Error('Read failed (transcripts truncated)');
  try { return JSON.parse(f.content); } catch (_) { throw new Error('Read failed (stored transcripts unreadable; not overwriting)'); }
}
async function gistSave(data) {
  const r = await fetch('https://api.github.com/gists/' + cfg.gistId, {
    method: 'PATCH',
    headers: { 'Authorization': 'Bearer ' + cfg.token, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: { 'transcripts.json': { content: JSON.stringify(data, null, 1) } } })
  });
  if (!r.ok) throw new Error('Save failed (' + r.status + ')');
}
