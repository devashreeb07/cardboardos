import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const SHIFT_COLORS = {
  morning: { bg: '#fef3c7', color: '#92400e' },
  evening: { bg: '#dbeafe', color: '#1e40af' },
  night:   { bg: '#ede9fe', color: '#5b21b6' },
}

export default function Production() {
  const [runs, setRuns]         = useState([])
  const [summary, setSummary]   = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading]   = useState(true)
  const [form, setForm]         = useState({
    machine_name: '', quantity_produced: '',
    scrap_kg: '', shift_type: 'morning', operator_name: ''
  })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const [runsRes, summaryRes] = await Promise.all([
        api.get('/production/'),
        api.get('/production/summary')
      ])
      setRuns(runsRes.data)
      setSummary(summaryRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  toast.success('Production run logged!')

  async function handleCreate(e) {
    e.preventDefault()
    try {
      await api.post('/production/', {
        ...form,
        quantity_produced: parseInt(form.quantity_produced),
        scrap_kg: parseFloat(form.scrap_kg) || 0
      })
      setForm({
        machine_name: '', quantity_produced: '',
        scrap_kg: '', shift_type: 'morning', operator_name: ''
      })
      setShowForm(false)
      fetchData()
      toast.success('Production run logged!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to log production run')

    }
  }

  if (loading) return <div style={{ padding: '32px', color: '#64748b' }}>Loading...</div>

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Production</h1>
          <p style={styles.subtitle}>{runs.length} total runs logged</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? '✕ Cancel' : '+ Log Run'}
        </button>
      </div>

      {/* Summary KPIs */}
      {summary && (
        <div style={styles.kpiRow}>
          {[
            { label: 'Total Produced',  value: summary.total_produced?.toLocaleString(), icon: '📦', color: '#4f46e5' },
            { label: 'Produced Today',  value: summary.produced_today?.toLocaleString(), icon: '🏭', color: '#10b981' },
            { label: 'Total Scrap (kg)',value: summary.total_scrap_kg,                   icon: '♻️', color: '#f59e0b' },
            { label: 'Runs Today',      value: summary.runs_today,                       icon: '🔄', color: '#3b82f6' },
          ].map(k => (
            <div key={k.label} style={styles.kpiCard}>
              <span style={styles.kpiIcon}>{k.icon}</span>
              <div style={{ ...styles.kpiValue, color: k.color }}>{k.value ?? 0}</div>
              <div style={styles.kpiLabel}>{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Log Production Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Log Production Run</h3>
          <form onSubmit={handleCreate} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Machine Name *</label>
                <select
                  style={styles.input}
                  value={form.machine_name}
                  onChange={e => setForm({ ...form, machine_name: e.target.value })}
                  required
                >
                  <option value="">Select machine</option>
                  <option>Corrugator-1</option>
                  <option>Corrugator-2</option>
                  <option>Die-Cutter-A</option>
                  <option>Printer-B</option>
                </select>
              </div>
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
                <label style={styles.label}>Quantity Produced *</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="e.g. 1500"
                  value={form.quantity_produced}
                  onChange={e => setForm({ ...form, quantity_produced: e.target.value })}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Scrap (kg)</label>
                <input
                  style={styles.input}
                  type="number"
                  step="0.1"
                  placeholder="e.g. 12.5"
                  value={form.scrap_kg}
                  onChange={e => setForm({ ...form, scrap_kg: e.target.value })}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Shift *</label>
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
            </div>
            <button type="submit" style={styles.submitBtn}>Log Run</button>
          </form>
        </div>
      )}

      {/* Scrap by Machine */}
      {summary?.scrap_by_machine && (
        <div style={styles.scrapCard}>
          <h3 style={styles.chartTitle}>♻️ Scrap by Machine</h3>
          <div style={styles.scrapBars}>
            {Object.entries(summary.scrap_by_machine)
              .sort((a, b) => b[1] - a[1])
              .map(([machine, scrap], i) => {
                const max = Math.max(...Object.values(summary.scrap_by_machine))
                const pct = Math.round((scrap / max) * 100)
                const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6']
                return (
                  <div key={machine} style={styles.scrapRow}>
                    <div style={styles.scrapLabel}>{machine}</div>
                    <div style={styles.scrapBarBg}>
                      <div style={{
                        ...styles.scrapBarFill,
                        width: `${pct}%`,
                        backgroundColor: colors[i % colors.length]
                      }} />
                    </div>
                    <div style={styles.scrapValue}>{scrap} kg</div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Production Runs Table */}
      <div style={styles.tableCard}>
        <h3 style={{ ...styles.chartTitle, marginBottom: '16px' }}>All Production Runs</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Machine</th>
              <th style={styles.th}>Operator</th>
              <th style={styles.th}>Shift</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Scrap (kg)</th>
              <th style={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run, i) => {
              const sc = SHIFT_COLORS[run.shift_type] || {}
              return (
                <tr key={run.id} style={{
                  ...styles.tr,
                  backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc'
                }}>
                  <td style={styles.td}>#{run.id}</td>
                  <td style={{ ...styles.td, fontWeight: '500' }}>{run.machine_name}</td>
                  <td style={styles.td}>{run.operator_name}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, backgroundColor: sc.bg, color: sc.color }}>
                      {run.shift_type}
                    </span>
                  </td>
                  <td style={styles.td}>{run.quantity_produced?.toLocaleString()}</td>
                  <td style={{ ...styles.td, color: run.scrap_kg > 50 ? '#ef4444' : '#1e293b' }}>
                    {run.scrap_kg}
                  </td>
                  <td style={styles.td}>
                    {run.run_date
                      ? new Date(run.run_date).toLocaleDateString('en-IN')
                      : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {runs.length === 0 && (
          <div style={styles.empty}>No production runs logged yet.</div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '32px', maxWidth: '1200px', animation: 'fadeIn 0.2s ease' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  title:       { fontSize: '26px', fontWeight: '700', color: '#1e293b' },
  subtitle:    { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  addBtn:      { padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500' },
  kpiRow:      { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' },
  kpiCard:     { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' },
  kpiIcon:     { fontSize: '24px' },
  kpiValue:    { fontSize: '28px', fontWeight: '700', margin: '8px 0 4px' },
  kpiLabel:    { fontSize: '12px', color: '#64748b' },
  formCard:    { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  formTitle:   { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' },
  form:        { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field:       { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:       { fontSize: '13px', fontWeight: '500', color: '#374151' },
  input:       { padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
  submitBtn:   { padding: '10px 24px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', alignSelf: 'flex-start' },
  scrapCard:   { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  chartTitle:  { fontSize: '15px', fontWeight: '600', color: '#1e293b' },
  scrapBars:   { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' },
  scrapRow:    { display: 'flex', alignItems: 'center', gap: '12px' },
  scrapLabel:  { fontSize: '13px', color: '#374151', width: '130px', flexShrink: 0 },
  scrapBarBg:  { flex: 1, height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' },
  scrapBarFill:{ height: '10px', borderRadius: '5px', transition: 'width 0.4s ease' },
  scrapValue:  { fontSize: '13px', color: '#64748b', width: '60px', textAlign: 'right' },
  tableCard:   { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  thead:       { backgroundColor: '#f8fafc' },
  th:          { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
  tr:          { borderBottom: '1px solid #f1f5f9' },
  td:          { padding: '11px 14px', fontSize: '14px', color: '#1e293b' },
  badge:       { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  empty:       { padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' },
}