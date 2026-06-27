import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const SHIFT_COLORS = {
  morning: { bg: '#fef3c7', color: '#92400e' },
  evening: { bg: '#dbeafe', color: '#1e40af' },
  night:   { bg: '#ede9fe', color: '#5b21b6' },
}

export default function Workforce() {
  const [shifts, setShifts]     = useState([])
  const [summary, setSummary]   = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading]   = useState(true)
  const [form, setForm]         = useState({
    operator_name: '', shift_type: 'morning',
    assigned_line: '',                          // ← fixed from line_assigned
    shift_date: '',
    start_time: '08:00',
    end_time: '16:00'
  })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const [shiftsRes, summaryRes] = await Promise.all([
        api.get('/workforce/'),
        api.get('/workforce/summary')
      ])
      setShifts(shiftsRes.data)
      setSummary(summaryRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    try {
      await api.post('/workforce/', form)
      setForm({
        operator_name: '', shift_type: 'morning',
        assigned_line: '', shift_date: '',      // ← fixed
        start_time: '08:00', end_time: '16:00'
      })
      setShowForm(false)
      fetchData()
      toast.success('Shift scheduled!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create shift')
    }
  }

  if (loading) return <div style={{ padding: '32px', color: '#64748b' }}>Loading...</div>

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Workforce</h1>
          <p style={styles.subtitle}>Shift scheduling and operator management</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? '✕ Cancel' : '+ Add Shift'}
        </button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div style={styles.kpiRow}>
          {[
            { label: 'Total Shifts',    value: summary.total_shifts,                 color: '#4f46e5', icon: '📅' },
            { label: "Today's Shifts",  value: summary.today_shifts,                 color: '#10b981', icon: '🕐' },
            { label: 'Morning Shifts',  value: summary.by_shift_type?.morning ?? 0,  color: '#f59e0b', icon: '🌅' },
            { label: 'Night Shifts',    value: summary.by_shift_type?.night ?? 0,    color: '#6366f1', icon: '🌙' },
          ].map(k => (
            <div key={k.label} style={styles.kpiCard}>
              <span style={styles.kpiIcon}>{k.icon}</span>
              <div style={{ ...styles.kpiValue, color: k.color }}>{k.value}</div>
              <div style={styles.kpiLabel}>{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add Shift Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Schedule a Shift</h3>
          <form onSubmit={handleCreate} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Operator Name *</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Ravi Kumar"
                  value={form.operator_name}
                  onChange={e => setForm({ ...form, operator_name: e.target.value })}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Shift Type *</label>
                <select
                  style={styles.input}
                  value={form.shift_type}
                  onChange={e => setForm({ ...form, shift_type: e.target.value })}
                >
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Line Assigned *</label>
                <select
                  style={styles.input}
                  value={form.assigned_line}                                   // ← fixed
                  onChange={e => setForm({ ...form, assigned_line: e.target.value })}  // ← fixed
                  required
                >
                  <option value="">Select line</option>
                  <option>Line A</option>
                  <option>Line B</option>
                  <option>Line C</option>
                  <option>Line D</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Shift Date *</label>
                <input
                  style={styles.input}
                  type="date"
                  value={form.shift_date}
                  onChange={e => setForm({ ...form, shift_date: e.target.value })}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Start Time</label>
                <input
                  style={styles.input}
                  type="time"
                  value={form.start_time}
                  onChange={e => setForm({ ...form, start_time: e.target.value })}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>End Time</label>
                <input
                  style={styles.input}
                  type="time"
                  value={form.end_time}
                  onChange={e => setForm({ ...form, end_time: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" style={styles.submitBtn}>Schedule Shift</button>
          </form>
        </div>
      )}

      {/* Shifts Table */}
      <div style={styles.tableCard}>
        <h3 style={{ ...styles.chartTitle, marginBottom: '16px' }}>Shift Schedule</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Operator</th>
              <th style={styles.th}>Shift</th>
              <th style={styles.th}>Line</th>
              <th style={styles.th}>Start</th>
              <th style={styles.th}>End</th>
              <th style={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((s, i) => {
              const sc = SHIFT_COLORS[s.shift_type] || {}
              return (
                <tr key={s.id} style={{
                  ...styles.tr,
                  backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc'
                }}>
                  <td style={styles.td}>#{s.id}</td>
                  <td style={{ ...styles.td, fontWeight: '500' }}>{s.operator_name}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, backgroundColor: sc.bg, color: sc.color }}>
                      {s.shift_type}
                    </span>
                  </td>
                  <td style={styles.td}>{s.assigned_line}</td>   {/* ← fixed */}
                  <td style={styles.td}>{s.start_time || '—'}</td>
                  <td style={styles.td}>{s.end_time || '—'}</td>
                  <td style={styles.td}>
                    {s.shift_date
                      ? new Date(s.shift_date).toLocaleDateString('en-IN')
                      : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {shifts.length === 0 && (
          <div style={styles.empty}>No shifts scheduled yet.</div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '32px', maxWidth: '1200px', animation: 'fadeIn 0.2s ease' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  title:      { fontSize: '26px', fontWeight: '700', color: '#1e293b' },
  subtitle:   { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  addBtn:     { padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500' },
  kpiRow:     { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' },
  kpiCard:    { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' },
  kpiIcon:    { fontSize: '24px' },
  kpiValue:   { fontSize: '28px', fontWeight: '700', margin: '8px 0 4px' },
  kpiLabel:   { fontSize: '12px', color: '#64748b' },
  formCard:   { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  formTitle:  { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' },
  form:       { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field:      { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:      { fontSize: '13px', fontWeight: '500', color: '#374151' },
  input:      { padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
  submitBtn:  { padding: '10px 24px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', alignSelf: 'flex-start' },
  chartTitle: { fontSize: '15px', fontWeight: '600', color: '#1e293b' },
  tableCard:  { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table:      { width: '100%', borderCollapse: 'collapse' },
  thead:      { backgroundColor: '#f8fafc' },
  th:         { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
  tr:         { borderBottom: '1px solid #f1f5f9' },
  td:         { padding: '11px 14px', fontSize: '14px', color: '#1e293b' },
  badge:      { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  empty:      { padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' },
}