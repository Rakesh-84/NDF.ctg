import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const gradientBg = {
  background: 'linear-gradient(135deg, #FDF8F2, #F5EFE6, #EEF5F1, #FAF3E8, #F0F7F4)',
  backgroundSize: '300% 300%',
  animation: 'bgBreathe 14s ease infinite',
  minHeight: '100vh',
};

const cardStyle = {
  background: '#FFFDF9',
  boxShadow: '0 4px 20px rgba(180,140,80,0.10)',
  border: '1px solid rgba(255,255,255,0.95)',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '16px',
};

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNotices() {
      try {
        const { data, error } = await supabase
          .from('notices')
          .select('*')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotices(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchNotices();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes bgBreathe {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .notice-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(180,140,80,0.18) !important;
          transition: all 0.2s ease;
        }
        .pinned-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: linear-gradient(135deg, #006A4E, #004D38);
          color: white;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
      `}</style>

      <div style={gradientBg}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 20px 100px' }}>

          {/* Header */}
          <div style={{ marginBottom: '36px' }}>
            <h1 style={{
              fontFamily: 'Fraunces, serif',
              fontWeight: 800,
              fontSize: 'clamp(28px, 5vw, 40px)',
              background: 'linear-gradient(135deg, #006A4E 0%, #1A3A2A 60%, #004D38 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 8px 0',
              lineHeight: 1.15,
            }}>
              Notices
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#555555', fontSize: '15px', margin: 0 }}>
              Official notices and updates from the organization.
            </p>
          </div>

          {/* States */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: 'DM Sans, sans-serif', color: '#888888' }}>
              Loading notices...
            </div>
          )}

          {error && (
            <div style={{ ...cardStyle, borderLeft: '4px solid #D42027', color: '#D42027', fontFamily: 'DM Sans, sans-serif' }}>
              Failed to load notices: {error}
            </div>
          )}

          {!loading && !error && notices.length === 0 && (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#888888', margin: 0 }}>No notices yet.</p>
            </div>
          )}

          {/* Notice List */}
          {!loading && notices.map(notice => (
            <div
              key={notice.id}
              className="notice-card"
              style={{
                ...cardStyle,
                borderLeft: notice.is_pinned ? '4px solid #006A4E' : '4px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <h2 style={{
                  fontFamily: 'Fraunces, serif',
                  fontWeight: 800,
                  fontSize: '18px',
                  color: '#111111',
                  margin: 0,
                  flex: 1,
                }}>
                  {notice.title}
                </h2>
                {notice.is_pinned && (
                  <span className="pinned-badge">📌 Pinned</span>
                )}
              </div>

              <p style={{
                fontFamily: 'DM Sans, sans-serif',
                color: '#555555',
                fontSize: '14px',
                lineHeight: '1.6',
                margin: '0 0 12px 0',
                whiteSpace: 'pre-wrap',
              }}>
                {notice.body}
              </p>

              <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#888888', fontSize: '12px', margin: 0 }}>
                {new Date(notice.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          ))}

        </div>
      </div>
    </>
  );
}