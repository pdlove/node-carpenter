// userStore.js
let _user = null;
const subs = new Set();

export const userStore = {
  getUser() {
    return _user;
  },
  setUser(next) {
    _user = next || null;
    // also expose globally if you want quick access outside modules:
    try {
      window.__CURRENT_USER__ = _user;
    } catch {}
    subs.forEach((fn) => fn(_user));
  },
  subscribe(fn) {
    subs.add(fn);
    return () => subs.delete(fn);
  },
};

export async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`/api/data/${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.error(`API call failed for ${endpoint}:`, err);
    throw err;
  }
}
