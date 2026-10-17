(() => {
  const $ = id => document.getElementById(id);
  const loginPanel = $('loginPanel');
  const dashboard = $('dashboard');
  const logoutBtn = $('logoutBtn');
  const loginMessage = $('loginMessage');
  const addMessage = $('addMessage');
  const listMessage = $('listMessage');
  const rows = $('recipientRows');

  function setMessage(el, text, isError = false) {
    el.textContent = text;
    el.classList.toggle('error', isError);
  }
  async function api(url, options = {}) {
    const response = await fetch(url, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    let body = {};
    try { body = await response.json(); } catch {}
    if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
    return body;
  }
  function showDashboard(yes) {
    loginPanel.classList.toggle('hidden', yes);
    dashboard.classList.toggle('hidden', !yes);
    logoutBtn.classList.toggle('hidden', !yes);
  }
  async function loadRows() {
    const data = await api('/api/admin/recipients');
    rows.replaceChildren();
    if (!data.recipients.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 5; td.className = 'muted'; td.textContent = 'No recipients yet.';
      tr.appendChild(td); rows.appendChild(tr); return;
    }
    for (const r of data.recipients) {
      const tr = document.createElement('tr');
      const walletTd = document.createElement('td');
      walletTd.innerHTML = `<strong>#${Number(r.id)}</strong><br>`;
      const wallet = document.createElement('code'); wallet.textContent = r.address;
      walletTd.appendChild(wallet);
      if (r.note) { const note = document.createElement('div'); note.className = 'muted'; note.textContent = r.note; walletTd.appendChild(note); }

      const amountTd = document.createElement('td'); amountTd.textContent = `${r.amount} GARET`;
      const statusTd = document.createElement('td');
      const pill = document.createElement('span'); pill.className = `status-pill ${r.status}`; pill.textContent = r.status; statusTd.appendChild(pill);
      const txTd = document.createElement('td');
      if (r.tx_hash) {
        const link = document.createElement('a'); link.href = `https://bscscan.com/tx/${encodeURIComponent(r.tx_hash)}`; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = `${r.tx_hash.slice(0, 10)}…`; link.className = 'muted'; txTd.appendChild(link);
      } else txTd.textContent = '—';

      const actionTd = document.createElement('td');
      const actions = document.createElement('div'); actions.className = 'table-actions';
      const edit = document.createElement('button'); edit.className = 'small-btn'; edit.textContent = 'Update';
      edit.addEventListener('click', async () => {
        const status = prompt('Status: pending, paid, or failed', r.status);
        if (status === null) return;
        const normalized = status.trim().toLowerCase();
        if (!['pending','paid','failed'].includes(normalized)) { setMessage(listMessage, 'Status must be pending, paid, or failed.', true); return; }
        let tx_hash = r.tx_hash || '';
        if (normalized === 'paid') {
          tx_hash = prompt('Enter transaction hash after the transfer is complete:', tx_hash) || '';
        } else if (confirm('Change transaction hash? Choose OK to enter a new hash, Cancel to keep current.')) {
          tx_hash = prompt('Transaction hash (blank to clear):', tx_hash) || '';
        }
        try {
          await api(`/api/admin/recipients/${r.id}`, { method: 'PATCH', body: JSON.stringify({ status: normalized, tx_hash, note: r.note || '' }) });
          setMessage(listMessage, 'Record updated. Remember: this is not on-chain verification.');
          await loadRows();
        } catch (e) { setMessage(listMessage, e.message, true); }
      });
      const remove = document.createElement('button'); remove.className = 'small-btn'; remove.textContent = 'Delete';
      remove.addEventListener('click', async () => {
        if (!confirm(`Delete recipient #${r.id}?`)) return;
        try { await api(`/api/admin/recipients/${r.id}`, { method: 'DELETE' }); setMessage(listMessage, 'Recipient deleted.'); await loadRows(); }
        catch (e) { setMessage(listMessage, e.message, true); }
      });
      actions.append(edit, remove); actionTd.appendChild(actions);
      tr.append(walletTd, amountTd, statusTd, txTd, actionTd);
      rows.appendChild(tr);
    }
  }

  $('loginForm').addEventListener('submit', async e => {
    e.preventDefault(); setMessage(loginMessage, 'Signing in…');
    try {
      await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password: $('adminPassword').value }) });
      $('adminPassword').value = '';
      showDashboard(true); setMessage(loginMessage, '');
      await loadRows();
    } catch (err) { setMessage(loginMessage, err.message, true); }
  });

  $('recipientForm').addEventListener('submit', async e => {
    e.preventDefault(); setMessage(addMessage, 'Adding recipient…');
    try {
      await api('/api/admin/recipients', { method: 'POST', body: JSON.stringify({
        address: $('walletAddress').value.trim(),
        amount: $('amount').value.trim(),
        note: $('note').value.trim()
      }) });
      $('recipientForm').reset(); setMessage(addMessage, 'Recipient added.');
      await loadRows();
    } catch (err) { setMessage(addMessage, err.message, true); }
  });

  $('refreshBtn').addEventListener('click', async () => {
    try { await loadRows(); setMessage(listMessage, 'List refreshed.'); }
    catch (e) { setMessage(listMessage, e.message, true); showDashboard(false); }
  });
  $('exportBtn').addEventListener('click', async () => {
    try {
      const response = await fetch('/api/admin/export.csv', { credentials: 'same-origin' });
      if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error || 'Export failed.'); }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'garet-airdrop-recipients.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { setMessage(listMessage, e.message, true); }
  });
  logoutBtn.addEventListener('click', async () => {
    try { await api('/api/admin/logout', { method: 'POST', body: '{}' }); } catch {}
    showDashboard(false); setMessage(loginMessage, 'Logged out.');
  });

  api('/api/admin/session').then(async () => { showDashboard(true); await loadRows(); }).catch(() => showDashboard(false));
})();
