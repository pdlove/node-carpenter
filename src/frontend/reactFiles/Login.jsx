const { useState } = React;

export default function LoginScreen({ onLogin, onOtp, showOtp, error }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [otp, setOtp] = useState('')
    const [busy, setBusy] = useState(false)

    const submit = async (e) => {
        e && e.preventDefault()
        setBusy(true)
        try {
            await onLogin(username, password)
        } finally {
            setBusy(false)
        }
    }

    const submitOtp = async (e) => {
        e && e.preventDefault()
        setBusy(true)
        try {
            await onOtp(otp)
        } finally {
            setBusy(false)
        }
    }

    return (
        <div class="center" style={{ height: '100%' }}>
            <div class="card" style={{ width: 'min(440px, 92vw)', padding: 20 }}>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Welcome</div>
                <form onSubmit={submit}>
                    <div class="form-group">
                        <div class="label">Username</div>
                        <input class="input" type="text" value={username} onInput={(e) => setUsername(e.currentTarget.value)} required />
                    </div>
                    <div class="form-group">
                        <div class="label">Password</div>
                        <input class="input" type="password" value={password} onInput={(e) => setPassword(e.currentTarget.value)} required />
                    </div>
                    {!showOtp ? (
                        <div class="form-actions">
                            <button class="btn primary" type="submit" disabled={busy}>Sign in</button>
                        </div>
                    ) : null}
                </form>

                {showOtp ? (
                    <form onSubmit={submitOtp}>
                        <div class="form-group">
                            <div class="label">One-Time Passcode</div>
                            <input class="input" inputMode="numeric" pattern="[0-9]*" value={otp} onInput={(e) => setOtp(e.currentTarget.value)} required />
                        </div>
                        <div class="form-actions">
                            <button class="btn primary" type="submit" disabled={busy}>Verify</button>
                        </div>
                    </form>
                ) : null}

                {error ? (
                    <div style={{ color: 'var(--danger)', marginTop: 8 }}>{error}</div>
                ) : null}
            </div>
        </div>
    )
}