'use strict';

// Same rule as InviteCode.normalize in the app (Bulcup/Account/Account.swift): ignore case, spaces and hyphens,
// then exactly 6 of 23456789ABCDEFGHJKLMNPQRSTUVWXYZ (no 0/O/1/I). Anything else is not a code.
function normalizeCode(input) {
  const cleaned = String(input).toUpperCase().replace(/[\s-]/g, '');
  return /^[2-9A-HJ-NP-Z]{6}$/.test(cleaned) ? cleaned : null;
}

if (typeof document !== 'undefined') {
  const card = document.getElementById('code-card');
  const codeEl = document.getElementById('code');
  const noCode = document.getElementById('no-code');
  const status = document.getElementById('copy-status');

  // The code is only in the fragment (#K7M2QX), which the browser never sends to a server.
  const render = () => {
    let raw = location.hash.slice(1);
    try { raw = decodeURIComponent(raw); } catch (e) { /* keep raw; it fails validation anyway */ }
    const code = normalizeCode(raw);
    codeEl.textContent = code || '';
    card.hidden = !code;
    noCode.hidden = Boolean(code);
    status.textContent = '';
  };

  document.getElementById('copy').addEventListener('click', async () => {
    const code = codeEl.textContent;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      status.textContent = '코드를 복사했어요.';
    } catch (e) {
      getSelection().selectAllChildren(codeEl);
      status.textContent = '코드를 길게 눌러 복사해 주세요.';
    }
  });

  addEventListener('hashchange', render);
  render();
}
