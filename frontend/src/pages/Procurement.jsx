import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Procurement() {
  const [suppliers, setSuppliers] = useState([])
  const [prices, setPrices]       = useState([])
  const [summary, setSummary]     = useState(null)
  const [showForm, setShowForm]   = useState(false)
  const [loading, setLoading]     = useState(true)
  const [form, setForm]           = useState({
    name: '', material_type: '', price_per_ton: '', reliability_score: ''
  })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const [suppRes, priceRes, sumRes] = await Promise.all([
        api.get('/procurement/suppliers'),
        api.get('/procurement/prices'),
        api.get('/procurement/summary')
      ])
      setSuppliers(suppRes.data)
      setPrices(priceRes.data.reverse())
      setSummary(sumRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddSupplier(e) {
    e.preventDefault()
    try {
      await api.post('/procurement/suppliers', {
        ...form,
        price_per_ton: parseFloat(form.price_per_ton),
        reliability_score: parseFloat(form.reliability_score)
      })
      setForm({ name: '', material_type: '', price_per_ton: '', reliability_score: '' })
      setShowForm(false)
      fetchData()
      toast.success('Supplier added!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add supplier')
    }
  }

  if (loading) return <div style={{ padding: '32px', color: '#64748b' }}>Loading...</div>

  // Filter price history for kraft paper for chart
  const kraftPrices = prices.filter(p => p.material_type === 'Kraft Paper')

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Procurement</h1>
          <p style={styles.subtitle}>Supplier management and material price tracking</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? '✕ Cancel' : '+ Add Supplier'}
        </button>
      </div>

      {/* Summary KPIs */}
      {summary && (
        <div style={styles.kpiRow}>
          <div style={styles.kpiCard}>
            <span style={styles.kpiIcon}>🏭</span>
            <div style={{ ...styles.kpiValue, color: '#4f46e5' }}>{summary.total_suppliers}</div>
            <div style={styles.kpiLabel}>Total Suppliers</div>
          </div>
          <div style={styles.kpiCard}>
            <span style={styles.kpiIcon}>⭐</span>
            <div style={{ ...styles.kpiValue, color: '#10b981' }}>{summary.avg_reliability}%</div>
            <div style={styles.kpiLabel}>Avg Reliability</div>
          </div>
          {Object.entries(summary.latest_prices || {}).map(([material, price]) => (
            <div key={material} style={styles.kpiCard}>
              <span style={styles.kpiIcon}>💰</span>
              <div style={{ ...styles.kpiValue, color: '#f59e0b' }}>₹{price}</div>
              <div style={styles.kpiLabel}>{material} / ton</div>
            </div>
          ))}
        </div>
      )}

      {/* Add Supplier Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Add Supplier</h3>
          <form onSubmit={handleAddSupplier} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Supplier Name *</label>
                <input style={styles.input} placeholder="e.g. PaperCo Industries"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Material Type *</label>
                <select style={styles.input} value={form.material_type}
                  onChange={e => setForm({ ...form, material_type: e.target.value })} required>
                  <option value="">Select material</option>
                  <option>Kraft Paper</option>
                  <option>Recycled Fiber</option>
                  <option>Virgin Pulp</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Price per Ton (₹)</label>
                <input style={styles.input} type="number" placeholder="e.g. 450"
                  value={form.price_per_ton} onChange={e => setForm({ ...form, price_per_ton: e.target.value })} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Reliability Score (0–100)</label>
                <input style={styles.input} type="number" min="0" max="100" placeholder="e.g. 87"
                  value={form.reliability_score} onChange={e => setForm({ ...form, reliability_score: e.target.value })} />
              </div>
            </div>
            <button type="submit" style={styles.submitBtn}>Add Supplier</button>
          </form>
        </div>
      )}

      {/* Price History Chart */}
      {kraftPrices.length > 0 && (
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📈 Kraft Paper Price History</h3>
          <p style={styles.chartSub}>Price per ton over last 30 records</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={kraftPrices}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="recorded_date" tick={{ fontSize: 11 }}
                tickFormatter={d => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => [`₹${v}`, 'Price/ton']} />
              <Line type="monotone" dataKey="price_per_ton" stroke="#4f46e5" strokeWidth={2}
                dot={{ fill: '#4f46e5', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Suppliers Table */}
      <div style={styles.tableCard}>
        <h3 style={{ ...styles.chartTitle, marginBottom: '16px' }}>Suppliers</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Supplier</th>
              <th style={styles.th}>Material</th>
              <th style={styles.th}>Price/Ton</th>
              <th style={styles.th}>Reliability</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s, i) => (
              <tr key={s.id} style={{ ...styles.tr, backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                <td style={{ ...styles.td, fontWeight: '500' }}>{s.name}</td>
                <td style={styles.td}>{s.material_type}</td>
                <td style={styles.td}>₹{s.price_per_ton?.toLocaleString()}</td>
                <td style={styles.td}>
                  <div style={styles.reliabilityRow}>
                    <div style={styles.reliabilityBg}>
                      <div style={{
                        ...styles.reliabilityFill,
                        width: `${s.reliability_score}%`,
                        backgroundColor: s.reliability_score >= 85 ? '#10b981' : s.reliability_score >= 70 ? '#f59e0b' : '#ef4444'
                      }} />
                    </div>
                    <span style={styles.reliabilityText}>{s.reliability_score?.toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {suppliers.length === 0 && (
          <div style={styles.empty}>No suppliers added yet.</div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '32px', maxWidth: '1200px', animation: 'fadeIn 0.2s ease' },
  header:           { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  title:            { fontSize: '26px', fontWeight: '700', color: '#1e293b' },
  subtitle:         { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  addBtn:           { padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500' },
  kpiRow:           { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' },
  kpiCard:          { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' },
  kpiIcon:          { fontSize: '24px' },
  kpiValue:         { fontSize: '28px', fontWeight: '700', margin: '8px 0 4px' },
  kpiLabel:         { fontSize: '12px', color: '#64748b' },
  formCard:         { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  formTitle:        { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' },
  form:             { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGrid:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field:            { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:            { fontSize: '13px', fontWeight: '500', color: '#374151' },
  input:            { padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
  submitBtn:        { padding: '10px 24px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', alignSelf: 'flex-start' },
  chartCard:        { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  chartTitle:       { fontSize: '15px', fontWeight: '600', color: '#1e293b' },
  chartSub:         { fontSize: '12px', color: '#94a3b8', marginBottom: '16px' },
  tableCard:        { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table:            { width: '100%', borderCollapse: 'collapse' },
  thead:            { backgroundColor: '#f8fafc' },
  th:               { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
  tr:               { borderBottom: '1px solid #f1f5f9' },
  td:               { padding: '11px 14px', fontSize: '14px', color: '#1e293b' },
  reliabilityRow:   { display: 'flex', alignItems: 'center', gap: '8px' },
  reliabilityBg:    { flex: 1, height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' },
  reliabilityFill:  { height: '6px', borderRadius: '3px', transition: 'width 0.4s' },
  reliabilityText:  { fontSize: '12px', color: '#64748b', width: '40px' },
  empty:            { padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' },
}