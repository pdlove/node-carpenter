// Login.jsx
import { h } from '/vendor/preact/preact.mjs';
import { useEffect, useMemo, useRef, useState, useCallback } from '/vendor/preact/hooks.mjs';

export default function Login({ onSuccess }) {
    const [stage, setStage] = useState("creds"); // "creds" | "otp"
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const resetAll = () => {
        setStage("creds");
        setUsername("");
        setPassword("");
        setOtp("");
        setError("");
    };

    async function submit(payload) {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const json = await res.json().catch(() => ({}));
            const msg = String(json?.message || "").toLowerCase();

            if (msg === "otp required" || msg.includes("otp required")) {
                // Move to OTP step; username becomes read-only, hide password
                setStage("otp");
                setPassword("");
                setOtp("");
                setError("");
                return;
            }

            if (msg === "login successful" || msg.includes("login successful")) {
                onSuccess?.(json?.user || null);
                return;
            }

            // Not successful — start over per spec (step 7)
            resetAll();
            setError(json?.message || "Login failed. Please try again.");
        } catch (e) {
            resetAll();
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const onSubmitCreds = (e) => {
        e.preventDefault();
        if (!username || !password) { setError("Enter username and password."); return; }
        submit({ username, password });
    };

    const onSubmitOtp = (e) => {
        e.preventDefault();
        if (!otp) { setError("Enter your one-time code."); return; }
        submit({ username, otp });
    };

    return (
        <div className="login-modal" role="dialog" aria-modal="true" aria-label="Login">
            <div className="login-card">
                <h2>Sign in</h2>

                {error && <div className="login-error" role="alert">{error}</div>}

                {stage === "creds" && (
                    <form onSubmit={onSubmitCreds} className="login-form" autoComplete="off">
                        <label className="field">
                            <span>Username</span>
                            <input
                                name="username"
                                type="text"
                                value={username}
                                onInput={(e) => setUsername(e.currentTarget.value)}
                                autoFocus
                                disabled={loading}
                                required
                            />
                        </label>

                        <label className="field">
                            <span>Password</span>
                            <input
                                name="password"
                                type="password"
                                value={password}
                                onInput={(e) => setPassword(e.currentTarget.value)}
                                disabled={loading}
                                required
                            />
                        </label>

                        <button className="primary-btn" type="submit" disabled={loading}>
                            {loading ? "Checking..." : "Login"}
                        </button>
                    </form>
                )}

                {stage === "otp" && (
                    <form onSubmit={onSubmitOtp} className="login-form" autoComplete="off">
                        <label className="field">
                            <span>Username</span>
                            <input name="username" type="text" value={username} readOnly />
                        </label>

                        {/* Password intentionally hidden per spec */}

                        <label className="field">
                            <span>One-time code</span>
                            <input
                                name="otp"
                                type="text"
                                inputMode="numeric"
                                value={otp}
                                onInput={(e) => setOtp(e.currentTarget.value)}
                                autoFocus
                                disabled={loading}
                                required
                            />
                        </label>

                        <div className="row">
                            <button className="secondary-btn" type="button" disabled={loading} onClick={resetAll}>
                                Start over
                            </button>
                            <button className="primary-btn" type="submit" disabled={loading}>
                                {loading ? "Verifying..." : "Verify"}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <style>{`
        .login-modal{position:fixed;inset:0;background:rgba(0,0,0,.35);display:grid;place-items:center;z-index:60}
        .login-card{width:min(420px,92vw);background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:12px;padding:16px 16px 18px;box-shadow:0 10px 28px rgba(0,0,0,.16)}
        .login-card h2{margin:0 0 10px}
        .login-error{background:#fee2e2;color:#991b1b;border:1px solid #fecaca;border-radius:8px;padding:8px 10px;margin:8px 0}
        .login-form{display:grid;gap:10px;margin-top:6px}
        .field{display:grid;gap:6px}
        .field span{font-size:12px;color:#444}
        .field input{border:1px solid rgba(0,0,0,.12);border-radius:8px;padding:10px 12px;font-size:14px}
        .primary-btn{border:0;border-radius:8px;padding:10px 12px;cursor:pointer;background:#2563eb;color:#fff;font-weight:600}
        .primary-btn[disabled]{opacity:.6;cursor:default}
        .secondary-btn{border:1px solid rgba(0,0,0,.12);border-radius:8px;padding:10px 12px;cursor:pointer;background:#fff}
        .row{display:flex;gap:8px;justify-content:space-between;margin-top:2px}
      `}</style>
        </div>
    );
}
