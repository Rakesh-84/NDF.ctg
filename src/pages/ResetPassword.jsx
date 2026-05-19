import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase puts the session tokens in the URL hash after reset link click
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
  }, [])

  async function handleReset() {
    if (!password) { setError('Enter a new password.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setError('')
    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes bgBreathe {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
      <div style={{
        background: 'linear-gradient(135deg, #FDF8F2, #F5EFE6, #EEF5F1, #FAF3E8, #F0F7F4)',
        backgroundSize: '300% 300%',
        animation: 'bgBreathe 14s ease infinite',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          background: '#FFFDF9',
          boxShadow: '0 4px 20px rgba(180,140,80,0.10)',
          border: '1px solid rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '40px 36px',
          width: '100%',
          maxWidth: '420px',
        }}>
          <h1 style={{
            fontFamily: 'Fraunces, serif',
            fontWeight: 800,
            fontSize: '28px',
            background: 'linear-gradient(135deg, #006A4E 0%, #1A3A2A 60%, #004D38 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 8px 0',
          }}>
            Set New Password
          </h1>
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#888888', fontSize: '14px', margin: '0 0 28px 0' }}>
            Choose a strong password you'll remember.
          </p>

          {!ready && (
            <div style={{ fontFamily: 'DM Sans, sans-serif', color: '#888888', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
              Verifying reset link...
            </div>
          )}

          {ready && !success && (
            <>
              {error && (
                <div style={{ background: '#FFF0F0', border: '1px solid #D42027', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: '#D42027', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 600, color: '#555555', display: 'block', marginBottom: '6px' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #E5DDD0',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '14px',
                    color: '#111111',
                    background: '#FEFCF8',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 600, color: '#555555', display: 'block', marginBottom: '6px' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #E5DDD0',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '14px',
                    color: '#111111',
                    background: '#FEFCF8',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                onClick={handleReset}
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #006A4E, #004D38)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </>
          )}

          {success && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#006A4E', fontWeight: 600, margin: '0 0 6px 0' }}>Password updated!</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#888888', fontSize: '13px', margin: 0 }}>Redirecting to login...</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}