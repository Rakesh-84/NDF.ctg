import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

export default function Profile() {
  const { profile } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleChangePassword() {
    setMsg('')
    setError('')
    if (!password) { setError('Enter a new password.'); return }
    if (password.length < 6) { setError('Minimum 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else setMsg('✓ Password updated successfully! Use this password next time you login.')
    setLoading(false)
  }

  return (
    <div style={{ padding: '40px 24px', maxWidth: '500px', margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111', marginBottom: '4px' }}>My Profile</h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '32px' }}>
        {profile?.email}  •  Role: <strong>{profile?.role}</strong>
      </p>

      <div style={{ background: '#FFFDF9', border: '1px solid #E5DDD0', borderRadius: '16px', padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111', marginBottom: '20px' }}>Change Password</h2>

        {error && (
          <div style={{ background: '#FFF0F0', border: '1px solid #D42027', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', color: '#D42027', fontSize: '13px' }}>
            {error}
          </div>
        )}
        {msg && (
          <div style={{ background: '#F0FBF6', border: '1px solid #006A4E', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', color: '#006A4E', fontSize: '13px' }}>
            {msg}
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>New Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5DDD0', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat password"
            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5DDD0', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>

        <button
          onClick={handleChangePassword}
          disabled={loading}
          style={{ background: 'linear-gradient(135deg, #006A4E, #004D38)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 24px', fontWeight: 600, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Saving...' : 'Update Password'}
        </button>
      </div>
    </div>
  )
}