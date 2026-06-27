import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

export default function Waste() {
  const [summary, setSummary] = useState(null)
  const [trend, setTrend]     = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const [sumRes, trendRes] = await Promise.all([
        api.get('/waste/summary'),
        api.get('/waste/trend'),
      ])
      setSummary(sumRes.data)
      setTrend(trendRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={{ padding: '32px', color: '#64748b' }}>Loading...</div>

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Waste Tracker</h1>
        <p style={styles.subtitle}>Scrap analysis and material yield insights</p>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div style={styles.kpiRow}>
          {[
            { label: 'Total Scrap (kg)',    value: summary.total_scrap_kg,    color: '#ef4444', icon: '🗑️' },
            { label: 'Total Produced',      value: summary.total_produced?.toLocaleString(), color: '#4f46e5', icon: '📦' },
            { label: 'Avg Scrap / Run (kg)',value: summary.avg_scrap_per_run, color: '#f59e0b', icon: '📊' },
            { label: 'Production Runs',     value: summary.by_machine?.reduce((a, m) => a + m.run_count, 0), color: '#10b981', icon: '🔄' },
          ].map(k => (
            <div key={k.label} style={styles.kpiCard}>
              <span style={styles.kpiIcon}>{k.icon}</span>
              <div style={{ ...styles.kpiValue, color: k.color }}>{k.value ?? 0}</div>
              <div style={styles.kpiLabel}>{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div style={styles.chartsRow}>
        {/* Scrap trend line chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📉 Daily Scrap Trend</h3>
          <p style={styles.chartSub}>Total scrap generated per day (kg)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }}
                tickFormatter={d => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => [`${v} kg`, 'Scrap']} />
              <Line type="monotone" dataKey="scrap_kg" stroke="#ef4444"
                strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Scrap by machine bar chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>🏭 Scrap by Machine</h3>
          <p style={styles.chartSub}>Total scrap generated per machine (kg)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={summary?.by_machine || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="machine" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => [`${v} kg`, 'Scrap']} />
              <Bar dataKey="total_scrap" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scrap by shift */}
      {summary?.by_shift && (
        <div style={styles.shiftCard}>
          <h3 style={styles.chartTitle}>🕐 Scrap by Shift Type</h3>
          <div style={styles.shiftRow}>
            {summary.by_shift.map(s => (
              <div key={s.shift} style={styles.shiftItem}>
                <div style={styles.shiftName}>
                  {s.shift === 'morning' ? '🌅' : s.shift === 'evening' ? '🌆' : '🌙'} {s.shift}
                </div>
                <div style={styles.shiftScrap}>{s.total_scrap} kg total</div>
                <div style={styles.shiftAvg}>avg {s.avg_scrap} kg/run</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top waste runs */}
      {summary?.top_waste_runs && (
        <div style={styles.tableCard}>
          <h3 style={{ ...styles.chartTitle, marginBottom: '16px' }}>
            ⚠️ Top 5 Highest Scrap Runs
          </h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Run ID</th>
                <th style={styles.th}>Machine</th>
                <th style={styles.th}>Operator</th>
                <th style={styles.th}>Shift</th>
                <th style={styles.th}>Scrap (kg)</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {summary.top_waste_runs.map((r, i) => (
                <tr key={r.id} style={{
                  ...styles.tr,
                  backgroundColor: i === 0 ? '#fef2f2' : i % 2 === 0 ? '#fff' : '#f8fafc'
                }}>
                  <td style={styles.td}>#{r.id}</td>
                  <td style={{ ...styles.td, fontWeight: '500' }}>{r.machine}</td>
                  <td style={styles.td}>{r.operator}</td>
                  <td style={styles.td}>{r.shift}</td>
                  <td style={{ ...styles.td, color: '#ef4444', fontWeight: '600' }}>
                    {r.scrap_kg} kg
                  </td>
                  <td style={styles.td}>
                    {r.run_date
                      ? new Date(r.run_date).toLocaleDateString('en-IN')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { padding: '32px', maxWidth: '1200px', animation: 'fadeIn 0.2s ease' },
  header:     { marginBottom: '24px' },
  title:      { fontSize: '26px', fontWeight: '700', color: '#1e293b' },
  subtitle:   { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  kpiRow:     { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' },
  kpiCard:    { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' },
  kpiIcon:    { fontSize: '24px' },
  kpiValue:   { fontSize: '28px', fontWeight: '700', margin: '8px 0 4px' },
  kpiLabel:   { fontSize: '12px', color: '#64748b' },
  chartsRow:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  chartCard:  { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  chartTitle: { fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' },
  chartSub:   { fontSize: '12px', color: '#94a3b8', marginBottom: '16px' },
  shiftCard:  { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  shiftRow:   { display: 'flex', gap: '24px', marginTop: '16px', flexWrap: 'wrap' },
  shiftItem:  { flex: 1, backgroundColor: '#f8fafc', borderRadius: '10px', padding: '16px', textAlign: 'center' },
  shiftName:  { fontSize: '14px', fontWeight: '600', color: '#1e293b', textTransform: 'capitalize', marginBottom: '6px' },
  shiftScrap: { fontSize: '20px', fontWeight: '700', color: '#ef4444' },
  shiftAvg:   { fontSize: '12px', color: '#94a3b8', marginTop: '2px' },
  tableCard:  { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table:      { width: '100%', borderCollapse: 'collapse' },
  thead:      { backgroundColor: '#f8fafc' },
  th:         { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
  tr:         { borderBottom: '1px solid #f1f5f9' },
  td:         { padding: '11px 14px', fontSize: '14px', color: '#1e293b' },
}