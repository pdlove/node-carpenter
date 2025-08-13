const { lazy, Suspense, useEffect, useMemo, useRef, useState } = React;

const panels = {};
panels['User_LoginScreen'] = lazy(() => import('./User/Login.jsx'))

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
            <Suspense fallback={<div class="container">Loading…</div>}>
                {!isAuthenticated ? (
                    <LoginScreen onLogin={onLogin} showOtp={showOtp} onOtp={onOtp} error={loginError} />
                ) : (
                    <Shell />
                )}
            </Suspense>
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
                <Suspense fallback={<div>Loading…</div>}>
                    {activeView === 'changepwd' && <ChangePassword http={http} />}
                    {activeView === 'changeotp' && <ChangeOtp http={http} />}
                    {activeView === 'org' && <OrganizationManager http={http} />}
                </Suspense>
            </div>
        </div>
    )
}

export default App