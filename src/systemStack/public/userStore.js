// userStore.js
let _user = null;
const subs = new Set();

export const userStore = {
  getUser() { return _user; },
  setUser(next) {
    _user = next || null;
    // also expose globally if you want quick access outside modules:
    try { window.__CURRENT_USER__ = _user; } catch {}
    subs.forEach(fn => fn(_user));
  },
  subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }
};
