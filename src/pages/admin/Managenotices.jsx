import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

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
};

const inputStyle = {
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
};

const btnPrimary = {
  background: 'linear-gradient(135deg, #006A4E, #004D38)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  padding: '10px 22px',
  fontFamily: 'DM Sans, sans-serif',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer',
};

const btnDanger = {
  background: 'transparent',
  color: '#D42027',
  border: '1px solid #D42027',
  borderRadius: '8px',
  padding: '6px 14px',
  fontFamily: 'DM Sans, sans-serif',
  fontWeight: 600,
  fontSize: '12px',
  cursor: 'pointer',
};

const btnSecondary = {
  background: 'transparent',
  color: '#006A4E',
  border: '1px solid #006A4E',
  borderRadius: '8px',
  padding: '6px 14px',
  fontFamily: 'DM Sans, sans-serif',
  fontWeight: 600,
  fontSize: '12px',
  cursor: 'pointer',
};

const EMPTY_FORM = { title: '', body: '', is_pinned: false };

export default function ManageNotices() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

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

  function showSuccess(msg) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.body.trim()) {
      setError('Title and body are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('notices')
          .update({ title: form.title, body: form.body, is_pinned: form.is_pinned })
          .eq('id', editingId);
        if (error) throw error;
        showSuccess('Notice updated.');
      } else {
        const { error } = await supabase
          .from('notices')
          .insert({ title: form.title, body: form.body, is_pinned: form.is_pinned, created_by: user?.id });
        if (error) throw error;
        showSuccess('Notice created.');
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchNotices();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(notice) {
    setEditingId(notice.id);
    setForm({ title: notice.title, body: notice.body, is_pinned: notice.is_pinned });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancel() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this notice?')) return;
    try {
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (error) throw error;
      showSuccess('Notice deleted.');
      fetchNotices();
    } catch (err) {
      setError(err.message);
    }
  }

  async function togglePin(notice) {
    try {
      const { error } = await supabase
        .from('notices')
        .update({ is_pinned: !notice.is_pinned })
        .eq('id', notice.id);
      if (error) throw error;
      fetchNotices();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes bgBreathe {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        textarea:focus, input:focus { border-color: #006A4E !important; }
      `}</style>

      <div style={gradientBg}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px 100px' }}>

          {/* Header */}
          <h1 style={{
            fontFamily: 'Fraunces, serif',
            fontWeight: 800,
            fontSize: 'clamp(26px, 4vw, 36px)',
            background: 'linear-gradient(135deg, #006A4E 0%, #1A3A2A 60%, #004D38 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 28px 0',
          }}>
            {editingId ? 'Edit Notice' : 'Manage Notices'}
          </h1>

          {/* Alerts */}
          {error && (
            <div style={{ background: '#FFF0F0', border: '1px solid #D42027', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#D42027', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#F0FBF6', border: '1px solid #006A4E', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#006A4E', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}>
              ✓ {success}
            </div>
          )}

          {/* Form */}
          <div style={{ ...cardStyle, marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '18px', color: '#111111', margin: '0 0 20px 0' }}>
              {editingId ? 'Update Notice' : 'Create New Notice'}
            </h2>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 600, color: '#555555', display: 'block', marginBottom: '6px' }}>
                Title *
              </label>
              <input
                type="text"
                style={inputStyle}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Notice title..."
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 600, color: '#555555', display: 'block', marginBottom: '6px' }}>
                Body *
              </label>
              <textarea
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Notice content..."
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <input
                type="checkbox"
                id="is_pinned"
                checked={form.is_pinned}
                onChange={e => setForm(f => ({ ...f, is_pinned: e.target.checked }))}
                style={{ width: '16px', height: '16px', accentColor: '#006A4E', cursor: 'pointer' }}
              />
              <label htmlFor="is_pinned" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: '#555555', cursor: 'pointer' }}>
                Pin this notice (shows at top)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={btnPrimary} onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Notice' : 'Create Notice'}
              </button>
              {editingId && (
                <button style={{ ...btnSecondary, padding: '10px 22px' }} onClick={handleCancel}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Notice List */}
          <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '20px', color: '#111111', margin: '0 0 16px 0' }}>
            All Notices ({notices.length})
          </h2>

          {loading && (
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#888888', textAlign: 'center', padding: '40px 0' }}>Loading...</p>
          )}

          {!loading && notices.length === 0 && (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '40px' }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#888888', margin: 0 }}>No notices yet. Create one above.</p>
            </div>
          )}

          {!loading && notices.map(notice => (
            <div key={notice.id} style={{ ...cardStyle, marginBottom: '14px', borderLeft: notice.is_pinned ? '4px solid #006A4E' : '4px solid transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '16px', color: '#111111', margin: 0 }}>
                      {notice.title}
                    </h3>
                    {notice.is_pinned && (
                      <span style={{ background: 'linear-gradient(135deg, #006A4E, #004D38)', color: 'white', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', fontFamily: 'DM Sans, sans-serif' }}>
                        PINNED
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#555555', fontSize: '13px', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                    {notice.body.length > 120 ? notice.body.slice(0, 120) + '...' : notice.body}
                  </p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#888888', fontSize: '12px', margin: 0 }}>
                    {new Date(notice.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button style={btnSecondary} onClick={() => togglePin(notice)}>
                    {notice.is_pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button style={btnSecondary} onClick={() => handleEdit(notice)}>
                    Edit
                  </button>
                  <button style={btnDanger} onClick={() => handleDelete(notice.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </>
  );
}