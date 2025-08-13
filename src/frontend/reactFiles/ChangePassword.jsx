const { useState } = React;

export default function ChangePassword({ http }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e && e.preventDefault()
    if (newPassword !== confirmPassword) {
      setStatus('Passwords do not match')
      return
    }
    setBusy(true)
    setStatus(null)
    try {
      await http('/api/login/changepwd', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) })
      setStatus('Password changed')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e) {
      setStatus(e.message || 'Change failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div class="card" style={{ padding: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>Change Password</div>
      <form onSubmit={submit}>
        <div class="form-group">
          <div class="label">Current Password</div>
          <input class="input" type="password" value={currentPassword} onInput={(e) => setCurrentPassword(e.currentTarget.value)} required />
        </div>
        <div class="form-group">
          <div class="label">New Password</div>
          <input class="input" type="password" value={newPassword} onInput={(e) => setNewPassword(e.currentTarget.value)} required />
        </div>
        <div class="form-group">
          <div class="label">Confirm Password</div>
          <input class="input" type="password" value={confirmPassword} onInput={(e) => setConfirmPassword(e.currentTarget.value)} required />
        </div>
        <div class="form-actions">
          <button class="btn primary" type="submit" disabled={busy}>Save</button>
        </div>
      </form>
      {status ? <div style={{ marginTop: 8, color: String(status).includes('changed') ? 'var(--accent-2)' : 'var(--danger)' }}>{status}</div> : null}
    </div>
  )
}