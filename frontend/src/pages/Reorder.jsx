import { useState, useEffect } from 'react'
import api from '../api/axios'

const URGENCY_CONFIG = {
  critical: { bg: '#fef2f2', color: '#dc2626', border: '#ef4444', label: '🚨 Critical',  badgeBg: '#fee2e2' },
  high:     { bg: '#fffbeb', color: '#d97706', border: '#f59e0b', label: '⚠️ High',      badgeBg: '#fef3c7' },
  medium:   { bg: '#eff6ff', color: '#2563eb', border: '#3b82f6', label: '📋 Medium',    badgeBg: '#dbeafe' },
  low:      { bg: '#f0fdf4', color: '#16a34a', border: '#22c55e', label: '✅ Low',       badgeBg: '#dcfce7' },
}

export default function Reorder() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/reorder/predictions')
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load predictions')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.loadingIcon}>📦</div>
      <div style={styles.loadingText}>Calculating reorder predictions...</div>
      <div style={styles.loadingSub}>Analysing material usage rates</div>
    </div>
  )

  if (error) return (
    <div style={{ padding: '32px' }}>
      <div style={styles.errorBox}>{error}</div>
    </div>
  )

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Material Reorder Prediction</h1>
          <p style={styles.subtitle}>
            AI-powered stockout prevention based on daily usage rates
          </p>
        </div>
        <button onClick={fetchData} style={styles.refreshBtn}>
          🔄 Refresh
        </button>
      </div>

      {/* Summary KPIs */}
      <div style={styles.kpiRow}>
        {[
          { label: 'Critical Alerts',     value: data?.critical_count,     color: '#dc2626', icon: '🚨' },
          { label: 'High Priority',        value: data?.high_count,         color: '#d97706', icon: '⚠️' },
          { label: 'Materials Tracked',   value: data?.predictions?.length, color: '#4f46e5', icon: '📦' },
          { label: 'Total Reorder Cost',  value: `₹${(data?.total_reorder_cost || 0).toLocaleString('en-IN')}`, color: '#10b981', icon: '💰' },
        ].map(k => (
          <div key={k.label} style={styles.kpiCard}>
            <span style={styles.kpiIcon}>{k.icon}</span>
            <div style={{ ...styles.kpiValue, color: k.color }}>{k.value ?? 0}</div>
            <div style={styles.kpiLabel}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      {data?.insights?.length > 0 && (
        <div style={styles.insightsCard}>
          <h3 style={styles.sectionTitle}>🤖 Reorder Recommendations</h3>
          <div style={styles.insightsList}>
            {data.insights.map((insight, i) => {
              const cfg = URGENCY_CONFIG[insight.type] || URGENCY_CONFIG.low
              return (
                <div key={i} style={{
                  ...styles.insightItem,
                  borderLeft: `4px solid ${cfg.border}`,
                  backgroundColor: cfg.bg
                }}>
                  <span style={styles.insightIcon}>{insight.icon}</span>
                  <div>
                    <div style={{ ...styles.insightTitle, color: cfg.color }}>
                      {insight.title}
                    </div>
                    <div style={styles.insightMsg}>{insight.message}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Material Cards */}
      <div style={styles.cardsGrid}>
        {data?.predictions?.map((pred, i) => {
          const cfg = URGENCY_CONFIG[pred.urgency] || URGENCY_CONFIG.low
          const stockPct = Math.min(100, (pred.days_remaining / 60) * 100)

          return (
            <div key={i} style={{
              ...styles.materialCard,
              borderTop: `4px solid ${cfg.border}`
            }}>
              {/* Card header */}
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.materialName}>{pred.material}</h3>
                  <span style={{
                    ...styles.urgencyBadge,
                    backgroundColor: cfg.badgeBg,
                    color: cfg.color
                  }}>
                    {cfg.label}
                  </span>
                </div>
                <div style={styles.daysBox}>
                  <div style={{ ...styles.daysNumber, color: cfg.color }}>
                    {pred.days_remaining}
                  </div>
                  <div style={styles.daysLabel}>days left</div>
                </div>
              </div>

              {/* Stock level bar */}
              <div style={styles.stockSection}>
                <div style={styles.stockHeader}>
                  <span style={styles.stockLabel}>Stock Level</span>
                  <span style={styles.stockValue}>{pred.current_stock_tons} tons</span>
                </div>
                <div style={styles.stockBarBg}>
                  <div style={{
                    ...styles.stockBarFill,
                    width: `${stockPct}%`,
                    backgroundColor: cfg.border
                  }} />
                </div>
              </div>

              {/* Details grid */}
              <div style={styles.detailsGrid}>
                {[
                  { label: 'Usage/day',        value: `${pred.usage_per_day_tons} tons` },
                  { label: 'Reorder date',     value: new Date(pred.reorder_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) },
                  { label: 'Stockout date',    value: new Date(pred.stockout_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) },
                  { label: 'Reorder qty',      value: `${pred.reorder_quantity} tons` },
                  { label: 'Price/ton',        value: `₹${pred.price_per_ton?.toLocaleString('en-IN')}` },
                  { label: 'Reorder cost',     value: `₹${pred.reorder_cost?.toLocaleString('en-IN')}` },
                ].map(row => (
                  <div key={row.label} style={styles.detailRow}>
                    <span style={styles.detailLabel}>{row.label}</span>
                    <span style={styles.detailValue}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Best supplier */}
              <div style={styles.supplierBox}>
                <div style={styles.supplierLabel}>Best Supplier</div>
                <div style={styles.supplierName}>{pred.best_supplier}</div>
                <div style={styles.supplierReliability}>
                  <div style={styles.reliabilityBg}>
                    <div style={{
                      ...styles.reliabilityFill,
                      width: `${pred.supplier_reliability}%`,
                      backgroundColor: pred.supplier_reliability >= 85 ? '#10b981' :
                                       pred.supplier_reliability >= 70 ? '#f59e0b' : '#ef4444'
                    }} />
                  </div>
                  <span style={styles.reliabilityText}>
                    {pred.supplier_reliability}% reliability
                  </span>
                </div>
              </div>

              {/* Action button */}
              <button
                style={{
                  ...styles.actionBtn,
                  backgroundColor: cfg.border,
                }}
                onClick={() => alert(`Place order for ${pred.reorder_quantity} tons of ${pred.material} from ${pred.best_supplier}.\nEstimated cost: ₹${pred.reorder_cost?.toLocaleString('en-IN')}`)}
              >
                📋 Place Reorder — ₹{pred.reorder_cost?.toLocaleString('en-IN')}
              </button>
            </div>
          )
        })}
      </div>

      {/* How it works */}
      <div style={styles.infoCard}>
        <h3 style={styles.sectionTitle}>How reorder prediction works</h3>
        <div style={styles.infoGrid}>
          {[
            { icon: '📊', title: 'Usage rate calculation',  desc: 'Analyses last 30 days of production runs to calculate average daily material consumption in tons' },
            { icon: '📅', title: 'Days remaining forecast', desc: 'Divides current stock by daily usage rate to predict exact days until stockout' },
            { icon: '⚡', title: 'Urgency classification',  desc: 'Critical (≤7 days), High (≤14 days), Medium (≤30 days), Low (>30 days) — triggers alerts accordingly' },
            { icon: '🏭', title: 'Supplier recommendation', desc: 'Selects best supplier for each material based on reliability score from your procurement database' },
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
  page:              { padding: '32px', maxWidth: '1200px', animation: 'fadeIn 0.2s ease' },
  loadingPage:       { padding: '80px 32px', textAlign: 'center' },
  loadingIcon:       { fontSize: '48px', marginBottom: '16px' },
  loadingText:       { fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' },
  loadingSub:        { fontSize: '14px', color: '#64748b' },
  errorBox:          { backgroundColor: '#fef2f2', color: '#dc2626', padding: '16px', borderRadius: '8px', fontSize: '14px' },
  header:            { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  title:             { fontSize: '26px', fontWeight: '700', color: '#1e293b' },
  subtitle:          { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  refreshBtn:        { padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
  kpiRow:            { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '20px' },
  kpiCard:           { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' },
  kpiIcon:           { fontSize: '24px' },
  kpiValue:          { fontSize: '24px', fontWeight: '700', margin: '8px 0 4px' },
  kpiLabel:          { fontSize: '12px', color: '#64748b' },
  insightsCard:      { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  sectionTitle:      { fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' },
  insightsList:      { display: 'flex', flexDirection: 'column', gap: '10px' },
  insightItem:       { padding: '12px 16px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' },
  insightIcon:       { fontSize: '20px', flexShrink: 0 },
  insightTitle:      { fontSize: '14px', fontWeight: '600', marginBottom: '4px' },
  insightMsg:        { fontSize: '13px', color: '#475569', lineHeight: '1.5' },
  cardsGrid:         { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '20px' },
  materialCard:      { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' },
  cardHeader:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  materialName:      { fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' },
  urgencyBadge:      { display: 'inline-block', fontSize: '12px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px' },
  daysBox:           { textAlign: 'center', flexShrink: 0 },
  daysNumber:        { fontSize: '32px', fontWeight: '700' },
  daysLabel:         { fontSize: '11px', color: '#94a3b8' },
  stockSection:      { display: 'flex', flexDirection: 'column', gap: '6px' },
  stockHeader:       { display: 'flex', justifyContent: 'space-between' },
  stockLabel:        { fontSize: '12px', color: '#64748b' },
  stockValue:        { fontSize: '12px', fontWeight: '500', color: '#1e293b' },
  stockBarBg:        { height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' },
  stockBarFill:      { height: '8px', borderRadius: '4px', transition: 'width 0.5s' },
  detailsGrid:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' },
  detailRow:         { display: 'flex', flexDirection: 'column', gap: '2px', padding: '6px', backgroundColor: '#f8fafc', borderRadius: '6px' },
  detailLabel:       { fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' },
  detailValue:       { fontSize: '13px', fontWeight: '500', color: '#1e293b' },
  supplierBox:       { padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' },
  supplierLabel:     { fontSize: '11px', color: '#94a3b8', marginBottom: '4px' },
  supplierName:      { fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' },
  reliabilityBg:     { height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' },
  reliabilityFill:   { height: '4px', borderRadius: '2px', transition: 'width 0.4s' },
  reliabilityText:   { fontSize: '11px', color: '#64748b' },
  actionBtn:         { padding: '10px', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  infoCard:          { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  infoGrid:          { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '14px' },
  infoItem:          { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  infoIcon:          { fontSize: '22px', flexShrink: 0 },
  infoTitle:         { fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' },
  infoDesc:          { fontSize: '12px', color: '#64748b', lineHeight: '1.5' },
}