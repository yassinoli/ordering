(() => {
  const app = document.querySelector('#app');
  const { t, setLang, getLang } = window.OrderFlowI18n;
  let socket;
  let alarmTimer;
  let audio;

  const escape = (value = '') => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  const restaurant = () => { try { return JSON.parse(localStorage.getItem('orderflow_restaurant')); } catch { return null; } };
  const token = () => localStorage.getItem('orderflow_token');
  const navigate = path => { history.pushState({}, '', path); render(); };

  const request = async (path, options = {}, authenticated = false) => {
    const headers = {
      'Accept-Language': getLang(),
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    };
    if (authenticated && token()) headers.Authorization = `Bearer ${token()}`;
    const response = await fetch(path, { ...options, headers });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message || t('genericError'));
    return body;
  };

  const langSwitcher = () => {
    const current = getLang();
    return `<div class="lang-switch" role="group" aria-label="${escape(t('langSwitch'))}">
      <button type="button" class="lang-switch__btn${current === 'fr' ? ' is-active' : ''}" data-lang="fr">${t('langFr')}</button>
      <button type="button" class="lang-switch__btn${current === 'ar' ? ' is-active' : ''}" data-lang="ar">${t('langAr')}</button>
    </div>`;
  };

  const header = ({ variant = 'solid' } = {}) => {
    const user = restaurant();
    const classes = variant === 'dark' ? 'site-header site-header--dark' : 'site-header site-header--solid';
    const brandHref = user ? '/dashboard' : '/';
    const nav = user
      ? `<nav>${langSwitcher()}<span>${escape(user.name)}</span><a href="/dashboard" data-link>${t('dashboard')}</a><button class="header-button" id="sign-out" type="button">${t('signOut')}</button></nav>`
      : `<nav>${langSwitcher()}<a href="/#how" data-anchor>${t('howItWorks')}</a><a href="/login" data-link>${t('signIn')}</a><a class="btn btn--primary btn--compact" href="/register" data-link>${t('getStarted')}</a></nav>`;
    return `<header class="${classes}"><a class="brand" href="${brandHref}" data-link>OrderFlow</a>${nav}</header>`;
  };

  const connect = () => {
    if (!window.io) return null;
    if (socket) socket.disconnect();
    socket = window.io({ transports: ['websocket'], auth: { token: token() } });
    return socket;
  };

  const bindNavigation = () => {
    document.querySelectorAll('[data-link]').forEach(link => link.addEventListener('click', event => {
      event.preventDefault();
      navigate(link.getAttribute('href'));
    }));
    document.querySelectorAll('[data-anchor]').forEach(link => link.addEventListener('click', event => {
      const href = link.getAttribute('href') || '';
      const hash = href.includes('#') ? `#${href.split('#')[1]}` : '';
      if (location.pathname === '/' && hash) {
        event.preventDefault();
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
      }
    }));
    document.querySelectorAll('[data-lang]').forEach(button => {
      button.addEventListener('click', () => {
        const next = button.getAttribute('data-lang');
        if (next === getLang()) return;
        setLang(next);
        render();
      });
    });
    document.querySelector('#sign-out')?.addEventListener('click', () => {
      localStorage.removeItem('orderflow_token');
      localStorage.removeItem('orderflow_restaurant');
      socket?.disconnect();
      navigate('/');
    });
  };

  const homeView = () => {
    if (token()) return navigate('/dashboard');
    app.innerHTML = `
      <div class="home">
        ${header({ variant: 'dark' })}
        <section class="hero" aria-label="OrderFlow">
          <div class="hero__media" aria-hidden="true"></div>
          <div class="hero__grain" aria-hidden="true"></div>
          <div class="hero__content">
            <p class="hero__brand">OrderFlow</p>
            <h1 class="hero__headline">${t('heroHeadline')}</h1>
            <p class="hero__lede">${t('heroLede')}</p>
            <div class="hero__actions">
              <a class="btn btn--primary" href="/register" data-link>${t('startFree')}</a>
              <a class="btn btn--ghost" href="/login" data-link>${t('signIn')}</a>
            </div>
          </div>
        </section>

        <section class="section" id="how">
          <div class="section__inner">
            <p class="section__eyebrow">${t('howEyebrow')}</p>
            <h2 class="section__title">${t('howTitle')}</h2>
            <p class="section__lede">${t('howLede')}</p>
            <div class="steps">
              <article class="step">
                <h3>${t('step1Title')}</h3>
                <p>${t('step1Body')}</p>
              </article>
              <article class="step">
                <h3>${t('step2Title')}</h3>
                <p>${t('step2Body')}</p>
              </article>
              <article class="step">
                <h3>${t('step3Title')}</h3>
                <p>${t('step3Body')}</p>
              </article>
            </div>
          </div>
        </section>

        <section class="section section--muted">
          <div class="section__inner promise">
            <div class="promise__copy">
              <p class="section__eyebrow">${t('forRestaurants')}</p>
              <h2 class="section__title">${t('promiseTitle')}</h2>
              <p class="section__lede">${t('promiseLede')}</p>
              <ul class="promise__list">
                <li><strong>${t('promise1Title')}</strong><span>${t('promise1Body')}</span></li>
                <li><strong>${t('promise2Title')}</strong><span>${t('promise2Body')}</span></li>
                <li><strong>${t('promise3Title')}</strong><span>${t('promise3Body')}</span></li>
              </ul>
            </div>
            <div class="promise__visual" role="img" aria-label="${escape(t('promiseVisual'))}"></div>
          </div>
        </section>

        <section class="cta-band">
          <h2>${t('ctaTitle')}</h2>
          <p>${t('ctaLede')}</p>
          <div class="hero__actions">
            <a class="btn btn--primary" href="/register" data-link>${t('createRestaurant')}</a>
            <a class="btn btn--ghost" href="/login" data-link>${t('alreadyHaveAccount')}</a>
          </div>
        </section>

        <footer class="site-footer">
          <a class="brand" href="/" data-link>OrderFlow</a>
          <span>${t('footerTagline')}</span>
        </footer>
      </div>`;
    bindNavigation();
    if (location.hash) {
      requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView());
    }
  };

  const authView = registerMode => {
    app.innerHTML = `${header()}<main class="app-main"><section class="auth-card"><p class="eyebrow">${t('authEyebrow')}</p><h1>${registerMode ? t('createYourRestaurant') : t('welcomeBack')}</h1><p>${t('authLede')}</p><form id="auth-form">${registerMode ? `<input name="name" placeholder="${escape(t('restaurantName'))}" required>` : ''}<input name="email" type="email" placeholder="${escape(t('email'))}" required autocomplete="username"><input name="password" type="password" minlength="8" placeholder="${escape(t('password'))}" required autocomplete="${registerMode ? 'new-password' : 'current-password'}"><button type="submit">${registerMode ? t('createAccount') : t('signIn')}</button></form><p class="error" id="auth-error"></p><button class="link-button" id="toggle-auth" type="button">${registerMode ? t('alreadyAccount') : t('newRestaurant')}</button></section></main>`;
    bindNavigation();
    document.querySelector('#toggle-auth').onclick = () => navigate(registerMode ? '/login' : '/register');
    document.querySelector('#auth-form').onsubmit = async event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const button = event.currentTarget.querySelector('button');
      const error = document.querySelector('#auth-error');
      button.disabled = true;
      button.textContent = t('pleaseWait');
      error.textContent = '';
      try {
        const result = await request(`/api/auth/${registerMode ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify(Object.fromEntries(form)) });
        localStorage.setItem('orderflow_token', result.token);
        localStorage.setItem('orderflow_restaurant', JSON.stringify(result.restaurant));
        navigate('/dashboard');
      } catch (err) {
        error.textContent = err.message;
        button.disabled = false;
        button.textContent = registerMode ? t('createAccount') : t('signIn');
      }
    };
  };

  const dashboardView = async () => {
    if (!token()) return navigate('/login');
    app.innerHTML = `${header()}<main class="app-main"><section class="page-heading"><p class="eyebrow">${t('kitchenEyebrow')}</p><h1>${t('staffDashboard')}</h1><p>${t('dashboardLede')}</p></section><section class="create-order"><h2>${t('createOrder')}</h2><form id="create-order"><input name="customerName" placeholder="${escape(t('customerName'))}"><input name="tableNumber" placeholder="${escape(t('tableNumber'))}"><input name="items" placeholder="${escape(t('itemsPlaceholder'))}" required><button type="submit">${t('createShowQr')}</button></form><p class="error" id="order-error"></p></section><section id="qr-result"></section><section class="orders"><div class="section-title"><h2>${t('activePending')}</h2><span id="order-count">0</span></div><p id="orders-state">${t('loadingOrders')}</p><div id="orders-list"></div></section></main>`;
    bindNavigation();
    let orders = [];
    const orderLabel = order => escape(order.customerName || t('tableLabel', { n: order.tableNumber }));
    const draw = () => {
      const pending = orders.filter(order => order.status === 'PENDING');
      document.querySelector('#order-count').textContent = pending.length;
      document.querySelector('#orders-state').textContent = pending.length ? '' : t('noPending');
      document.querySelector('#orders-list').innerHTML = pending.map(order => {
        const time = new Date(order.createdAt).toLocaleTimeString(getLang() === 'ar' ? 'ar' : 'fr-FR', { hour: 'numeric', minute: '2-digit' });
        return `<article class="card"><div><strong>${orderLabel(order)}</strong><small>${order.items.map(escape).join(' · ')}</small><small>${escape(t('createdAt', { time }))}</small></div><button type="button" data-ready="${escape(order.id)}">${t('markReady')}</button></article>`;
      }).join('');
      document.querySelectorAll('[data-ready]').forEach(button => {
        button.onclick = async () => {
          try {
            await request(`/api/orders/${button.dataset.ready}/ready`, { method: 'PATCH', body: '{}' }, true);
          } catch (err) {
            document.querySelector('#order-error').textContent = err.message;
          }
        };
      });
    };
    const upsert = order => {
      const index = orders.findIndex(current => current.id === order.id);
      orders = index < 0 ? [order, ...orders] : orders.map(current => current.id === order.id ? order : current);
      draw();
    };
    try {
      orders = await request('/api/orders', {}, true);
      draw();
    } catch {
      document.querySelector('#orders-state').textContent = t('couldNotReachApi');
    }
    const staffSocket = connect();
    staffSocket?.on('order-created', upsert);
    staffSocket?.on('order-updated', upsert);
    document.querySelector('#create-order').onsubmit = async event => {
      event.preventDefault();
      const formElement = event.currentTarget;
      const form = new FormData(formElement);
      const customerName = form.get('customerName').trim();
      const tableNumber = form.get('tableNumber').trim();
      const items = form.get('items').split(',').map(item => item.trim()).filter(Boolean);
      const error = document.querySelector('#order-error');
      if (!items.length || (!customerName && !tableNumber)) return error.textContent = t('orderValidation');
      const button = formElement.querySelector('button');
      button.disabled = true;
      error.textContent = '';
      try {
        const result = await request('/api/orders', { method: 'POST', body: JSON.stringify({ customerName, tableNumber, items }) }, true);
        formElement.reset();
        document.querySelector('#qr-result').innerHTML = `<section class="qr-card"><div><p class="eyebrow">${t('shareWithGuest')}</p><h2>${orderLabel(result.order)}</h2><a href="${escape(result.trackingUrl)}" target="_blank" rel="noopener">${t('openTracking')}</a></div><img src="${result.qrCodeDataUrl}" alt="${escape(t('qrAlt'))}"><button type="button" id="print-qr">${t('printQr')}</button></section>`;
        document.querySelector('#print-qr').onclick = () => print();
      } catch (err) {
        error.textContent = err.message;
      } finally {
        button.disabled = false;
      }
    };
  };

  const trackingView = async orderId => {
    app.innerHTML = `${header()}<main class="app-main"><section class="tracking" id="tracking"><p>${t('loadingOrder')}</p></section></main>`;
    bindNavigation();
    let order;
    let alerts = false;
    let notificationPermission = 'Notification' in window ? Notification.permission : 'unsupported';
    let notificationRegistration;
    const acknowledge = () => {
      clearInterval(alarmTimer);
      alarmTimer = undefined;
      document.querySelector('.ready-overlay')?.remove();
      navigator.vibrate?.(0);
    };
    const beep = () => {
      if (!audio) return;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'square';
      oscillator.frequency.value = 850;
      gain.gain.setValueAtTime(0.18, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.7);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.7);
    };
    const notify = async () => {
      if (notificationPermission !== 'granted') return;
      const options = {
        body: t('statusReady'),
        tag: `order-${order.id}`,
        renotify: true
      };
      if (notificationRegistration) {
        const registration = await notificationRegistration;
        await registration.showNotification(t('orderReadyEyebrow'), options);
      } else {
        new Notification(t('orderReadyEyebrow'), options);
      }
    };
    const alarm = () => {
      if (document.querySelector('.ready-overlay')) return;
      document.body.insertAdjacentHTML('beforeend', `<div class="ready-overlay"><div><p class="eyebrow">${t('orderReadyEyebrow')}</p><h2>${t('orderReadyTitle')}</h2><p>${t('kitchenCalling')}</p><button type="button" id="acknowledge">${t('acknowledge')}</button></div></div>`);
      document.querySelector('#acknowledge').onclick = acknowledge;
      navigator.vibrate?.([500, 250, 500]);
      beep();
      alarmTimer = setInterval(() => {
        beep();
        navigator.vibrate?.([500, 250, 500]);
      }, 1500);
    };
    const draw = () => {
      const label = escape(order.customerName || t('tableLabel', { n: order.tableNumber }));
      document.querySelector('#tracking').innerHTML = `<p class="eyebrow">${t('yourOrder')}</p><h1>${label}</h1><p>${order.items.map(escape).join(' · ')}</p><div class="status ${order.status === 'READY' ? 'ready' : ''}">${order.status === 'READY' ? t('statusReady') : t('statusPending')}</div>${!alerts ? `<button class="alert-enable" id="enable-alerts" type="button">${t('enableAlerts')}</button>` : order.status !== 'READY' ? `<p class="muted">${t('alertsEnabled')}</p>` : ''}`;
      document.querySelector('#enable-alerts')?.addEventListener('click', async () => {
        try {
          if (notificationPermission === 'unsupported') throw new Error(t('notificationUnsupported'));
          if (!window.isSecureContext) throw new Error(t('notificationSecureContext'));
          if (notificationPermission === 'default') {
            notificationPermission = await Notification.requestPermission();
          }
          if (notificationPermission !== 'granted') throw new Error(t('notificationDenied'));
          if ('serviceWorker' in navigator && !notificationRegistration) {
            notificationRegistration = navigator.serviceWorker.register('/service-worker.js');
          }
          if (notificationRegistration) await notificationRegistration;
          audio = new AudioContext();
          await audio.resume();
          alerts = true;
          draw();
          if (order.status === 'READY') {
            await notify();
            alarm();
          }
        } catch (error) {
          document.querySelector('#tracking').insertAdjacentHTML('beforeend', `<p class="error">${escape(error.message || t('notificationError'))}</p>`);
        }
      });
    };
    try {
      order = await request(`/api/orders/${encodeURIComponent(orderId)}`);
      draw();
      const customerSocket = connect();
      customerSocket?.emit('join-order', orderId);
      customerSocket?.on('order-ready', updated => {
        if (updated.id === orderId) {
          order = updated;
          draw();
          if (alerts) {
            notify().catch(error => {
              document.querySelector('#tracking').insertAdjacentHTML('beforeend', `<p class="error">${escape(error.message || t('notificationError'))}</p>`);
            });
            alarm();
          }
        }
      });
      customerSocket?.on('order-updated', updated => {
        if (updated.id === orderId) {
          order = updated;
          draw();
        }
      });
    } catch {
      document.querySelector('#tracking').textContent = t('orderNotFound');
    }
  };

  const render = () => {
    clearInterval(alarmTimer);
    socket?.disconnect();
    const path = location.pathname;
    if (path === '/' || path === '') return homeView();
    if (path === '/login') return authView(false);
    if (path === '/register') return authView(true);
    if (path === '/dashboard') return dashboardView();
    if (path.startsWith('/order/')) return trackingView(path.split('/')[2]);
    return homeView();
  };

  addEventListener('popstate', render);
  render();
})();
