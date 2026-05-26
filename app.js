/**
 * OmniVault — app.js
 * SPA client-side simulando arquitetura de 3 camadas
 * Persistência: LocalStorage
 */

const STORAGE_KEYS = {
  USERS: 'omnivault_users',
  LOCKERS: 'omnivault_lockers',
  SESSION: 'omnivault_session',
  DEMO_CODE: 'omnivault_demo_code'
};

const appState = {
  profile: 'estafeta',
  activeLocker: null
};

/* ── 1. Inicialização & seed ─────────────────────────────────── */

function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(
      STORAGE_KEYS.USERS,
      JSON.stringify([{ id: 1, username: 'estafeta1', password: 'passwordetft1', role: 'estafeta' },
        { id: 2, username: 'estafeta2', password: 'passwordetft2', role: 'estafeta' }
      ])
    );
    logConsole('info', 'DATA SEED: User "estafeta1" created');
  }

  if (!localStorage.getItem(STORAGE_KEYS.LOCKERS)) {
    const lockers = [
      { id: 1, size: 'S', status: 'Livre', pin: null },
      { id: 2, size: 'S', status: 'Livre', pin: null },
      { id: 3, size: 'S', status: 'Livre', pin: null },
      { id: 4, size: 'M', status: 'Livre', pin: null },
      { id: 5, size: 'M', status: 'Livre', pin: null },
      { id: 6, size: 'M', status: 'Livre', pin: null },
      { id: 7, size: 'L', status: 'Livre', pin: null },
      { id: 8, size: 'L', status: 'Livre', pin: null },
      { id: 9, size: 'L', status: 'Livre', pin: null }
    ];
    localStorage.setItem(STORAGE_KEYS.LOCKERS, JSON.stringify(lockers));
    logConsole('info', 'DATA SEED: 9 lockers (3×S, 3×M, 3×L) — status Livre');
  }
}

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
}

function getLockers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCKERS) || '[]');
}

function saveLockers(lockers) {
  localStorage.setItem(STORAGE_KEYS.LOCKERS, JSON.stringify(lockers));
}

function saveSession(data) {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(data));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

function saveDemoCode(lockerId, pin) {
  localStorage.setItem(
    STORAGE_KEYS.DEMO_CODE,
    JSON.stringify({ pin, lockerId, createdAt: new Date().toISOString() })
  );
}

function getDemoCode() {
  const raw = localStorage.getItem(STORAGE_KEYS.DEMO_CODE);
  return raw ? JSON.parse(raw) : null;
}

function clearDemoCode() {
  localStorage.removeItem(STORAGE_KEYS.DEMO_CODE);
}

function updateDemoCodeHint() {
  const hint = document.getElementById('console-demo-code');
  const valueEl = document.getElementById('console-demo-code-value');
  const lockerRef = document.getElementById('console-demo-locker-ref');
  if (!hint || !valueEl) return;

  const demo = getDemoCode();
  if (demo?.pin) {
    valueEl.textContent = demo.pin;
    if (lockerRef) {
      lockerRef.textContent = demo.lockerId ? ` · Cacifo #${demo.lockerId}` : '';
    }
    hint.classList.remove('hidden');
  } else {
    hint.classList.add('hidden');
  }
}

function generatePin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getTimestamp() {
  const n = new Date();
  const dd = String(n.getDate()).padStart(2, '0');
  const mm = String(n.getMonth() + 1).padStart(2, '0');
  const yyyy = n.getFullYear();
  const hh = String(n.getHours()).padStart(2, '0');
  const min = String(n.getMinutes()).padStart(2, '0');
  return `[${dd}-${mm}-${yyyy} ${hh}:${min}]`;
}

/* ── 2. Consola de debug ─────────────────────────────────────── */

function logConsole(type, message) {
  const area = document.getElementById('console-log-area');
  if (!area) return;

  const line = document.createElement('div');
  line.className = `log-line log-${type}`;
  line.textContent = `${getTimestamp()} ${message}`;
  area.appendChild(line);
  area.scrollTop = area.scrollHeight;
}

function clearConsole() {
  const area = document.getElementById('console-log-area');
  if (area) {
    area.innerHTML = '<div class="log-line log-system">[ Console cleared ]</div>';
  }
}

/* ── 3. Mock API (rotas RESTful) ─────────────────────────────── */

function api_login(username, password) {
  logConsole('call', 'API CALL: POST /api/v1/auth/login');

  const user = getUsers().find(u => u.username === username && u.password === password);
  if (user) {
    logConsole('success', `API CALL: POST /api/v1/auth/login - 200 OK (user: ${username})`);
    return { success: true, user, status: 200 };
  }

  logConsole('error', 'API CALL: POST /api/v1/auth/login - 401 Unauthorized');
  return { success: false, status: 401 };
}

function api_getAvailableLockers() {
  logConsole('call', 'API CALL: GET /api/v1/lockers/available');

  const counts = { S: 0, M: 0, L: 0 };
  getLockers().forEach(l => {
    if (l.status === 'Livre') counts[l.size]++;
  });

  logConsole('success', `API CALL: GET /api/v1/lockers/available - 200 OK { S:${counts.S}, M:${counts.M}, L:${counts.L} }`);
  return { success: true, counts, status: 200 };
}

function api_openLocker(size) {
  const lockers = getLockers();
  const target = lockers.find(l => l.size === size && l.status === 'Livre');

  if (!target) {
    logConsole('call', `API CALL: POST /api/v1/lockers/{id}/open - 409 Conflict (size ${size})`);
    return { success: false, status: 409 };
  }

  logConsole('call', `API CALL: POST /api/v1/lockers/${target.id}/open`);

  target.status = 'Reservado';
  saveLockers(lockers);

  logConsole('success', `API CALL: POST /api/v1/lockers/${target.id}/open - 200 OK`);
  return { success: true, locker: { ...target }, status: 200 };
}

function api_confirmDeposit(lockerId) {
  logConsole('call', 'API CALL: POST /api/v1/deposits/confirm');

  const lockers = getLockers();
  const locker = lockers.find(l => l.id === lockerId);

  if (!locker) {
    logConsole('error', 'API CALL: POST /api/v1/deposits/confirm - 404 Not Found');
    return { success: false, status: 404 };
  }

  const pin = generatePin();
  locker.status = 'Ocupado';
  locker.pin = pin;
  saveLockers(lockers);
  saveDemoCode(lockerId, pin);

  logConsole('success', `API CALL: POST /api/v1/deposits/confirm - 201 Created (PIN Generated)`);
  return { success: true, pin, lockerId, status: 201 };
}

function api_validateCollection(pin) {
  logConsole('call', 'API CALL: POST /api/v1/collections/validate');

  const locker = getLockers().find(l => l.pin === pin && l.status === 'Ocupado');

  if (!locker) {
    logConsole('error', 'API CALL: POST /api/v1/collections/validate - 401 Unauthorized');
    return { success: false, status: 401 };
  }

  logConsole('success', `API CALL: POST /api/v1/collections/validate - 200 OK (Locker #${locker.id})`);
  return { success: true, locker: { ...locker }, status: 200 };
}

/* ── 4. Navegação SPA ────────────────────────────────────────── */

function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.add('hidden');
    v.classList.remove('active-view');
  });

  const target = document.getElementById(viewId);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active-view');
  }
}

function showClientPanel(panelId) {
  ['client-pin-panel', 'client-collect-panel', 'client-thankyou-panel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', id !== panelId);
  });
}

function switchProfile(profile) {
  appState.profile = profile;
  appState.activeLocker = null;
  clearSession();

  document.getElementById('btn-profile-estafeta').classList.toggle('active', profile === 'estafeta');
  document.getElementById('btn-profile-cliente').classList.toggle('active', profile === 'cliente');

  if (profile === 'estafeta') {
    document.getElementById('input-username').value = '';
    document.getElementById('input-password').value = '';
    document.getElementById('login-error').classList.add('hidden');
    showView('view-login');
  } else {
    resetClientView();
    updateDemoCodeHint();
    showView('view-client');
  }

  logConsole('info', `PROFILE: ${profile}`);
}

function resetClientView() {
  appState.activeLocker = null;
  document.getElementById('input-client-pin').value = '';
  document.getElementById('pin-error').classList.add('hidden');
  showClientPanel('client-pin-panel');
  updateDemoCodeHint();
  logConsole('info', 'CLIENT: Returned to PIN input (Novo Levantamento)');
}

/* ── 5. Handlers — Estafeta ──────────────────────────────────── */

function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('input-username').value.trim();
  const password = document.getElementById('input-password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.classList.add('hidden');

  const result = api_login(username, password);

  if (result.success) {
    saveSession({ userId: result.user.id, username: result.user.username });
    refreshAvailability();
    showView('view-selection');
  } else {
    errorEl.classList.remove('hidden');
  }
}

function handleLogout() {
  clearSession();
  appState.activeLocker = null;
  showView('view-login');
  logConsole('info', 'SESSION: Estafeta logged out');
}

function refreshAvailability() {
  const { counts } = api_getAvailableLockers();
  document.getElementById('count-s').textContent = counts.S;
  document.getElementById('count-m').textContent = counts.M;
  document.getElementById('count-l').textContent = counts.L;

  document.getElementById('btn-size-s').disabled = counts.S === 0;
  document.getElementById('btn-size-m').disabled = counts.M === 0;
  document.getElementById('btn-size-l').disabled = counts.L === 0;
}

function selectSize(size) {
  const result = api_openLocker(size);

  if (!result.success) {
    alert(`Sem cacifos "${size}" disponíveis.`);
    refreshAvailability();
    return;
  }

  appState.activeLocker = { id: result.locker.id, size: result.locker.size };
  document.getElementById('deposit-status-msg').textContent =
    `Cacifo #${result.locker.id} Aberto com sucesso.`;
  showView('view-deposit');
}

function confirmDeposit() {
  if (!appState.activeLocker) return;

  const result = api_confirmDeposit(appState.activeLocker.id);
  if (!result.success) {
    alert('Erro ao confirmar depósito.');
    return;
  }

  showSmsModal(appState.activeLocker.id, result.pin);
}

function showSmsModal(lockerId, pin) {
  const now = new Date();
  document.getElementById('sms-time').textContent =
    `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  document.getElementById('sms-message-text').textContent =
    `OmniVault: A sua encomenda foi depositada no Cacifo #${lockerId}. Use o Token [${pin}] para o levantamento.`;

  document.getElementById('modal-sms').classList.remove('hidden');
  updateDemoCodeHint();
  logConsole('info', `SMS: Token ${pin} saved to LocalStorage (Locker #${lockerId})`);
}

function closeSmsModal() {
  document.getElementById('modal-sms').classList.add('hidden');
  appState.activeLocker = null;
  clearSession();
  document.getElementById('input-username').value = '';
  document.getElementById('input-password').value = '';
  showView('view-login');
  logConsole('info', 'SESSION: Deposit complete — back to login');
}

/* ── 6. Handlers — Cliente ───────────────────────────────────── */

function validatePin() {
  const pin = document.getElementById('input-client-pin').value.trim();
  const errorEl = document.getElementById('pin-error');
  errorEl.classList.add('hidden');

  if (!/^\d{6}$/.test(pin)) {
    errorEl.textContent = 'Introduza um código numérico de 6 dígitos.';
    errorEl.classList.remove('hidden');
    return;
  }

  const result = api_validateCollection(pin);

  if (!result.success) {
    errorEl.textContent = 'Código inválido ou já utilizado.';
    errorEl.classList.remove('hidden');
    return;
  }

  appState.activeLocker = { id: result.locker.id, size: result.locker.size };
  document.getElementById('collect-status-msg').innerHTML =
    `A porta do Cacifo <strong>#${result.locker.id}</strong> está aberta.`;

  showClientPanel('client-collect-panel');
}

function confirmCollection() {
  if (!appState.activeLocker) return;

  const lockerId = appState.activeLocker.id;
  const lockers = getLockers();
  const locker = lockers.find(l => l.id === lockerId);

  if (locker) {
    locker.status = 'Livre';
    locker.pin = null;
    saveLockers(lockers);
    clearDemoCode();
    refreshAvailability();
    logConsole('success', `COLLECTION: Locker #${lockerId} → Livre, PIN cleared`);
  }

  appState.activeLocker = null;
  showClientPanel('client-thankyou-panel');
}

/* ── 7. Arranque & event listeners ───────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  showView('view-login');
  updateDemoCodeHint();

  document.getElementById('form-login').addEventListener('submit', handleLogin);
  document.getElementById('btn-logout').addEventListener('click', handleLogout);
  document.getElementById('btn-confirm-deposit').addEventListener('click', confirmDeposit);
  document.getElementById('btn-validate-pin').addEventListener('click', validatePin);
  document.getElementById('btn-confirm-collection').addEventListener('click', confirmCollection);
  document.getElementById('btn-new-collection').addEventListener('click', resetClientView);
  document.getElementById('btn-close-modal').addEventListener('click', closeSmsModal);
  document.getElementById('btn-clear-console').addEventListener('click', clearConsole);

  document.querySelectorAll('[data-profile]').forEach(btn => {
    btn.addEventListener('click', () => switchProfile(btn.dataset.profile));
  });

  document.querySelectorAll('[data-size]').forEach(btn => {
    btn.addEventListener('click', () => selectSize(btn.dataset.size));
  });

  logConsole('system', 'OmniVault API ready. LocalStorage active.');
});
