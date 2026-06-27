import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ESG() {
  const [logs, setLogs]       = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
  energy_kwh: '', water_litres: '',
  recycled_percent: ''
})

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const res = await api.get('/esg/')
      setLogs(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    try {
      await api.post('/esg/', {
        ...form,
        energy_kwh:       parseFloat(form.energy_kwh),
        water_litres:     parseFloat(form.water_litres),
        recycled_percent: parseFloat(form.recycled_percent),
      })
      setForm({ energy_kwh: '', water_litres: '', recycled_percent: '' })
      setShowForm(false)
      fetchData()
      toast.success('ESG entry logged!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to log ESG data')
    }
  }

  if (loading) return <div style={{ padding: '32px', color: '#64748b' }}>Loading...</div>

  // Summary averages
  const avg = (key) => logs.length
    ? Math.round(logs.reduce((s, l) => s + (l[key] || 0), 0) / logs.length)
    : 0

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>ESG Tracker</h1>
          <p style={styles.subtitle}>Energy, water and sustainability monitoring</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? '✕ Cancel' : '+ Log Entry'}
        </button>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiRow}>
        {[
          { label: 'Avg Energy / Shift',    value: `${avg('energy_kwh')} kWh`,  color: '#f59e0b', icon: '⚡' },
          { label: 'Avg Water / Shift',     value: `${avg('water_litres')} L`,   color: '#3b82f6', icon: '💧' },
          { label: 'Avg Recycled %',        value: `${avg('recycled_percent')}%`, color: '#10b981', icon: '♻️' },
          { label: 'Total Logs',            value: logs.length,                   color: '#8b5cf6', icon: '📋' },
        ].map(k => (
          <div key={k.label} style={styles.kpiCard}>
            <span style={styles.kpiIcon}>{k.icon}</span>
            <div style={{ ...styles.kpiValue, color: k.color }}>{k.value}</div>
            <div style={styles.kpiLabel}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Log Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Log ESG Data</h3>
          <form onSubmit={handleCreate} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Energy (kWh) *</label>
                <input style={styles.input} type="number" step="0.1"
                  placeholder="e.g. 1200" value={form.energy_kwh}
                  onChange={e => setForm({ ...form, energy_kwh: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Water (Litres) *</label>
                <input style={styles.input} type="number" step="0.1"
                  placeholder="e.g. 3500" value={form.water_litres}
                  onChange={e => setForm({ ...form, water_litres: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Recycled % *</label>
                <input style={styles.input} type="number" step="0.1" min="0" max="100"
                  placeholder="e.g. 65" value={form.recycled_percent}
                  onChange={e => setForm({ ...form, recycled_percent: e.target.value })} required />
              </div>
            </div>
            <button type="submit" style={styles.submitBtn}>Log Entry</button>
          </form>
        </div>
      )}

      {/* Charts */}
      {logs.length > 0 && (
        <div style={styles.chartsRow}>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>⚡ Energy Consumption Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={[...logs].reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="log_date" tick={{ fontSize: 10 }}
                  tickFormatter={d => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={v => [`${v} kWh`, 'Energy']} />
                <Line type="monotone" dataKey="energy_kwh" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>♻️ Recycled Material %</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={[...logs].reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="log_date" tick={{ fontSize: 10 }}
                  tickFormatter={d => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={v => [`${v}%`, 'Recycled']} />
                <Line type="monotone" dataKey="recycled_percent" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ESG Logs Table */}
      <div style={styles.tableCard}>
        <h3 style={{ ...styles.chartTitle, marginBottom: '16px' }}>ESG Log History</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Shift</th>
              <th style={styles.th}>Energy (kWh)</th>
              <th style={styles.th}>Water (L)</th>
              <th style={styles.th}>Recycled %</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={l.id} style={{
                ...styles.tr,
                backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc'
              }}>
                <td style={styles.td}>
                  {l.log_date
                    ? new Date(l.log_date).toLocaleDateString('en-IN')
                    : '—'}
                </td>
                <td style={styles.td}>{l.shift_type || '—'}</td>
                <td style={styles.td}>{l.energy_kwh}</td>
                <td style={styles.td}>{l.water_litres}</td>
                <td style={{ ...styles.td, color: '#10b981', fontWeight: '500' }}>
                  {l.recycled_percent}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div style={styles.empty}>No ESG logs yet. Click "+ Log Entry" to add one.</div>
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
  kpiValue:   { fontSize: '22px', fontWeight: '700', margin: '8px 0 4px' },
  kpiLabel:   { fontSize: '12px', color: '#64748b' },
  formCard:   { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  formTitle:  { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' },
  form:       { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field:      { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:      { fontSize: '13px', fontWeight: '500', color: '#374151' },
  input:      { padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
  submitBtn:  { padding: '10px 24px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', alignSelf: 'flex-start' },
  chartsRow:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  chartCard:  { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  chartTitle: { fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' },
  tableCard:  { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table:      { width: '100%', borderCollapse: 'collapse' },
  thead:      { backgroundColor: '#f8fafc' },
  th:         { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
  tr:         { borderBottom: '1px solid #f1f5f9' },
  td:         { padding: '11px 14px', fontSize: '14px', color: '#1e293b' },
  empty:      { padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' },
}