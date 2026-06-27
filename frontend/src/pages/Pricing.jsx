import { useState } from 'react'
import api from '../api/axios'

const BOX_TYPES = [
  'Corrugated 3-ply',
  'Corrugated 5-ply',
  'Die-cut box',
  'Mailer box',
]

export default function Pricing() {
  const [form, setForm]       = useState({
    box_type: 'Corrugated 3-ply',
    quantity: '',
    margin: 25,
  })
  const [quote, setQuote]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleQuote(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setQuote(null)
    try {
      const res = await api.post('/pricing/quote', {
        box_type: form.box_type,
        quantity: parseInt(form.quantity),
        margin:   form.margin / 100,
      })
      setQuote(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate quote')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Pricing Engine</h1>
        <p style={styles.subtitle}>AI-assisted quote generation based on live material costs</p>
      </div>

      <div style={styles.layout}>
        {/* Quote Form */}
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Generate Quote</h3>
          <form onSubmit={handleQuote} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Box Type</label>
              <select
                style={styles.input}
                value={form.box_type}
                onChange={e => setForm({ ...form, box_type: e.target.value })}
              >
                {BOX_TYPES.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Quantity (boxes)</label>
              <input
                style={styles.input}
                type="number"
                placeholder="e.g. 5000"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Margin: {form.margin}%</label>
              <input
                type="range"
                min="10" max="50" step="5"
                value={form.margin}
                onChange={e => setForm({ ...form, margin: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
              <div style={styles.rangeLabels}>
                <span>10%</span><span>50%</span>
              </div>
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Calculating...' : '💰 Generate Quote'}
            </button>
          </form>
        </div>

        {/* Quote Result */}
        {quote && (
          <div style={styles.quoteCard}>
            <div style={styles.quoteHeader}>
              <h3 style={styles.quoteTitle}>Quote Summary</h3>
              <span style={styles.quoteBadge}>Live pricing</span>
            </div>

            <div style={styles.quoteBig}>
              <div style={styles.quoteBigLabel}>Total Quote Value</div>
              <div style={styles.quoteBigValue}>
                ₹{quote.total_quote?.toLocaleString('en-IN')}
              </div>
              <div style={styles.quoteBigSub}>
                for {quote.quantity?.toLocaleString()} × {quote.box_type}
              </div>
            </div>

            <div style={styles.breakdown}>
              {[
                { label: 'Material cost/box',  value: `₹${quote.material_cost_per_box}` },
                { label: 'Machine cost/box',   value: `₹${quote.machine_cost_per_box}`  },
                { label: 'Labour cost/box',    value: `₹${quote.labour_cost_per_box}`   },
                { label: 'Total cost/box',     value: `₹${quote.total_cost_per_box}`,   bold: true },
                { label: 'Margin applied',     value: `${quote.margin_percent}%`         },
                { label: 'Selling price/box',  value: `₹${quote.price_per_box}`,        bold: true },
              ].map(row => (
                <div key={row.label} style={styles.breakdownRow}>
                  <span style={styles.breakdownLabel}>{row.label}</span>
                  <span style={{
                    ...styles.breakdownValue,
                    fontWeight: row.bold ? '700' : '400',
                    color: row.bold ? '#1e293b' : '#64748b'
                  }}>{row.value}</span>
                </div>
              ))}
            </div>

            <div style={styles.profitRow}>
              <div style={styles.profitBox}>
                <div style={styles.profitLabel}>Total Cost</div>
                <div style={{ ...styles.profitValue, color: '#ef4444' }}>
                  ₹{quote.total_cost?.toLocaleString('en-IN')}
                </div>
              </div>
              <div style={styles.profitBox}>
                <div style={styles.profitLabel}>Total Profit</div>
                <div style={{ ...styles.profitValue, color: '#10b981' }}>
                  ₹{quote.total_profit?.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div style={styles.materialNote}>
              📊 Based on live Kraft Paper price: ₹{quote.material_price_per_ton?.toLocaleString()}/ton
            </div>
          </div>
        )}
      </div>

      {/* How it works */}
      <div style={styles.infoCard}>
        <h3 style={styles.infoTitle}>How pricing is calculated</h3>
        <div style={styles.infoGrid}>
          {[
            { icon: '📦', title: 'Material Cost',  desc: 'Based on live Kraft Paper price from procurement database × kg used per box type' },
            { icon: '⚙️', title: 'Machine Cost',   desc: 'Fixed ₹2.50 per box covering machine runtime, electricity, and maintenance allocation' },
            { icon: '👷', title: 'Labour Cost',    desc: 'Fixed ₹1.20 per box covering operator wages and packaging labour' },
            { icon: '📈', title: 'Margin',         desc: 'Adjustable 10–50% profit margin applied on top of total cost to get final selling price' },
          ].map(item => (
            <div key={item.title} style={styles.infoItem}>
              <span style={styles.infoIcon}>{item.icon}</span>
              <div>
                <div style={styles.infoItemTitle}>{item.title}</div>
                <div style={styles.infoItemDesc}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '32px', maxWidth: '1100px', animation: 'fadeIn 0.2s ease' },
  header:           { marginBottom: '28px' },
  title:            { fontSize: '26px', fontWeight: '700', color: '#1e293b' },
  subtitle:         { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  layout:           { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' },
  formCard:         { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  formTitle:        { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' },
  form:             { display: 'flex', flexDirection: 'column', gap: '16px' },
  field:            { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:            { fontSize: '13px', fontWeight: '500', color: '#374151' },
  input:            { padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
  rangeLabels:      { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '2px' },
  error:            { backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '13px' },
  submitBtn:        { padding: '12px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600' },
  quoteCard:        { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  quoteHeader:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  quoteTitle:       { fontSize: '16px', fontWeight: '600', color: '#1e293b' },
  quoteBadge:       { fontSize: '11px', padding: '3px 10px', borderRadius: '20px', backgroundColor: '#d1fae5', color: '#065f46' },
  quoteBig:         { textAlign: 'center', padding: '20px 0', borderBottom: '1px solid #f1f5f9', marginBottom: '16px' },
  quoteBigLabel:    { fontSize: '13px', color: '#64748b', marginBottom: '4px' },
  quoteBigValue:    { fontSize: '36px', fontWeight: '700', color: '#4f46e5' },
  quoteBigSub:      { fontSize: '12px', color: '#94a3b8', marginTop: '4px' },
  breakdown:        { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
  breakdownRow:     { display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: '1px solid #f8fafc' },
  breakdownLabel:   { color: '#64748b' },
  breakdownValue:   { fontSize: '13px' },
  profitRow:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' },
  profitBox:        { backgroundColor: '#f8fafc', borderRadius: '8px', padding: '12px', textAlign: 'center' },
  profitLabel:      { fontSize: '11px', color: '#94a3b8', marginBottom: '4px' },
  profitValue:      { fontSize: '20px', fontWeight: '700' },
  materialNote:     { fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px' },
  infoCard:         { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  infoTitle:        { fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' },
  infoGrid:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  infoItem:         { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  infoIcon:         { fontSize: '22px', flexShrink: 0 },
  infoItemTitle:    { fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' },
  infoItemDesc:     { fontSize: '12px', color: '#64748b', lineHeight: '1.5' },
}