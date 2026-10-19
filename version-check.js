(() => {
  'use strict';
  const version = document.querySelector('meta[name="site-version"]')?.content;
  const root = document.querySelector('meta[name="site-root"]')?.content;
  if (!version || !root) return;
  const base = new URL(root, location.href);
  let pending = false, checkedAt = 0;
  const feedback = (message) => {
    const status = document.querySelector('#update-status');
    if (status) status.textContent = message;
  };
  async function check(force = false) {
    if (pending || (!force && Date.now() - checkedAt < 30000)) return;
    if (!/^https?:$/.test(location.protocol)) {
      const button = document.querySelector('#refresh-version');
      if (button) button.hidden = true;
      return;
    }
    pending = true;
    checkedAt = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    if (force) feedback('正在检查…');
    try {
      const manifest = new URL('release.json', base);
      manifest.searchParams.set('_', String(checkedAt));
      const response = await fetch(manifest.href, {
        cache: 'no-store', credentials: 'omit', signal: controller.signal
      });
      if (!response.ok) throw new Error('Version check unavailable');
      const latest = await response.json();
      if (typeof latest.version !== 'string' ||
          !/^\d{8}-[1-9]\d*$/.test(latest.version) ||
          latest.path !== `releases/${latest.version}/`) {
        throw new Error('Invalid release manifest');
      }
      if (latest.version !== version) {
        const target = new URL(latest.path, base);
        if (target.origin !== location.origin || !target.pathname.startsWith(base.pathname)) {
          throw new Error('Invalid release location');
        }
        target.hash = location.hash;
        location.replace(target.href);
      } else if (force) {
        feedback('已是最新稿');
      }
    } catch {
      if (force) feedback('暂时无法检查，请稍后再试');
    } finally {
      clearTimeout(timeout);
      pending = false;
    }
  }
  function initialize() {
    document.querySelector('#refresh-version')?.addEventListener('click', () => check(true));
    check();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else initialize();
  window.addEventListener('pageshow', (event) => { if (event.persisted) check(true); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check();
  });
})();
