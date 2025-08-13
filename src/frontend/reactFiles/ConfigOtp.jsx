const { useState } = React;

export default function ChangeOtp({ http }) {
  const [otpKey, setOtpKey] = useState('')
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e && e.preventDefault()
    setBusy(true)
    setStatus(null)
    try {
      await http('/api/login/changeotp', { method: 'POST', body: JSON.stringify({ otpKey }) })
      setOtpKey('')
      setStatus('OTP updated')
    } catch (e) {
      setStatus(e.message || 'Change failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div class="card" style={{ padding: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>Configure OTP</div>
      <form onSubmit={submit}>
        <div class="form-group">
          <div class="label">OTP Secret</div>
          <input class="input" value={otpKey} onInput={(e) => setOtpKey(e.currentTarget.value)} placeholder="Enter new OTP secret or key" required />
        </div>
        <div class="form-actions">
          <button class="btn primary" type="submit" disabled={busy}>Save</button>
        </div>
      </form>
      {status ? <div style={{ marginTop: 8, color: String(status).includes('updated') ? 'var(--accent-2)' : 'var(--danger)' }}>{status}</div> : null}
    </div>
  )
}