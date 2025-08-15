import { h, render } from '/vendor/preact/preact.mjs';
import { useEffect, useMemo, useRef, useState } from '/vendor/preact/hooks.mjs';

function lazy(loader) {
  return function LazyWrapper(props) {
    const [Comp, setComp] = useState(null);

    useEffect(() => {
      let mounted = true;
      loader().then((mod) => {
        if (mounted) setComp(() => mod.default || mod);
      });
      return () => (mounted = false);
    }, []);

    if (!Comp) return <div>Loading...</div>;
    return <Comp {...props} />;
  };
}

const LoginScreen = lazy(() => import('./Login.jsx'))
const OrganizationManager = lazy(() => import('./OrganizationManager.jsx'))
const panelList = ['User_Login', 'User_ChangePassword', 'User_ConfigOtp', 'Security_OrganizationManager'];
async function http(input, init) {
    const res = await fetch(input, {
        ...init,
        headers: { 'Content-Type': 'application/json', ...(init && init.headers ? init.headers : {}) },
        credentials: 'include',
    })
    if (!res.ok) throw new Error((await res.text().catch(() => '')) || `${res.status} ${res.statusText}`)
    return res.headers.get('content-type')?.includes('application/json') ? res.json() : undefined
}

export function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loginError, setLoginError] = useState(null)
    const [showOtp, setShowOtp] = useState(false)
    const [pendingCredentials, setPendingCredentials] = useState(null)



    return (
        <div style={{ minHeight: '100%' }}>
                {!isAuthenticated ? (
                    <LoginScreen onLogin={setIsAuthenticated} error={loginError} />
                ) : (
                    <Shell />
                )}
        </div>
    )
}

function Shell() {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)
    useEffect(() => {
        const onDoc = (e) => {
            if (!menuRef.current) return
            if (!menuRef.current.contains(e.target)) setMenuOpen(false)
        }
        document.addEventListener('click', onDoc)
        return () => document.removeEventListener('click', onDoc)
    }, [])

    const [activeView, setActiveView] = useState('org')

    return (
        <div>
            <div class="header">
                <div class="navbar container">
                    <div class="brand">Admin</div>
                    <div class="menu" ref={menuRef}>
                        <div class="avatar" onClick={() => setMenuOpen((v) => !v)} title="Account">☺</div>
                        {menuOpen ? (
                            <div class="dropdown">
                                <button onClick={() => { setActiveView('changepwd'); setMenuOpen(false) }}>Change Password</button>
                                <button onClick={() => { setActiveView('changeotp'); setMenuOpen(false) }}>Configure OTP</button>
                                <button onClick={() => { setActiveView('org'); setMenuOpen(false) }}>Manage Organization</button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            <div class="container" style={{ paddingTop: 16 }}>
                    {activeView === 'changepwd' && <ChangePassword http={http} />}
                    {activeView === 'changeotp' && <ChangeOtp http={http} />}
                    {activeView === 'org' && <OrganizationManager http={http} />}
            </div>
        </div>
    )
}

export default App