import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import customerApi from '../../api/customerAxios'

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

export default function CustomerOrders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

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

  async function fetchOrderDetail(id) {
    try {
      const res = await customerApi.get(`/customer/orders/${id}`)
      setSelected(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter)

  if (loading) return <div style={{ padding: '32px', color: '#64748b' }}>Loading...</div>

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Orders</h1>
          <p style={styles.subtitle}>{orders.length} total orders</p>
        </div>
        <button
          onClick={() => navigate('/customer/place-order')}
          style={styles.newOrderBtn}
        >
          + New Order
        </button>
      </div>

      {/* Filter tabs */}
      <div style={styles.filterRow}>
        {['all', 'pending', 'in_production', 'dispatched', 'delivered'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            ...styles.filterBtn,
            backgroundColor: filter === f ? '#1d4ed8' : '#fff',
            color:           filter === f ? '#fff'    : '#64748b',
            border:          filter === f ? 'none'    : '1px solid #e2e8f0',
          }}>
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

      <div style={styles.layout}>
        {/* Orders list */}
        <div style={styles.ordersList}>
          {filtered.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>📭</div>
              <div>No orders in this category</div>
            </div>
          ) : (
            filtered.map(order => {
              const sc = STATUS_COLORS[order.status] || {}
              return (
                <div
                  key={order.id}
                  onClick={() => fetchOrderDetail(order.id)}
                  style={{
                    ...styles.orderCard,
                    borderLeft: selected?.id === order.id ? '4px solid #1d4ed8' : '4px solid transparent',
                    backgroundColor: selected?.id === order.id ? '#eff6ff' : '#fff',
                  }}
                >
                  <div style={styles.orderCardHeader}>
                    <span style={styles.orderId}>Order #{order.id}</span>
                    <span style={{ ...styles.badge, backgroundColor: sc.bg, color: sc.color }}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <div style={styles.orderCardBody}>
                    <span style={styles.orderBoxType}>{order.box_type}</span>
                    <span style={styles.orderQty}>{order.quantity?.toLocaleString()} boxes</span>
                  </div>
                  <div style={styles.orderCardDate}>
                    {order.due_date
                      ? `Due: ${new Date(order.due_date).toLocaleDateString('en-IN')}`
                      : `Ordered: ${new Date(order.created_at).toLocaleDateString('en-IN')}`}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Order detail panel */}
        {selected && (
          <div style={styles.detailPanel}>
            <div style={styles.detailHeader}>
              <h3 style={styles.detailTitle}>Order #{selected.id}</h3>
              <button onClick={() => setSelected(null)} style={styles.closeBtn}>✕</button>
            </div>

            {/* Status Timeline */}
            <div style={styles.timeline}>
              {selected.timeline?.map((step, i) => (
                <div key={step.status} style={styles.timelineItem}>
                  <div style={styles.timelineLeft}>
                    <div style={{
                      ...styles.timelineDot,
                      backgroundColor:
                        step.completed ? '#059669' :
                        step.current   ? '#1d4ed8' : '#e2e8f0',
                      border: step.current ? '3px solid #93c5fd' : 'none'
                    }} />
                    {i < selected.timeline.length - 1 && (
                      <div style={{
                        ...styles.timelineLine,
                        backgroundColor: step.completed ? '#059669' : '#e2e8f0'
                      }} />
                    )}
                  </div>
                  <div style={styles.timelineContent}>
                    <div style={{
                      ...styles.timelineLabel,
                      color: step.current ? '#1d4ed8' : step.completed ? '#059669' : '#94a3b8',
                      fontWeight: step.current ? '600' : '400'
                    }}>
                      {step.label}
                      {step.current && ' ← Current'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Details */}
            <div style={styles.detailGrid}>
              {[
                { label: 'Box Type',  value: selected.box_type },
                { label: 'Quantity',  value: `${selected.quantity?.toLocaleString()} boxes` },
                { label: 'Due Date',  value: selected.due_date ? new Date(selected.due_date).toLocaleDateString('en-IN') : '—' },
                { label: 'Ordered',   value: selected.created_at ? new Date(selected.created_at).toLocaleDateString('en-IN') : '—' },
              ].map(row => (
                <div key={row.label} style={styles.detailRow}>
                  <span style={styles.detailLabel}>{row.label}</span>
                  <span style={styles.detailValue}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page:            { padding: '32px', maxWidth: '1100px', animation: 'fadeIn 0.2s ease' },
  header:          { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  title:           { fontSize: '26px', fontWeight: '700', color: '#1e293b' },
  subtitle:        { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  newOrderBtn:     { padding: '10px 20px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  filterRow:       { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  filterBtn:       { padding: '7px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  filterCount:     { fontSize: '11px', padding: '1px 6px', borderRadius: '10px', fontWeight: '600' },
  layout:          { display: 'grid', gridTemplateColumns: selected => selected ? '1fr 360px' : '1fr', gap: '16px' },
  ordersList:      { display: 'flex', flexDirection: 'column', gap: '8px' },
  orderCard:       { backgroundColor: '#fff', borderRadius: '10px', padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.15s' },
  orderCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  orderId:         { fontSize: '14px', fontWeight: '600', color: '#1e293b' },
  badge:           { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  orderCardBody:   { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' },
  orderBoxType:    { fontSize: '13px', color: '#475569' },
  orderQty:        { fontSize: '13px', fontWeight: '500', color: '#1d4ed8' },
  orderCardDate:   { fontSize: '11px', color: '#94a3b8' },
  empty:           { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' },
  emptyIcon:       { fontSize: '40px', marginBottom: '8px' },
  detailPanel:     { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', alignSelf: 'start' },
  detailHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  detailTitle:     { fontSize: '16px', fontWeight: '600', color: '#1e293b' },
  closeBtn:        { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#94a3b8' },
  timeline:        { marginBottom: '20px' },
  timelineItem:    { display: 'flex', gap: '12px' },
  timelineLeft:    { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px' },
  timelineDot:     { width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0 },
  timelineLine:    { width: '2px', flex: 1, minHeight: '20px', margin: '4px 0' },
  timelineContent: { paddingBottom: '16px', flex: 1 },
  timelineLabel:   { fontSize: '13px', paddingTop: '1px' },
  detailGrid:      { display: 'flex', flexDirection: 'column', gap: '8px' },
  detailRow:       { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' },
  detailLabel:     { color: '#64748b' },
  detailValue:     { fontWeight: '500', color: '#1e293b' },
}