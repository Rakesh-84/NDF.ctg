import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    members: 0,
    events: 0,
    pendingPosts: 0,
    announcements: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const [members, events, pendingPosts, announcements] = await Promise.all([
        supabase.from('members').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('announcements').select('*', { count: 'exact', head: true }),
      ])
      setStats({
        members: members.count || 0,
        events: events.count || 0,
        pendingPosts: pendingPosts.count || 0,
        announcements: announcements.count || 0,
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'Total Members', value: stats.members, color: '#006A4E' },
    { label: 'Total Events', value: stats.events, color: '#1A3A2A' },
    { label: 'Pending Posts', value: stats.pendingPosts, color: '#D42027' },
    { label: 'Announcements', value: stats.announcements, color: '#B8860B' },
  ]

  const manageLinks = [
    { label: 'Manage Members', path: '/admin/members', icon: '👥' },
    { label: 'Manage Events', path: '/admin/events', icon: '📅' },
    { label: 'Manage Posts', path: '/admin/posts', icon: '📝' },
    { label: 'Manage Announcements', path: '/admin/announcements', icon: '📢' },
    { label: 'Manage Notices', path: '/admin/notices', icon: '📌' },
  ]

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
        padding: '32px 20px 100px',
        boxSizing: 'border-box',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* Header */}
          <h1 style={{
            fontFamily: 'Fraunces, serif',
            fontWeight: 800,
            fontSize: '32px',
            background: 'linear-gradient(135deg, #006A4E 0%, #1A3A2A 60%, #004D38 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 6px 0',
          }}>
            Admin Dashboard
          </h1>
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#888888', fontSize: '14px', margin: '0 0 32px 0' }}>
            Overview of your platform
          </p>

          {/* Stat Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '40px',
          }}>
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} style={{
                  background: '#FFFDF9',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.95)',
                  boxShadow: '0 4px 20px rgba(180,140,80,0.10)',
                  height: '90px',
                  opacity: 0.5,
                }} />
              ))
            ) : statCards.map((card) => (
              <div key={card.label} style={{
                background: '#FFFDF9',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255,255,255,0.95)',
                boxShadow: '0 4px 20px rgba(180,140,80,0.10)',
              }}>
                <div style={{
                  fontFamily: 'Fraunces, serif',
                  fontWeight: 800,
                  fontSize: '36px',
                  color: card.color,
                  lineHeight: 1,
                  marginBottom: '8px',
                }}>
                  {card.value}
                </div>
                <div style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '13px',
                  color: '#888888',
                  fontWeight: 500,
                }}>
                  {card.label}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <h2 style={{
            fontFamily: 'Fraunces, serif',
            fontWeight: 800,
            fontSize: '20px',
            color: '#1A3A2A',
            margin: '0 0 16px 0',
          }}>
            Manage
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '14px',
          }}>
            {manageLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  background: '#FFFDF9',
                  borderRadius: '16px',
                  padding: '20px 16px',
                  border: '1px solid rgba(255,255,255,0.95)',
                  boxShadow: '0 4px 20px rgba(180,140,80,0.10)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'transform 0.15s ease',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>{link.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111111' }}>{link.label}</div>
              </button>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}