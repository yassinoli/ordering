(() => {
  const app = document.querySelector('#app');
  let socket;
  let alarmTimer;
  let audio;
  const escape = (value = '') => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  const restaurant = () => { try { return JSON.parse(localStorage.getItem('orderflow_restaurant')); } catch { return null; } };
  const token = () => localStorage.getItem('orderflow_token');
  const navigate = path => { history.pushState({}, '', path); render(); };
  const request = async (path, options = {}, authenticated = false) => {
    const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
    if (authenticated && token()) headers.Authorization = `Bearer ${token()}`;
    const response = await fetch(path, { ...options, headers });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message || 'Something went wrong. Please try again.');
    return body;
  };
  const header = () => {
    const user = restaurant();
    return `<header><a href="/dashboard" data-link>OrderFlow</a>${user ? `<nav><span>${escape(user.name)}</span><a href="/dashboard" data-link>Dashboard</a><button class="header-button" id="sign-out">Sign out</button></nav>` : '<nav><a href="/login" data-link>Sign in</a></nav>'}</header>`;
  };
  const connect = () => {
    if (!window.io) return null;
    if (socket) socket.disconnect();
    socket = window.io({ transports: ['websocket'], auth: { token: token() } });
    return socket;
  };
  const bindNavigation = () => {
    document.querySelectorAll('[data-link]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); navigate(link.getAttribute('href')); }));
    document.querySelector('#sign-out')?.addEventListener('click', () => { localStorage.removeItem('orderflow_token'); localStorage.removeItem('orderflow_restaurant'); socket?.disconnect(); navigate('/login'); });
  };
  const authView = registerMode => {
    app.innerHTML = `${header()}<main><section class="auth-card"><p class="eyebrow">OrderFlow for restaurants</p><h1>${registerMode ? 'Create your restaurant' : 'Welcome back'}</h1><p>Each restaurant has its own secure dashboard and orders.</p><form id="auth-form">${registerMode ? '<input name="name" placeholder="Restaurant name" required>' : ''}<input name="email" type="email" placeholder="Email address" required><input name="password" type="password" minlength="8" placeholder="Password (8+ characters)" required><button>${registerMode ? 'Create account' : 'Sign in'}</button></form><p class="error" id="auth-error"></p><button class="link-button" id="toggle-auth">${registerMode ? 'Already have an account? Sign in' : 'New restaurant? Create an account'}</button></section></main>`;
    bindNavigation();
    document.querySelector('#toggle-auth').onclick = () => navigate(registerMode ? '/login' : '/register');
    document.querySelector('#auth-form').onsubmit = async event => {
      event.preventDefault(); const form = new FormData(event.currentTarget); const button = event.currentTarget.querySelector('button'); const error = document.querySelector('#auth-error');
      button.disabled = true; button.textContent = 'Please wait...'; error.textContent = '';
      try { const result = await request(`/api/auth/${registerMode ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify(Object.fromEntries(form)) }); localStorage.setItem('orderflow_token', result.token); localStorage.setItem('orderflow_restaurant', JSON.stringify(result.restaurant)); navigate('/dashboard'); }
      catch (err) { error.textContent = err.message; button.disabled = false; button.textContent = registerMode ? 'Create account' : 'Sign in'; }
    };
  };
  const dashboardView = async () => {
    if (!token()) return navigate('/login');
    app.innerHTML = `${header()}<main><section class="page-heading"><p class="eyebrow">Kitchen command center</p><h1>Staff dashboard</h1><p>Create an order, hand over its QR code, then notify the guest when it is ready.</p></section><section class="create-order"><h2>Create order</h2><form id="create-order"><input name="customerName" placeholder="Customer name"><input name="tableNumber" placeholder="or table number"><input name="items" placeholder="Items, comma separated" required><button>Create & show QR</button></form><p class="error" id="order-error"></p></section><section id="qr-result"></section><section class="orders"><div class="section-title"><h2>Active pending orders</h2><span id="order-count">0</span></div><p id="orders-state">Loading orders...</p><div id="orders-list"></div></section></main>`;
    bindNavigation(); let orders = [];
    const draw = () => { const pending = orders.filter(order => order.status === 'PENDING'); document.querySelector('#order-count').textContent = pending.length; document.querySelector('#orders-state').textContent = pending.length ? '' : 'No pending orders.'; document.querySelector('#orders-list').innerHTML = pending.map(order => `<article class="card"><div><strong>${escape(order.customerName || `Table ${order.tableNumber}`)}</strong><small>${order.items.map(escape).join(' · ')}</small><small>Created ${new Date(order.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small></div><button data-ready="${escape(order.id)}">Mark as Ready</button></article>`).join(''); document.querySelectorAll('[data-ready]').forEach(button => button.onclick = async () => { try { await request(`/api/orders/${button.dataset.ready}/ready`, { method: 'PATCH', body: '{}' }, true); } catch (err) { document.querySelector('#order-error').textContent = err.message; } }); };
    const upsert = order => { const index = orders.findIndex(current => current.id === order.id); orders = index < 0 ? [order, ...orders] : orders.map(current => current.id === order.id ? order : current); draw(); };
    try { orders = await request('/api/orders', {}, true); draw(); } catch (err) { document.querySelector('#orders-state').textContent = 'Could not reach the API.'; }
    const staffSocket = connect(); staffSocket?.on('order-created', upsert); staffSocket?.on('order-updated', upsert);
    document.querySelector('#create-order').onsubmit = async event => { event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement); const customerName = form.get('customerName').trim(); const tableNumber = form.get('tableNumber').trim(); const items = form.get('items').split(',').map(item => item.trim()).filter(Boolean); const error = document.querySelector('#order-error'); if (!items.length || (!customerName && !tableNumber)) return error.textContent = 'Add items and a customer name or table number.'; const button = formElement.querySelector('button'); button.disabled = true; error.textContent = ''; try { const result = await request('/api/orders', { method: 'POST', body: JSON.stringify({ customerName, tableNumber, items }) }, true); formElement.reset(); document.querySelector('#qr-result').innerHTML = `<section class="qr-card"><div><p class="eyebrow">Share with guest</p><h2>${escape(result.order.customerName || `Table ${result.order.tableNumber}`)}</h2><a href="${escape(result.trackingUrl)}" target="_blank" rel="noopener">Open tracking page</a></div><img src="${result.qrCodeDataUrl}" alt="QR code for this order's tracking page"><button id="print-qr">Print QR</button></section>`; document.querySelector('#print-qr').onclick = () => print(); } catch (err) { error.textContent = err.message; } finally { button.disabled = false; } };
  };
  const trackingView = async orderId => {
    app.innerHTML = `${header()}<main><section class="tracking" id="tracking"><p>Loading your order...</p></section></main>`; bindNavigation(); let order; let alerts = false;
    const acknowledge = () => { clearInterval(alarmTimer); alarmTimer = undefined; document.querySelector('.ready-overlay')?.remove(); navigator.vibrate?.(0); };
    const beep = () => { if (!audio) return; const oscillator = audio.createOscillator(), gain = audio.createGain(); oscillator.type = 'square'; oscillator.frequency.value = 850; gain.gain.setValueAtTime(.18, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .7); oscillator.connect(gain).connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + .7); };
    const alarm = () => { if (document.querySelector('.ready-overlay')) return; document.body.insertAdjacentHTML('beforeend', '<div class="ready-overlay"><div><p class="eyebrow">Order ready</p><h2>Order dyalk wjed! Aji khdo!</h2><p>Your kitchen is calling you.</p><button id="acknowledge">Stop Sound / Acknowledge</button></div></div>'); document.querySelector('#acknowledge').onclick = acknowledge; navigator.vibrate?.([500, 250, 500]); beep(); alarmTimer = setInterval(() => { beep(); navigator.vibrate?.([500, 250, 500]); }, 1500); };
    const draw = () => { document.querySelector('#tracking').innerHTML = `<p class="eyebrow">Your order</p><h1>${escape(order.customerName || `Table ${order.tableNumber}`)}</h1><p>${order.items.map(escape).join(' · ')}</p><div class="status ${order.status === 'READY' ? 'ready' : ''}">${order.status === 'READY' ? 'Order dyalk wjed! Aji khdo!' : 'L-khedma f l-kuzina... Sme7 lina f-l-audio'}</div>${!alerts ? '<button class="alert-enable" id="enable-alerts">I\'m waiting for my order — Enable Alerts</button>' : order.status !== 'READY' ? '<p class="muted">Alerts are enabled. Keep this page open.</p>' : ''}`; document.querySelector('#enable-alerts')?.addEventListener('click', async () => { try { audio = new AudioContext(); await audio.resume(); alerts = true; draw(); if (order.status === 'READY') alarm(); } catch { document.querySelector('#tracking').insertAdjacentHTML('beforeend', '<p class="error">Your browser could not enable sound.</p>'); } }); };
    try { order = await request(`/api/orders/${encodeURIComponent(orderId)}`); draw(); const customerSocket = connect(); customerSocket?.emit('join-order', orderId); customerSocket?.on('order-ready', updated => { if (updated.id === orderId) { order = updated; draw(); if (alerts) alarm(); } }); customerSocket?.on('order-updated', updated => { if (updated.id === orderId) { order = updated; draw(); } }); } catch { document.querySelector('#tracking').textContent = 'Order not found.'; }
  };
  const render = () => { clearInterval(alarmTimer); socket?.disconnect(); const path = location.pathname; if (path === '/login') return authView(false); if (path === '/register') return authView(true); if (path.startsWith('/order/')) return trackingView(path.split('/')[2]); return dashboardView(); };
  addEventListener('popstate', render); render();
})();
