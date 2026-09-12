import { useState, useEffect } from 'react'
import customerApi from '../../api/customerAxios'
import toast from 'react-hot-toast'

export default function CustomerProfile() {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchProfile() }, [])

  async function fetchProfile() {
    try {
      const res = await customerApi.get('/customer/profile')
      setProfile(res.data)
      setForm(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    try {
      const res = await customerApi.put('/customer/profile', form)
      setProfile(res.data.user)
      localStorage.setItem('customer_user', JSON.stringify(res.data.user))
      setEditing(false)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error('Failed to update profile')
    }
  }

  if (loading) return <div style={{ padding: '32px', color: '#64748b' }}>Loading...</div>

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Profile</h1>
        <p style={styles.subtitle}>Manage your account and company details</p>
      </div>

      {/* Profile card */}
      <div style={styles.profileCard}>
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={styles.profileName}>{profile?.name}</div>
            <div style={styles.profileCompany}>{profile?.company_name}</div>
            <div style={styles.profileRole}>Customer Account</div>
          </div>
        </div>

        {!editing ? (
          <div>
            <div style={styles.detailsGrid}>
              {[
                { label: 'Full Name',     value: profile?.name },
                { label: 'Email',         value: profile?.email },
                { label: 'Company',       value: profile?.company_name },
                { label: 'Phone',         value: profile?.phone || '—' },
                { label: 'Address',       value: profile?.address || '—' },
                { label: 'Member Since',  value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : '—' },
              ].map(row => (
                <div key={row.label} style={styles.detailRow}>
                  <span style={styles.detailLabel}>{row.label}</span>
                  <span style={styles.detailValue}>{row.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setEditing(true)} style={styles.editBtn}>
              ✏️ Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} style={styles.editForm}>
            <div style={styles.formGrid}>
              {[
                { label: 'Full Name',     key: 'name',         type: 'text' },
                { label: 'Company Name',  key: 'company_name', type: 'text' },
                { label: 'Phone',         key: 'phone',        type: 'tel'  },
                { label: 'Address',       key: 'address',      type: 'text' },
              ].map(f => (
                <div key={f.key} style={styles.field}>
                  <label style={styles.label}>{f.label}</label>
                  <input
                    style={styles.input}
                    type={f.type}
                    value={form[f.key] || ''}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div style={styles.editBtns}>
              <button type="button" onClick={() => setEditing(false)} style={styles.cancelBtn}>
                Cancel
              </button>
              <button type="submit" style={styles.saveBtn}>
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

const styles = {
  page:          { padding: '32px', maxWidth: '700px', animation: 'fadeIn 0.2s ease' },
  header:        { marginBottom: '24px' },
  title:         { fontSize: '26px', fontWeight: '700', color: '#1e293b' },
  subtitle:      { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  profileCard:   { backgroundColor: '#fff', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  avatarSection: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' },
  avatar:        { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#1d4ed8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700' },
  profileName:   { fontSize: '18px', fontWeight: '700', color: '#1e293b' },
  profileCompany:{ fontSize: '14px', color: '#64748b', marginTop: '2px' },
  profileRole:   { fontSize: '12px', color: '#93c5fd', marginTop: '2px', fontWeight: '500' },
  detailsGrid:   { display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '20px' },
  detailRow:     { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f8fafc', fontSize: '14px' },
  detailLabel:   { color: '#64748b', fontWeight: '500' },
  detailValue:   { color: '#1e293b', fontWeight: '500' },
  editBtn:       { padding: '10px 20px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
  editForm:      {},
  formGrid:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  field:         { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:         { fontSize: '13px', fontWeight: '500', color: '#374151' },
  input:         { padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
  editBtns:      { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  cancelBtn:     { padding: '9px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
  saveBtn:       { padding: '9px 20px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
}