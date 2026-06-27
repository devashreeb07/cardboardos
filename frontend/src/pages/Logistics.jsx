import { useState, useEffect } from 'react'
import api from '../api/axios'

const STATUS_COLORS = {
  pending:       { bg: '#fef3c7', color: '#92400e' },
  in_production: { bg: '#dbeafe', color: '#1e40af' },
  dispatched:    { bg: '#ede9fe', color: '#5b21b6' },
  delivered:     { bg: '#d1fae5', color: '#065f46' },
}

const STATUS_LABELS = {
  pending:       'Pending',
  in_production: 'In Production',
  dispatched:    'Dispatched',
  delivered:     'Delivered',
}

export default function Logistics() {
  const [summary, setSummary]   = useState(null)
  const [active, setActive]     = useState([])
  const [delivered, setDelivered] = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('active')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const [sumRes, activeRes, deliveredRes] = await Promise.all([
        api.get('/logistics/summary'),
        api.get('/logistics/active'),
        api.get('/logistics/delivered'),
      ])
      setSummary(sumRes.data)
      setActive(activeRes.data)
      setDelivered(deliveredRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function advanceStatus(order) {
    const next = {
      pending: 'in_production',
      in_production: 'dispatched',
      dispatched: 'delivered'
    }[order.status]
    if (!next) return
    try {
      await api.patch(`/orders/${order.id}/status`, { status: next })
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update')
    }
  }

  if (loading) return <div style={{ padding: '32px', color: '#64748b' }}>Loading...</div>

  const displayOrders = tab === 'active' ? active : delivered

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Logistics</h1>
          <p style={styles.subtitle}>Order tracking and dispatch management</p>
        </div>
      </div>

      {/* KPI Summary */}
      {summary && (
        <div style={styles.kpiRow}>
          {[
            { label: 'Total Orders',    value: summary.total,         color: '#4f46e5', icon: '📦' },
            { label: 'In Production',   value: summary.in_production, color: '#3b82f6', icon: '🏭' },
            { label: 'Dispatched',      value: summary.dispatched,    color: '#8b5cf6', icon: '🚚' },
            { label: 'Delivered',       value: summary.delivered,     color: '#10b981', icon: '✅' },
          ].map(k => (
            <div key={k.label} style={styles.kpiCard}>
              <span style={styles.kpiIcon}>{k.icon}</span>
              <div style={{ ...styles.kpiValue, color: k.color }}>{k.value}</div>
              <div style={styles.kpiLabel}>{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Delivery rate */}
      {summary && (
        <div style={styles.rateCard}>
          <div style={styles.rateLeft}>
            <div style={styles.rateTitle}>Delivery Rate</div>
            <div style={styles.rateValue}>
              {summary.total > 0
                ? Math.round((summary.delivered / summary.total) * 100)
                : 0}%
            </div>
            <div style={styles.rateSub}>
              {summary.delivered} of {summary.total} orders delivered
            </div>
          </div>
          <div style={styles.rateBarWrap}>
            <div style={styles.rateBarBg}>
              <div style={{
                ...styles.rateBarFill,
                width: `${summary.total > 0 ? (summary.delivered / summary.total) * 100 : 0}%`
              }} />
            </div>
            <div style={styles.rateStages}>
              {[
                { label: 'Pending',     value: summary.pending,       color: '#f59e0b' },
                { label: 'Production',  value: summary.in_production, color: '#3b82f6' },
                { label: 'Dispatched',  value: summary.dispatched,    color: '#8b5cf6' },
                { label: 'Delivered',   value: summary.delivered,     color: '#10b981' },
              ].map(s => (
                <div key={s.label} style={styles.rateStage}>
                  <div style={{ ...styles.stageDot, backgroundColor: s.color }} />
                  <span style={styles.stageLabel}>{s.label}: {s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabRow}>
        {['active', 'delivered'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            ...styles.tabBtn,
            backgroundColor: tab === t ? '#4f46e5' : '#fff',
            color: tab === t ? '#fff' : '#64748b',
            border: tab === t ? 'none' : '1px solid #e2e8f0',
          }}>
            {t === 'active' ? `🚀 Active Orders (${active.length})` : `✅ Delivered (${delivered.length})`}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Client</th>
              <th style={styles.th}>Box Type</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Due Date</th>
              {tab === 'active' && <th style={styles.th}>Action</th>}
            </tr>
          </thead>
          <tbody>
            {displayOrders.map((o, i) => {
              const sc = STATUS_COLORS[o.status] || {}
              const isOverdue = o.due_date && new Date(o.due_date) < new Date()
              return (
                <tr key={o.id} style={{
                  ...styles.tr,
                  backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc'
                }}>
                  <td style={styles.td}>#{o.id}</td>
                  <td style={{ ...styles.td, fontWeight: '500' }}>{o.client_name}</td>
                  <td style={styles.td}>{o.box_type || '—'}</td>
                  <td style={styles.td}>{o.quantity?.toLocaleString()}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, backgroundColor: sc.bg, color: sc.color }}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </td>
                  <td style={{
                    ...styles.td,
                    color: isOverdue ? '#ef4444' : '#1e293b',
                    fontWeight: isOverdue ? '600' : '400'
                  }}>
                    {o.due_date
                      ? new Date(o.due_date).toLocaleDateString('en-IN')
                      : '—'}
                    {isOverdue && ' ⚠️'}
                  </td>
                  {tab === 'active' && (
                    <td style={styles.td}>
                      <button
                        onClick={() => advanceStatus(o)}
                        style={styles.advanceBtn}
                      >
                        Advance →
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
        {displayOrders.length === 0 && (
          <div style={styles.empty}>No orders in this category.</div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '32px', maxWidth: '1200px', animation: 'fadeIn 0.2s ease' },
  header:       { marginBottom: '24px' },
  title:        { fontSize: '26px', fontWeight: '700', color: '#1e293b' },
  subtitle:     { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  kpiRow:       { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '20px' },
  kpiCard:      { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' },
  kpiIcon:      { fontSize: '24px' },
  kpiValue:     { fontSize: '28px', fontWeight: '700', margin: '8px 0 4px' },
  kpiLabel:     { fontSize: '12px', color: '#64748b' },
  rateCard:     { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', gap: '32px', alignItems: 'center' },
  rateLeft:     { flexShrink: 0 },
  rateTitle:    { fontSize: '13px', color: '#64748b', marginBottom: '4px' },
  rateValue:    { fontSize: '40px', fontWeight: '700', color: '#10b981' },
  rateSub:      { fontSize: '12px', color: '#94a3b8', marginTop: '4px' },
  rateBarWrap:  { flex: 1 },
  rateBarBg:    { height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' },
  rateBarFill:  { height: '8px', backgroundColor: '#10b981', borderRadius: '4px', transition: 'width 0.5s' },
  rateStages:   { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  rateStage:    { display: 'flex', alignItems: 'center', gap: '6px' },
  stageDot:     { width: '8px', height: '8px', borderRadius: '50%' },
  stageLabel:   { fontSize: '12px', color: '#64748b' },
  tabRow:       { display: 'flex', gap: '8px', marginBottom: '16px' },
  tabBtn:       { padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  tableCard:    { backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  thead:        { backgroundColor: '#f8fafc' },
  th:           { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
  tr:           { borderBottom: '1px solid #f1f5f9' },
  td:           { padding: '11px 14px', fontSize: '14px', color: '#1e293b' },
  badge:        { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  advanceBtn:   { padding: '5px 12px', backgroundColor: '#ede9fe', color: '#5b21b6', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
  empty:        { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' },
}