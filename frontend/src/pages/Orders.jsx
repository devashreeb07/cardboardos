import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  pending:       { bg: '#fef3c7', color: '#92400e' },
  in_production: { bg: '#dbeafe', color: '#1e40af' },
  dispatched:    { bg: '#ede9fe', color: '#5b21b6' },
  delivered:     { bg: '#d1fae5', color: '#065f46' },
}

const STATUS_FLOW = {
  pending:       'in_production',
  in_production: 'dispatched',
  dispatched:    'delivered',
  delivered:     null,
}

const STATUS_LABELS = {
  pending:       'Pending',
  in_production: 'In Production',
  dispatched:    'Dispatched',
  delivered:     'Delivered',
}

export default function Orders() {
  const [orders, setOrders]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [filter, setFilter]       = useState('all')
  const [form, setForm]           = useState({
    client_name: '', box_type: '', quantity: '', due_date: ''
  })

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    try {
      const res = await api.get('/orders/')
      setOrders(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
  e.preventDefault()
  try {
    await api.post('/orders/', {
      ...form,
      quantity: parseInt(form.quantity)
    })
    setForm({ client_name: '', box_type: '', quantity: '', due_date: '' })
    setShowForm(false)
    fetchOrders()
    toast.success('Order created successfully!')      // ← add this
  } catch (err) {
    toast.error(err.response?.data?.error || 'Failed to create order')  // ← add this
  }
}

  async function handleAdvanceStatus(order) {
  const next = STATUS_FLOW[order.status]
  if (!next) return
  try {
    await api.patch(`/orders/${order.id}/status`, { status: next })
    fetchOrders()
    toast.success(`Order moved to ${STATUS_LABELS[next]}`)  // ← add this
  } catch (err) {
    toast.error(err.response?.data?.error || 'Failed to update status')
  }
}

  async function handleDelete(id) {
  if (!window.confirm('Delete this order?')) return
  try {
    await api.delete(`/orders/${id}`)
    fetchOrders()
    toast.success('Order deleted')                          // ← add this
  } catch (err) {
    toast.error(err.response?.data?.error || 'Cannot delete this order')
  }
}

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter)

  if (loading) return <div style={{ padding: '32px', color: '#64748b' }}>Loading orders...</div>

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Orders</h1>
          <p style={styles.subtitle}>{orders.length} total orders</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? '✕ Cancel' : '+ New Order'}
        </button>
      </div>

      {/* Create Order Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Create New Order</h3>
          <form onSubmit={handleCreate} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Client Name *</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Amazon India"
                  value={form.client_name}
                  onChange={e => setForm({ ...form, client_name: e.target.value })}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Box Type</label>
                <select
                  style={styles.input}
                  value={form.box_type}
                  onChange={e => setForm({ ...form, box_type: e.target.value })}
                >
                  <option value="">Select type</option>
                  <option>Corrugated Box</option>
                  <option>Mailer Box</option>
                  <option>Die-cut Box</option>
                  <option>Shipping Carton</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Quantity *</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="e.g. 2000"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Due Date</label>
                <input
                  style={styles.input}
                  type="date"
                  value={form.due_date}
                  onChange={e => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" style={styles.submitBtn}>Create Order</button>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={styles.filterRow}>
        {['all', 'pending', 'in_production', 'dispatched', 'delivered'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...styles.filterBtn,
              backgroundColor: filter === f ? '#4f46e5' : '#fff',
              color: filter === f ? '#fff' : '#64748b',
              border: filter === f ? 'none' : '1px solid #e2e8f0',
            }}
          >
            {f === 'all' ? 'All' : STATUS_LABELS[f]}
            <span style={{
              ...styles.filterCount,
              backgroundColor: filter === f ? 'rgba(255,255,255,0.2)' : '#f1f5f9'
            }}>
              {f === 'all' ? orders.length : orders.filter(o => o.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div style={styles.tableCard}>
        {filtered.length === 0 ? (
          <div style={styles.empty}>No orders found for this filter.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Client</th>
                <th style={styles.th}>Box Type</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Due Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => {
                const sc = STATUS_COLORS[order.status] || {}
                const next = STATUS_FLOW[order.status]
                return (
                  <tr key={order.id} style={{
                    ...styles.tr,
                    backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc'
                  }}>
                    <td style={styles.td}>#{order.id}</td>
                    <td style={{ ...styles.td, fontWeight: '500' }}>{order.client_name}</td>
                    <td style={styles.td}>{order.box_type || '—'}</td>
                    <td style={styles.td}>{order.quantity?.toLocaleString()}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: sc.bg,
                        color: sc.color
                      }}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {order.due_date
                        ? new Date(order.due_date).toLocaleDateString('en-IN')
                        : '—'}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        {next && (
                          <button
                            onClick={() => handleAdvanceStatus(order)}
                            style={styles.advanceBtn}
                          >
                            → {STATUS_LABELS[next]}
                          </button>
                        )}
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleDelete(order.id)}
                            style={styles.deleteBtn}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
  formCard:    { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  formTitle:   { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' },
  form:        { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field:       { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:       { fontSize: '13px', fontWeight: '500', color: '#374151' },
  input:       { padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
  submitBtn:   { padding: '10px 24px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', alignSelf: 'flex-start' },
  filterRow:   { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  filterBtn:   { padding: '7px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  filterCount: { fontSize: '11px', padding: '1px 6px', borderRadius: '10px', fontWeight: '600' },
  tableCard:   { backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  thead:       { backgroundColor: '#f8fafc' },
  th:          { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
  tr:          { borderBottom: '1px solid #f1f5f9' },
  td:          { padding: '12px 16px', fontSize: '14px', color: '#1e293b' },
  badge:       { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  actions:     { display: 'flex', gap: '6px' },
  advanceBtn:  { padding: '5px 10px', backgroundColor: '#ede9fe', color: '#5b21b6', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
  deleteBtn:   { padding: '5px 10px', backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
  empty:       { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' },
}