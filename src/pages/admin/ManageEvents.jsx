import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const BUCKET = 'event-photos'

export default function ManageEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const empty = {
    title: '', title_bn: '', description: '',
    event_date: '', location: '', slug: '',
    is_published: false, cover_image_url: ''
  }
  const [form, setForm] = useState(empty)

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false })
      setEvents(data || [])
      setLoading(false)
    }
    fetchEvents()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(empty)
    setError('')
    setShowForm(true)
  }

  function openEdit(ev) {
    setEditing(ev.id)
    setForm({
      title: ev.title || '',
      title_bn: ev.title_bn || '',
      description: ev.description || '',
      event_date: ev.event_date || '',
      location: ev.location || '',
      slug: ev.slug || '',
      is_published: ev.is_published || false,
      cover_image_url: ev.cover_image_url || ''
    })
    setError('')
    setShowForm(true)
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `event-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file, { upsert: true })
    if (upErr) { setError(upErr.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
    setForm(f => ({ ...f, cover_image_url: publicUrl }))
    setUploading(false)
  }

  async function handleSave() {
    if (!form.title) { setError('Title is required.'); return }
    if (!form.event_date) { setError('Event date is required.'); return }
    if (!form.slug) { setError('Slug is required.'); return }
    setError('')
    setSaving(true)

    if (editing) {
      const { error } = await supabase.from('events').update(form).eq('id', editing)
      if (error) { setError(error.message); setSaving(false); return }
      setEvents(prev => prev.map(ev => ev.id === editing ? { ...ev, ...form } : ev))
    } else {
      const { data, error } = await supabase.from('events').insert(form).select().single()
      if (error) { setError(error.message); setSaving(false); return }
      setEvents(prev => [data, ...prev])
    }
    setSaving(false)
    setShowForm(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    setEvents(prev => prev.filter(ev => ev.id !== id))
  }

  async function togglePublish(ev) {
    const updated = !ev.is_published
    await supabase.from('events').update({ is_published: updated }).eq('id', ev.id)
    setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, is_published: updated } : e))
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
        padding: '32px 20px 100px',
        boxSizing: 'border-box',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <h1 style={{
                fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '32px',
                background: 'linear-gradient(135deg, #006A4E 0%, #1A3A2A 60%, #004D38 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', margin: '0 0 4px 0',
              }}>Manage Events</h1>
              <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#888888', fontSize: '14px', margin: 0 }}>
                Create, edit and publish events
              </p>
            </div>
            <button onClick={openCreate} style={{
              background: 'linear-gradient(135deg, #006A4E, #004D38)',
              color: 'white', border: 'none', borderRadius: '10px',
              padding: '10px 20px', fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer',
            }}>+ New Event</button>
          </div>

          {/* Form */}
          {showForm && (
            <div style={{
              background: '#FFFDF9', borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(180,140,80,0.10)',
              border: '1px solid rgba(255,255,255,0.95)',
              padding: '28px', marginBottom: '28px',
            }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '20px', color: '#1A3A2A', margin: '0 0 20px 0' }}>
                {editing ? 'Edit Event' : 'New Event'}
              </h2>

              {error && (
                <div style={{ background: '#FFF0F0', border: '1px solid #D42027', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: '#D42027', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              {/* Cover Image */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Cover Image</label>
                {form.cover_image_url && (
                  <img src={form.cover_image_url} alt="cover"
                    style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '10px', marginBottom: '8px' }} />
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload}
                  style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#555555' }} />
                {uploading && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: '#888888', margin: '4px 0 0' }}>Uploading...</p>}
              </div>

              {[
                { key: 'title', label: 'Title (English)', placeholder: 'Event title' },
                { key: 'title_bn', label: 'Title (Bangla)', placeholder: 'ইভেন্টের নাম' },
                { key: 'slug', label: 'Slug', placeholder: 'event-slug-here' },
                { key: 'location', label: 'Location', placeholder: 'Venue name' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={inputStyle}
                  />
                </div>
              ))}

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Event Date</label>
                <input type="date" value={form.event_date}
                  onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
                  style={inputStyle} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Event description..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="is_published" checked={form.is_published}
                  onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
                <label htmlFor="is_published" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: '#555555' }}>
                  Publish immediately
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleSave} disabled={saving || uploading} style={{
                  background: 'linear-gradient(135deg, #006A4E, #004D38)',
                  color: 'white', border: 'none', borderRadius: '10px',
                  padding: '10px 24px', fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 600, fontSize: '14px',
                  cursor: saving || uploading ? 'not-allowed' : 'pointer',
                  opacity: saving || uploading ? 0.7 : 1,
                }}>
                  {saving ? 'Saving...' : 'Save Event'}
                </button>
                <button onClick={() => setShowForm(false)} style={{
                  background: 'transparent', color: '#888888',
                  border: '1px solid #E5DDD0', borderRadius: '10px',
                  padding: '10px 20px', fontFamily: 'DM Sans, sans-serif',
                  fontSize: '14px', cursor: 'pointer',
                }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Events List */}
          {loading ? (
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#888888', textAlign: 'center' }}>Loading...</p>
          ) : events.length === 0 ? (
            <div style={{
              background: '#FFFDF9', borderRadius: '16px', padding: '40px',
              textAlign: 'center', boxShadow: '0 4px 20px rgba(180,140,80,0.10)',
              border: '1px solid rgba(255,255,255,0.95)',
            }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#888888', margin: 0 }}>No events yet. Create your first one.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {events.map(ev => (
                <div key={ev.id} style={{
                  background: '#FFFDF9', borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(180,140,80,0.10)',
                  border: '1px solid rgba(255,255,255,0.95)',
                  padding: '20px', display: 'flex',
                  gap: '16px', alignItems: 'flex-start',
                }}>
                  {ev.cover_image_url && (
                    <img src={ev.cover_image_url} alt={ev.title}
                      style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '15px', color: '#111111' }}>
                        {ev.title}
                      </span>
                      <span style={{
                        background: ev.is_published ? '#E8F5F0' : '#F5F5F5',
                        color: ev.is_published ? '#006A4E' : '#888888',
                        borderRadius: '20px', padding: '2px 10px',
                        fontSize: '11px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                      }}>
                        {ev.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#888888', margin: '0 0 4px 0' }}>
                      📅 {ev.event_date} {ev.location && `· 📍 ${ev.location}`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                    <button onClick={() => openEdit(ev)} style={actionBtnStyle('#006A4E')}>Edit</button>
                    <button onClick={() => togglePublish(ev)} style={actionBtnStyle('#B8860B')}>
                      {ev.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => handleDelete(ev.id)} style={actionBtnStyle('#D42027')}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const labelStyle = {
  fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
  fontWeight: 600, color: '#555555', display: 'block', marginBottom: '6px',
}

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: '1px solid #E5DDD0', fontFamily: 'DM Sans, sans-serif',
  fontSize: '14px', color: '#111111', background: '#FEFCF8',
  boxSizing: 'border-box', outline: 'none',
}

const actionBtnStyle = (color) => ({
  background: 'transparent', color,
  border: `1px solid ${color}`, borderRadius: '8px',
  padding: '5px 12px', fontFamily: 'DM Sans, sans-serif',
  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
})