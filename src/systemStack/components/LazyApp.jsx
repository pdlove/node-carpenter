// AppLayoutLazy.jsx
import { h, render } from '/vendor/preact/preact.mjs';
import { useEffect, useMemo, useRef, useState, useCallback } from '/vendor/preact/hooks.mjs';

import Menu from "./Menu.jsx";
import LazyPanelHost from "./LazyPanelHost.jsx";

// AUTH: imports
import Login from "./Login.jsx";
import { userStore } from "/userStore.js";

// Best-effort cleanup of client data (Caches API, SW, storage, IndexedDB)
async function clearClientData() {
    try { localStorage.clear(); } catch { }
    try { sessionStorage.clear(); } catch { }
    try {
        if (window.caches) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
        }
    } catch { }
    try {
        if (navigator.serviceWorker?.getRegistrations) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map((r) => r.unregister()));
        }
    } catch { }
    try {
        if (window.indexedDB?.databases) {
            const dbs = await indexedDB.databases();
            await Promise.all(
                dbs.map((db) => db?.name).filter(Boolean).map(
                    (name) => new Promise((resolve) => {
                        const req = indexedDB.deleteDatabase(name);
                        req.onsuccess = req.onerror = req.onblocked = () => resolve();
                    })
                )
            );
        }
    } catch { }
}

async function handleLogout() {
    try {
        await fetch("/api/logout", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        console.warn("Logout API call failed; proceeding with client cleanup anyway.", e);
    }
    await clearClientData();
    userStore.setUser(null); // AUTH: clear in-memory user too
    window.location.reload();
}

export default function AppLayoutLazy() {
    const [collapsed, setCollapsed] = useState(false);
    const [current, setCurrent] = useState({ panel: "system/DashboardPanel", params: {} });
    const [modal, setModal] = useState(null);

    // Notifications (sample)
    const [notifs, setNotifs] = useState(() => ([
        { id: "n1", title: "3 new critical alerts", body: "core-sw-01 CPU > 90%", severity: "critical", ts: Date.now() - 1000 * 60 * 5, read: false },
        { id: "n2", title: "DHCP scope 10.0.20.0/24 at 85%", severity: "warning", ts: Date.now() - 1000 * 60 * 30, read: false },
        { id: "n3", title: "Backup job completed", ts: Date.now() - 1000 * 60 * 60 * 3, read: true },
    ]));

    // AUTH: state to manage login check + modal
    const [authChecked, setAuthChecked] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const pendingTargetRef = useRef(null); // where to go after successful login

    // AUTH: check token on app load
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/login/check", { credentials: "include" });
                const json = await res.json().catch(() => ({}));
                const msg = String(json?.message || "").toLowerCase();
                if (msg === "good" || msg.includes("good")) {
                    userStore.setUser(json?.user || { name: "Authenticated User" });
                    setShowLogin(false);
                } else {
                    userStore.setUser(null);
                    setShowLogin(true);
                }
            } catch {
                userStore.setUser(null);
                setShowLogin(true);
            } finally {
                setAuthChecked(true);
            }
        })();
    }, []);

    // AUTH: wrap navigation to require login
    const handleNavigate = useCallback((panel, params, asModal) => {
        const loggedIn = !!userStore.getUser();
        if (!loggedIn) {
            pendingTargetRef.current = { panel, params, asModal: !!asModal };
            setShowLogin(true);
            return;
        }
        if (asModal) {
            setModal({ panel, params });
        } else {
            setCurrent({ panel, params });
        }
    }, []);

    const handleOpenLink = (url) => window.open(url, "_blank", "noopener,noreferrer");
    const handleRunJs = (code, item) => { console.log("nav_js_code requested:", { code, item }); };

    const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    const clearAll = () => setNotifs([]);
    const clickNotif = (n) => {
        if (n.severity === "critical" || n.severity === "warning") {
            setCurrent({ panel: "ActiveAlerts", params: {} });
        }
        setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    };

    // AUTH: after successful login
    const onLoginSuccess = (user) => {
        userStore.setUser(user || { name: "Authenticated User" });
        setShowLogin(false);

        const pending = pendingTargetRef.current;
        pendingTargetRef.current = null;
        if (pending) {
            if (pending.asModal) setModal({ panel: pending.panel, params: pending.params });
            else setCurrent({ panel: pending.panel, params: pending.params });
        } else {
            // default to Dashboard
            setCurrent({ panel: "system/DashboardPanel", params: {} });
        }
    };

    // Optionally block UI until we’ve checked auth the first time
    if (!authChecked) {
        return (
            <div className="app-root">
                <header className="app-toolbar" role="banner">
                    <div className="toolbar-title">Network Management</div>
                </header>
                <div className="content" role="main" style="display:grid;place-items:center;min-height:60vh">
                    <div>Loading…</div>
                </div>
                <style>{styles}</style>
            </div>
        );
    }
    if (!userStore.getUser() || showLogin) {
        return <Login standalone onSuccess={onLoginSuccess} />;
    }
    return (
        <div className="app-root">
            <header className="app-toolbar" role="banner">
                <button
                    className="icon-btn"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    onClick={() => setCollapsed((v) => !v)}
                    title={collapsed ? "Expand" : "Collapse"}
                >
                    <i className="bi bi-list" aria-hidden="true" />
                </button>

                <div className="toolbar-title">Network Management</div>
                <div className="toolbar-spacer" />

                <NotificationBell
                    items={notifs}
                    onMarkAllRead={markAllRead}
                    onClear={clearAll}
                    onClickItem={clickNotif}
                />

                <AvatarMenu
                    user={userStore.getUser() || { name: "Guest", email: "" }}
                    onAccount={() => handleNavigate("AccountSettings", {})}
                    onSecurity={() => handleNavigate("SecuritySettings", {})}
                    onLogout={handleLogout}
                />
            </header>

            <div className="app-shell">
                <aside className={`sidebar ${collapsed ? "collapsed" : ""}`} aria-label="Sidebar">
                    <Menu
                        className="sidebar-menu"
                        onNavigate={handleNavigate}
                        onOpenLink={handleOpenLink}
                        onRunJs={handleRunJs}
                        collapsed={collapsed}
                    />
                </aside>

                <main className="content" role="main">
                    <LazyPanelHost url={current.panel} params={current.params} />
                </main>
            </div>

            {/* existing modal for panels */}
            {modal && (
                <div className="modal-backdrop" role="dialog" aria-modal="true">
                    <div className="modal">
                        <div className="modal-head">
                            <strong>{modal.panel}</strong>
                            <button className="icon-btn" aria-label="Close modal" onClick={() => setModal(null)}>
                                <i className="bi bi-x-lg" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="modal-body">
                            <LazyPanelHost url={modal.panel} params={modal.params} />
                        </div>
                    </div>
                </div>
            )}

            {/* AUTH: login modal */}
            {showLogin && <Login onSuccess={onLoginSuccess} />}

            <style>{styles}</style>
        </div>
    );
}

/* --- Toolbar/Sidebar/Notifications UI bits (unchanged) --- */

function NotificationBell({ items, onMarkAllRead, onClear, onClickItem }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="notif-wrapper">
            <button
                className="icon-btn"
                aria-label="Notifications"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                title="Notifications"
            >
                <i className="bi bi-bell" aria-hidden="true" />
                {items.some((n) => !n.read) && <span className="notif-badge" aria-label="Unread" />}
            </button>

            {open && (
                <div className="notif-dropdown" role="menu" aria-label="Notifications">
                    <div className="notif-head">
                        <strong>Notifications</strong>
                        <div className="notif-actions">
                            <button className="link-btn" onClick={onMarkAllRead}>Mark all read</button>
                            <button className="link-btn danger" onClick={onClear}>Clear</button>
                        </div>
                    </div>
                    <ul className="notif-list">
                        {items.length === 0 && <li className="empty">No notifications</li>}
                        {items.map((n) => (
                            <li key={n.id} className={`notif-item ${n.read ? "read" : "unread"} ${n.severity || ""}`}>
                                <button className="notif-row" onClick={() => onClickItem?.(n)}>
                                    <span className="dot" aria-hidden="true" />
                                    <div className="text">
                                        <div className="title">{n.title}</div>
                                        {n.body && <div className="body">{n.body}</div>}
                                        {n.ts && <div className="meta">{new Date(n.ts).toLocaleString()}</div>}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function AvatarMenu({ user, onAccount, onSecurity, onLogout }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const onDocClick = (e) => { if (!ref.current) return; if (!ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);
    const onKeyDown = (e) => { if (e.key === "Escape") setOpen(false); };

    const name = user?.name || "User";
    const email = user?.email || "";

    return (
        <div className="avatar-wrapper" ref={ref}>
            <button
                className="avatar-btn"
                aria-label="User menu"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                onKeyDown={onKeyDown}
                title={name}
            >
                <span className="avatar-chip" aria-hidden="true">
                    <i className="bi bi-person-circle" />
                </span>
                <span className="avatar-name">{name}</span>
            </button>

            {open && (
                <div className="menu-dropdown" role="menu" aria-label="User menu">
                    <div className="menu-header">
                        <span className="avatar-chip lg"><i className="bi bi-person-circle" /></span>
                        <div className="user-meta">
                            <div className="user-name">{name}</div>
                            {email && <div className="user-email">{email}</div>}
                        </div>
                    </div>

                    <ul className="menu-list" role="none">
                        <li role="none">
                            <button role="menuitem" className="menu-item" onClick={() => { onAccount?.(); setOpen(false); }}>
                                <i className="bi bi-person" aria-hidden="true" /> Account
                            </button>
                        </li>
                        <li role="none">
                            <button role="menuitem" className="menu-item" onClick={() => { onSecurity?.(); setOpen(false); }}>
                                <i className="bi bi-shield-lock" aria-hidden="true" /> Security
                            </button>
                        </li>
                        <li className="menu-sep" role="separator" aria-hidden="true" />
                        <li role="none">
                            <button role="menuitem" className="menu-item danger" onClick={() => { onLogout?.(); setOpen(false); }}>
                                <i className="bi bi-box-arrow-right" aria-hidden="true" /> Logout
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}

// (your existing styles string stays the same)
const styles = `
:root {
  --toolbar-h: 56px;
  --sidebar-w: 300px;
  --sidebar-w-collapsed: 68px;
  --border: rgba(0,0,0,0.08);
  --bg: #f7f7fb;
  --panel-bg: #fff;
  --text: #111;
  --muted: #666;
}
* { box-sizing: border-box; }
html, body, #root { height: 100%; }
body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: var(--text); background: var(--bg); }
.app-root { display: flex; flex-direction: column; min-height: 100vh; }

.app-toolbar {
  height: var(--toolbar-h);
  display: flex; align-items: center; gap: 10px;
  padding: 0 12px;
  border-bottom: 1px solid var(--border);
  background: #fff;
  position: sticky; top: 0; z-index: 10;
}
.toolbar-title { font-weight: 700; }
.toolbar-spacer { flex: 1; }

.icon-btn { border: 0; background: transparent; padding: 8px; cursor: pointer; border-radius: 8px; }
.icon-btn:hover { background: rgba(0,0,0,0.06); }

.app-shell { display: flex; min-height: calc(100vh - var(--toolbar-h)); }
.sidebar { border-right: 1px solid var(--border); background: #fff; overflow: visible; transition: width 180ms ease; }
.sidebar.collapsed { width: var(--sidebar-w-collapsed); }
.sidebar:not(.collapsed) { width: var(--sidebar-w); }

.content { flex: 1; min-width: 0; padding: 16px; overflow: auto; }
.panel { background: var(--panel-bg); border: 1px solid var(--border); border-radius: 10px; padding: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
.panel h2 { margin: 0 0 12px; }

/* Notifications */
.notif-wrapper { position: relative; }
.notif-badge { position: absolute; top: 2px; right: 2px; width: 8px; height: 8px; background: #e11d48; border-radius: 999px; }
.notif-dropdown { position: absolute; right: 0; top: calc(100% + 8px); width: 360px; max-height: 420px; overflow: auto; background: #fff; border: 1px solid var(--border); border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 20; }
.notif-head { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid var(--border); }
.notif-actions { display: flex; gap: 8px; }
.link-btn { border: 0; background: transparent; cursor: pointer; color: #2563eb; padding: 4px 6px; border-radius: 6px; }
.link-btn:hover { background: rgba(37,99,235,0.08); }
.link-btn.danger { color: #dc2626; }
.link-btn.danger:hover { background: rgba(220,38,38,0.08); }
.notif-list { list-style: none; margin: 0; padding: 6px; }
.notif-item { border-radius: 8px; }
.notif-item + .notif-item { margin-top: 6px; }
.notif-item.unread { background: #f5f8ff; }
.notif-row { display: grid; grid-template-columns: 16px 1fr; gap: 10px; width: 100%; text-align: left; padding: 8px; border: 0; background: transparent; cursor: pointer; border-radius: 8px; }
.notif-row:hover { background: rgba(0,0,0,0.04); }
.notif-item .dot { width: 10px; height: 10px; margin: 3px 0 0 3px; border-radius: 50%; background: #9ca3af; }
.notif-item.unread .dot { background: #2563eb; }
.notif-item.critical .dot { background: #dc2626; }
.notif-item.warning .dot { background: #f59e0b; }
.notif-item .title { font-weight: 600; font-size: 14px; }
.notif-item .body { color: var(--muted); font-size: 13px; }
.notif-item .meta { color: #888; font-size: 12px; margin-top: 2px; }

/* Modal */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 50; }
.modal { width: min(800px, 92vw); max-height: 80vh; overflow: auto; background: #fff; border-radius: 12px; border: 1px solid var(--border); }
.modal-head { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid var(--border); }
.modal-body { padding: 12px; }

/* Avatar / user menu */
.avatar-wrapper { position: relative; margin-left: 4px; }
.avatar-btn {
  display: inline-flex; align-items: center; gap: 8px;
  border: 0; background: transparent; padding: 6px 8px;
  border-radius: 8px; cursor: pointer;
}
.avatar-btn:hover { background: rgba(0,0,0,0.06); }
.avatar-btn .avatar-name { font-weight: 600; font-size: 14px; }

.avatar-chip { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; }
.avatar-chip i.bi { font-size: 20px; line-height: 1; }
.avatar-chip.lg { width: 40px; height: 40px; }
.avatar-chip.lg i.bi { font-size: 28px; }

.menu-dropdown {
  position: absolute; right: 0; top: calc(100% + 8px);
  width: 260px; background: #fff; border: 1px solid var(--border);
  border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 25;
  overflow: hidden;
}
.menu-header { display: flex; align-items: center; gap: 10px; padding: 12px; border-bottom: 1px solid var(--border); }
.user-meta .user-name { font-weight: 700; }
.user-meta .user-email { color: #666; font-size: 12px; margin-top: 2px; }

.menu-list { list-style: none; margin: 0; padding: 6px; }
.menu-item {
  width: 100%; text-align: left; border: 0; background: transparent; cursor: pointer;
  display: flex; gap: 10px; align-items: center; padding: 8px 10px; border-radius: 8px; font-size: 14px;
}
.menu-item:hover { background: rgba(0,0,0,0.05); }
.menu-item i.bi { font-size: 16px; }
.menu-sep { height: 1px; background: var(--border); margin: 6px 0; }
.menu-item.danger { color: #dc2626; }
.menu-item.danger:hover { background: rgba(220,38,38,0.08); }
`;
