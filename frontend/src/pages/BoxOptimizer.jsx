import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'

export default function BoxOptimizer() {
  const [sheetSizes, setSheetSizes] = useState([])
  const [form, setForm]             = useState({
    box_width:  '',
    box_height: '',
    quantity:   '',
    sheet_size: ''
  })
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const canvasRef             = useRef(null)

  useEffect(() => {
    api.get('/boxoptimizer/sheet-sizes')
       .then(res => {
         setSheetSizes(res.data)
         setForm(f => ({ ...f, sheet_size: res.data[2] }))
       })
       .catch(console.error)
  }, [])

  useEffect(() => {
    if (result) drawLayout()
  }, [result])

  async function handleOptimize(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await api.post('/boxoptimizer/optimize', {
        box_width:  parseFloat(form.box_width),
        box_height: parseFloat(form.box_height),
        quantity:   parseInt(form.quantity),
        sheet_size: form.sheet_size,
      })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Optimization failed')
    } finally {
      setLoading(false)
    }
  }

  function drawLayout() {
    const canvas = canvasRef.current
    if (!canvas || !result) return

    const ctx     = canvas.getContext('2d')
    const padding = 20
    const canvasW = canvas.width  - padding * 2
    const canvasH = canvas.height - padding * 2
    const scaleX  = canvasW / result.sheet_width
    const scaleY  = canvasH / result.sheet_height
    const scale   = Math.min(scaleX, scaleY)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#f1f5f9'
    ctx.fillRect(padding, padding, result.sheet_width * scale, result.sheet_height * scale)

    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth   = 2
    ctx.strokeRect(padding, padding, result.sheet_width * scale, result.sheet_height * scale)

    const colors = ['#4f46e5', '#7c3aed', '#0891b2', '#0d9488']
    result.positions.forEach((pos, i) => {
      const x = padding + pos.x * scale
      const y = padding + pos.y * scale
      const w = pos.w * scale - 1
      const h = pos.h * scale - 1

      ctx.fillStyle   = colors[Math.floor(i / result.cols) % colors.length] + '30'
      ctx.fillRect(x, y, w, h)
      ctx.strokeStyle = colors[Math.floor(i / result.cols) % colors.length]
      ctx.lineWidth   = 1
      ctx.strokeRect(x, y, w, h)
    })

    ctx.fillStyle = '#64748b'
    ctx.font      = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(
      `${result.sheet_width} cm`,
      padding + (result.sheet_width * scale) / 2,
      padding + result.sheet_height * scale + 14
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Box Optimizer</h1>
          <p style={styles.subtitle}>
            Calculate optimal nesting of box blanks on cardboard sheets
          </p>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Input Form */}
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Box & Sheet Parameters</h3>

          <form onSubmit={handleOptimize} style={styles.form}>
            <div style={styles.sectionLabel}>Box Dimensions (cm)</div>
            <div style={styles.dimRow}>
              <div style={styles.field}>
                <label style={styles.label}>Width *</label>
                <input
                  style={styles.input}
                  type="number" step="0.1" placeholder="e.g. 40"
                  value={form.box_width}
                  onChange={e => setForm({ ...form, box_width: e.target.value })}
                  required
                />
              </div>
              <div style={styles.dimX}>×</div>
              <div style={styles.field}>
                <label style={styles.label}>Height *</label>
                <input
                  style={styles.input}
                  type="number" step="0.1" placeholder="e.g. 30"
                  value={form.box_height}
                  onChange={e => setForm({ ...form, box_height: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Order Quantity *</label>
              <input
                style={styles.input}
                type="number" placeholder="e.g. 500"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Sheet Size *</label>
              <select
                style={styles.input}
                value={form.sheet_size}
                onChange={e => setForm({ ...form, sheet_size: e.target.value })}
              >
                {sheetSizes.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Calculating...' : '⚡ Optimize Layout'}
            </button>
          </form>
          {/* ↑ form closes HERE — presets are now outside the form */}

          {/* Quick presets */}
          <div style={styles.presets}>
            <div style={styles.presetsLabel}>Quick presets:</div>
            <div style={styles.presetRow}>
              {[
                { label: 'Small mailer',  w: 25, h: 20 },
                { label: 'Standard box',  w: 40, h: 30 },
                { label: 'Large carton',  w: 60, h: 45 },
                { label: 'Shipping box',  w: 50, h: 35 },
              ].map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setForm(f => ({
                    ...f, box_width: p.w, box_height: p.h
                  }))}
                  style={styles.presetBtn}
                >
                  {p.label}<br/>
                  <span style={styles.presetDim}>{p.w}×{p.h} cm</span>
                </button>
              ))}
            </div>
          </div>

        </div>
        {/* ↑ formCard closes here */}

        {/* Results Panel */}
        <div style={styles.resultsPanel}>
          {!result && !loading && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📐</div>
              <div style={styles.emptyText}>
                Enter box dimensions and click Optimize to see the nesting layout
              </div>
            </div>
          )}

          {loading && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>⚡</div>
              <div style={styles.emptyText}>Calculating optimal layout...</div>
            </div>
          )}

          {result && (
            <>
              {/* KPI summary */}
              <div style={styles.kpiRow}>
                {[
                  { label: 'Boxes / Sheet',  value: result.boxes_per_sheet,       color: '#4f46e5', icon: '📦' },
                  { label: 'Sheets Needed',  value: result.sheets_needed,         color: '#10b981', icon: '📋' },
                  { label: 'Utilization',    value: `${result.utilization_pct}%`, color: '#f59e0b', icon: '📊' },
                  { label: 'Material Waste', value: `${result.waste_pct}%`,       color: '#ef4444', icon: '♻️' },
                ].map(k => (
                  <div key={k.label} style={styles.kpiCard}>
                    <span style={styles.kpiIcon}>{k.icon}</span>
                    <div style={{ ...styles.kpiValue, color: k.color }}>{k.value}</div>
                    <div style={styles.kpiLabel}>{k.label}</div>
                  </div>
                ))}
              </div>

              {/* Layout details */}
              <div style={styles.detailCard}>
                <h3 style={styles.detailTitle}>Layout Details</h3>
                <div style={styles.detailGrid}>
                  {[
                    { label: 'Arrangement',     value: `${result.cols} cols × ${result.rows} rows` },
                    { label: 'Box orientation', value: result.rotated ? 'Rotated 90°' : 'Original' },
                    { label: 'Sheet size',      value: `${result.sheet_width} × ${result.sheet_height} cm` },
                    { label: 'Box size',        value: `${result.box_width} × ${result.box_height} cm` },
                    { label: 'Total box area',  value: `${result.total_box_area?.toLocaleString()} cm²` },
                    { label: 'Total sheet area',value: `${result.total_sheet_area?.toLocaleString()} cm²` },
                    { label: 'Wasted area',     value: `${result.total_waste_area?.toLocaleString()} cm²` },
                    { label: 'Order quantity',  value: `${result.quantity?.toLocaleString()} boxes` },
                  ].map(row => (
                    <div key={row.label} style={styles.detailRow}>
                      <span style={styles.detailLabel}>{row.label}</span>
                      <span style={styles.detailValue}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Utilization bar */}
              <div style={styles.utilizationCard}>
                <div style={styles.utilizationHeader}>
                  <span style={styles.utilizationLabel}>Material Utilization</span>
                  <span style={{
                    ...styles.utilizationPct,
                    color: result.utilization_pct >= 80 ? '#10b981' :
                           result.utilization_pct >= 60 ? '#f59e0b' : '#ef4444'
                  }}>
                    {result.utilization_pct}%
                  </span>
                </div>
                <div style={styles.utilizationBg}>
                  <div style={{
                    ...styles.utilizationFill,
                    width: `${result.utilization_pct}%`,
                    backgroundColor:
                      result.utilization_pct >= 80 ? '#10b981' :
                      result.utilization_pct >= 60 ? '#f59e0b' : '#ef4444'
                  }} />
                </div>
                <div style={styles.utilizationNote}>
                  {result.utilization_pct >= 80
                    ? '✅ Excellent utilization — minimal material waste'
                    : result.utilization_pct >= 60
                    ? '⚠️ Moderate utilization — consider a different sheet size'
                    : '❌ Poor utilization — try a smaller sheet or different box size'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Canvas visualisation */}
      {result && (
        <div style={styles.canvasCard}>
          <div style={styles.canvasHeader}>
            <h3 style={styles.chartTitle}>📐 Sheet Layout Visualisation</h3>
            <p style={styles.chartSub}>
              Showing {Math.min(result.positions.length, 50)} of {result.boxes_per_sheet} boxes per sheet
              ({result.cols} cols × {result.rows} rows
              {result.rotated ? ', boxes rotated 90°' : ''})
            </p>
          </div>
          <canvas
            ref={canvasRef}
            width={700}
            height={380}
            style={styles.canvas}
          />
        </div>
      )}

      {/* How it works */}
      <div style={styles.infoCard}>
        <h3 style={styles.chartTitle}>How the optimizer works</h3>
        <div style={styles.infoGrid}>
          {[
            { icon: '📐', title: 'Dual orientation',  desc: 'Tests both original and 90° rotated placement, picks whichever fits more boxes per sheet' },
            { icon: '⚡', title: 'Grid nesting',      desc: 'Arranges boxes in a regular grid with 1cm margin between each box to account for die-cutting tolerance' },
            { icon: '📊', title: 'Utilization score', desc: 'Calculates the percentage of sheet area used by boxes vs wasted. Higher is better — aim for 80%+' },
            { icon: '💰', title: 'Sheet count',       desc: 'Divides total quantity by boxes-per-sheet and rounds up to give the exact number of sheets to cut' },
          ].map(item => (
            <div key={item.title} style={styles.infoItem}>
              <span style={styles.infoIcon}>{item.icon}</span>
              <div>
                <div style={styles.infoTitle}>{item.title}</div>
                <div style={styles.infoDesc}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '32px', maxWidth: '1200px', animation: 'fadeIn 0.2s ease' },
  header:            { marginBottom: '24px' },
  title:             { fontSize: '26px', fontWeight: '700', color: '#1e293b' },
  subtitle:          { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  layout:            { display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', marginBottom: '20px' },
  formCard:          { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', alignSelf: 'start' },
  formTitle:         { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' },
  form:              { display: 'flex', flexDirection: 'column', gap: '14px' },
  sectionLabel:      { fontSize: '12px', fontWeight: '500', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' },
  dimRow:            { display: 'flex', alignItems: 'flex-end', gap: '8px' },
  dimX:              { fontSize: '18px', color: '#94a3b8', paddingBottom: '8px', flexShrink: 0 },
  field:             { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  label:             { fontSize: '13px', fontWeight: '500', color: '#374151' },
  input:             { padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
  error:             { backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '13px' },
  submitBtn:         { padding: '12px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  presets:           { marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' },
  presetsLabel:      { fontSize: '12px', color: '#94a3b8', marginBottom: '8px' },
  presetRow:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' },
  presetBtn:         { padding: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', color: '#475569', cursor: 'pointer', textAlign: 'center', lineHeight: '1.4' },
  presetDim:         { fontSize: '11px', color: '#94a3b8' },
  resultsPanel:      { display: 'flex', flexDirection: 'column', gap: '16px' },
  emptyState:        { backgroundColor: '#fff', borderRadius: '12px', padding: '60px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center', flex: 1 },
  emptyIcon:         { fontSize: '48px', marginBottom: '12px' },
  emptyText:         { fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', maxWidth: '280px', margin: '0 auto' },
  kpiRow:            { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' },
  kpiCard:           { backgroundColor: '#fff', borderRadius: '10px', padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' },
  kpiIcon:           { fontSize: '20px' },
  kpiValue:          { fontSize: '22px', fontWeight: '700', margin: '6px 0 2px' },
  kpiLabel:          { fontSize: '11px', color: '#64748b' },
  detailCard:        { backgroundColor: '#fff', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  detailTitle:       { fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' },
  detailGrid:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' },
  detailRow:         { display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f8fafc', fontSize: '13px' },
  detailLabel:       { color: '#64748b' },
  detailValue:       { fontWeight: '500', color: '#1e293b' },
  utilizationCard:   { backgroundColor: '#fff', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  utilizationHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  utilizationLabel:  { fontSize: '13px', color: '#64748b' },
  utilizationPct:    { fontSize: '16px', fontWeight: '700' },
  utilizationBg:     { height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' },
  utilizationFill:   { height: '8px', borderRadius: '4px', transition: 'width 0.5s ease' },
  utilizationNote:   { fontSize: '12px', color: '#64748b' },
  canvasCard:        { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  canvasHeader:      { marginBottom: '16px' },
  chartTitle:        { fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' },
  chartSub:          { fontSize: '12px', color: '#94a3b8' },
  canvas:            { border: '1px solid #e2e8f0', borderRadius: '8px', width: '100%', maxWidth: '700px', display: 'block' },
  infoCard:          { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  infoGrid:          { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '14px' },
  infoItem:          { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  infoIcon:          { fontSize: '22px', flexShrink: 0 },
  infoTitle:         { fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' },
  infoDesc:          { fontSize: '12px', color: '#64748b', lineHeight: '1.5' },
}