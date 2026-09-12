import { useState, useEffect } from 'react'
import customerApi from '../../api/customerAxios'

const STATUS_COLORS = {
  pending:       { bg: '#fef3c7', color: '#92400e' },
  in_production: { bg: '#dbeafe', color: '#1e40af' },
  dispatched:    { bg: '#ede9fe', color: '#5b21b6' },
  delivered:     { bg: '#d1fae5', color: '#065f46' },
}

export default function CustomerHistory() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    try {
      const res = await customerApi.get('/customer/orders')
      setOrders(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = orders.filter(o =>
    o.box_type?.toLowerCase().includes(search.toLowerCase()) ||
    String(o.id).includes(search)
  )

  const delivered    = orders.filter(o => o.status === 'delivered')
  const totalBoxes   = orders.reduce((sum, o) => sum + (o.quantity || 0), 0)
  const deliveryRate = orders.length > 0
    ? Math.round((delivered.length / orders.length) * 100)
    : 0

  if (loading) return <div style={{ padding: '32px', color: '#64748b' }}>Loading...</div>

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Order History</h1>
        <p style={styles.subtitle}>Complete record of all your orders</p>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        {[
          { label: 'Total Orders',   value: orders.length,               color: '#1d4ed8', icon: '📦' },
          { label: 'Delivered',      value: delivered.length,            color: '#059669', icon: '✅' },
          { label: 'Total Boxes',    value: totalBoxes.toLocaleString(), color: '#7c3aed', icon: '📊' },
          { label: 'Delivery Rate',  value: `${deliveryRate}%`,          color: '#0891b2', icon: '🎯' },
        ].map(k => (
          <div key={k.label} style={styles.statCard}>
            <span style={styles.statIcon}>{k.icon}</span>
            <div style={{ ...styles.statValue, color: k.color }}>{k.value}</div>
            <div style={styles.statLabel}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        style={styles.search}
        placeholder="🔍 Search by order ID or box type..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Full history table */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Order ID</th>
              <th style={styles.th}>Box Type</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Due Date</th>
              <th style={styles.th}>Order Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, i) => {
              const sc = STATUS_COLORS[o.status] || {}
              return (
                <tr key={o.id} style={{
                  ...styles.tr,
                  backgroundColor: i % 2 === 0 ? '#fff' : '#f0f9ff'
                }}>
                  <td style={{ ...styles.td, fontWeight: '600' }}>#{o.id}</td>
                  <td style={styles.td}>{o.box_type}</td>
                  <td style={styles.td}>{o.quantity?.toLocaleString()}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, backgroundColor: sc.bg, color: sc.color }}>
                      {o.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {o.due_date ? new Date(o.due_date).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td style={styles.td}>
                    {o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={styles.empty}>No orders found.</div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page:      { padding: '32px', maxWidth: '1100px', animation: 'fadeIn 0.2s ease' },
  header:    { marginBottom: '24px' },
  title:     { fontSize: '26px', fontWeight: '700', color: '#1e293b' },
  subtitle:  { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  statsRow:  { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' },
  statCard:  { backgroundColor: '#fff', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' },
  statIcon:  { fontSize: '22px' },
  statValue: { fontSize: '26px', fontWeight: '700', margin: '8px 0 4px' },
  statLabel: { fontSize: '12px', color: '#64748b' },
  search:    { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  tableCard: { backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table:     { width: '100%', borderCollapse: 'collapse' },
  thead:     { backgroundColor: '#f0f9ff' },
  th:        { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e0f2fe' },
  tr:        { borderBottom: '1px solid #f0f9ff' },
  td:        { padding: '11px 14px', fontSize: '14px', color: '#1e293b' },
  badge:     { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  empty:     { padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' },
}