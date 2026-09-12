import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import api from '../api/axios'

const SEGMENT_COLORS = {
  VIP:        { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  Regular:    { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  Occasional: { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
}

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#94a3b8']

export default function Customers() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const res = await api.get('/customers/analytics')
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ padding: '32px', color: '#64748b' }}>
      Loading customer analytics...
    </div>
  )

  const filtered = (data?.clients || [])
    .filter(c => filter === 'all' || c.segment === filter)
    .filter(c => c.client_name.toLowerCase().includes(search.toLowerCase()))

  const pieData = [
    { name: 'VIP',        value: data?.segments?.vip        || 0 },
    { name: 'Regular',    value: data?.segments?.regular    || 0 },
    { name: 'Occasional', value: data?.segments?.occasional || 0 },
  ].filter(d => d.value > 0)

  const topChart = [...(data?.clients || [])]
    .slice(0, 8)
    .map(c => ({ name: c.client_name.split(' ')[0], orders: c.total_orders, quantity: c.total_quantity }))

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Customer Analytics</h1>
          <p style={styles.subtitle}>
            {data?.total_clients} clients — avg {data?.avg_orders_per_client} orders per client
          </p>
        </div>
        <button onClick={fetchData} style={styles.refreshBtn}>
          🔄 Refresh
        </button>
      </div>

      {/* Segment KPI cards */}
      <div style={styles.kpiRow}>
        {[
          { label: 'Total Clients',     value: data?.total_clients,        color: '#4f46e5', icon: '👥' },
          { label: 'VIP Clients',       value: data?.segments?.vip,        color: '#f59e0b', icon: '🏆' },
          { label: 'Regular Clients',   value: data?.segments?.regular,    color: '#3b82f6', icon: '⭐' },
          { label: 'Occasional',        value: data?.segments?.occasional, color: '#94a3b8', icon: '🔔' },
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
          <h3 style={styles.sectionTitle}>💡 Customer Insights</h3>
          <div style={styles.insightsList}>
            {data.insights.map((insight, i) => (
              <div key={i} style={styles.insightItem}>
                <span style={styles.insightIcon}>{insight.icon}</span>
                <div>
                  <div style={styles.insightTitle}>{insight.title}</div>
                  <div style={styles.insightMsg}>{insight.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts row */}
      <div style={styles.chartsRow}>
        {/* Top clients bar chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📦 Top Clients by Orders</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n) => [v.toLocaleString(), n === 'orders' ? 'Orders' : 'Boxes']} />
              <Bar dataKey="orders" fill="#4f46e5" radius={[4,4,0,0]} name="orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Segment pie chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>🎯 Client Segments</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={true}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter and search */}
      <div style={styles.filterRow}>
        <input
          style={styles.searchInput}
          placeholder="🔍 Search client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={styles.filterBtns}>
          {['all', 'VIP', 'Regular', 'Occasional'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterBtn,
                backgroundColor: filter === f ? '#4f46e5' : '#fff',
                color:           filter === f ? '#fff'    : '#64748b',
                border:          filter === f ? 'none'    : '1px solid #e2e8f0',
              }}
            >
              {f === 'all' ? 'All' : f}
              <span style={{
                ...styles.filterCount,
                backgroundColor: filter === f ? 'rgba(255,255,255,0.2)' : '#f1f5f9'
              }}>
                {f === 'all'
                  ? data?.total_clients
                  : data?.segments?.[f.toLowerCase()] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Clients table */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Client</th>
              <th style={styles.th}>Segment</th>
              <th style={styles.th}>Total Orders</th>
              <th style={styles.th}>Total Boxes</th>
              <th style={styles.th}>Avg Order Size</th>
              <th style={styles.th}>Preferred Box</th>
              <th style={styles.th}>Delivery Rate</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client, i) => {
              const sc = SEGMENT_COLORS[client.segment] || {}
              return (
                <tr key={client.client_name} style={{
                  ...styles.tr,
                  backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc'
                }}>
                  <td style={{ ...styles.td, fontWeight: '600' }}>
                    {client.client_name}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: sc.bg,
                      color: sc.color
                    }}>
                      {client.segment === 'VIP' ? '🏆' :
                       client.segment === 'Regular' ? '⭐' : '🔔'} {client.segment}
                    </span>
                  </td>
                  <td style={{ ...styles.td, fontWeight: '600' }}>
                    {client.total_orders}
                  </td>
                  <td style={styles.td}>
                    {client.total_quantity.toLocaleString()}
                  </td>
                  <td style={styles.td}>
                    {client.avg_order_size.toLocaleString()}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.boxTag}>{client.preferred_box}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.loyaltyRow}>
                      <div style={styles.loyaltyBg}>
                        <div style={{
                          ...styles.loyaltyFill,
                          width: `${client.loyalty_score}%`,
                          backgroundColor:
                            client.loyalty_score >= 80 ? '#10b981' :
                            client.loyalty_score >= 50 ? '#f59e0b' : '#ef4444'
                        }} />
                      </div>
                      <span style={styles.loyaltyText}>
                        {client.loyalty_score}%
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={styles.empty}>No clients found.</div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page:         { padding: '32px', maxWidth: '1200px', animation: 'fadeIn 0.2s ease' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  title:        { fontSize: '26px', fontWeight: '700', color: '#1e293b' },
  subtitle:     { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  refreshBtn:   { padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
  kpiRow:       { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '20px' },
  kpiCard:      { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' },
  kpiIcon:      { fontSize: '24px' },
  kpiValue:     { fontSize: '28px', fontWeight: '700', margin: '8px 0 4px' },
  kpiLabel:     { fontSize: '12px', color: '#64748b' },
  insightsCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' },
  insightsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  insightItem:  { display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px' },
  insightIcon:  { fontSize: '20px', flexShrink: 0 },
  insightTitle: { fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' },
  insightMsg:   { fontSize: '12px', color: '#64748b', lineHeight: '1.5' },
  chartsRow:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  chartCard:    { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  chartTitle:   { fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '14px' },
  filterRow:    { display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' },
  searchInput:  { padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', width: '220px' },
  filterBtns:   { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  filterBtn:    { padding: '7px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  filterCount:  { fontSize: '11px', padding: '1px 6px', borderRadius: '10px', fontWeight: '600' },
  tableCard:    { backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  thead:        { backgroundColor: '#f8fafc' },
  th:           { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
  tr:           { borderBottom: '1px solid #f1f5f9' },
  td:           { padding: '11px 14px', fontSize: '14px', color: '#1e293b' },
  badge:        { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  boxTag:       { display: 'inline-block', padding: '2px 8px', backgroundColor: '#f1f5f9', borderRadius: '6px', fontSize: '12px', color: '#475569' },
  loyaltyRow:   { display: 'flex', alignItems: 'center', gap: '8px' },
  loyaltyBg:    { flex: 1, height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' },
  loyaltyFill:  { height: '6px', borderRadius: '3px', transition: 'width 0.4s' },
  loyaltyText:  { fontSize: '12px', color: '#64748b', width: '36px' },
  empty:        { padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' },
}