import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import customerApi from '../../api/customerAxios'

const STATUS_CONFIG = {
  pending:       { color: '#f59e0b', bg: '#fef3c7', label: 'Pending',       icon: '⏳' },
  in_production: { color: '#3b82f6', bg: '#dbeafe', label: 'In Production', icon: '🏭' },
  dispatched:    { color: '#8b5cf6', bg: '#ede9fe', label: 'Dispatched',    icon: '🚚' },
  delivered:     { color: '#10b981', bg: '#d1fae5', label: 'Delivered',     icon: '✅' },
}

export default function CustomerDashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('customer_user') || '{}')

  useEffect(() => {
    fetchData()
    setTimeout(() => setMounted(true), 100)
  }, [])

  async function fetchData() {
    try {
      const res = await customerApi.get('/customer/dashboard')
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.loadingSpinner} />
      <p style={styles.loadingText}>Loading your dashboard...</p>
    </div>
  )

  const kpis = [
    { label: 'Total Orders',  value: data?.summary?.total_orders,  color: '#6366f1', bg: 'linear-gradient(135deg, #6366f1, #8b5cf6)', icon: '📦', sub: 'All time' },
    { label: 'In Production', value: data?.summary?.in_production, color: '#3b82f6', bg: 'linear-gradient(135deg, #3b82f6, #0891b2)', icon: '🏭', sub: 'Being made' },
    { label: 'Dispatched',    value: data?.summary?.dispatched,    color: '#8b5cf6', bg: 'linear-gradient(135deg, #8b5cf6, #ec4899)', icon: '🚚', sub: 'On the way' },
    { label: 'Delivered',     value: data?.summary?.delivered,     color: '#10b981', bg: 'linear-gradient(135deg, #10b981, #059669)', icon: '✅', sub: 'Completed' },
  ]

  const deliveryRate = data?.summary?.total_orders > 0
    ? Math.round((data.summary.delivered / data.summary.total_orders) * 100)
    : 0

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div style={styles.page}>

      {/* Hero welcome banner */}
      <div style={{
        ...styles.heroBanner,
        opacity:   mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-10px)',
        transition:'all 0.5s ease',
      }}>
        <div style={styles.heroLeft}>
          <div style={styles.heroGreeting}>
            {greeting()}, {user.name?.split(' ')[0] || 'Customer'} 👋
          </div>
          <div style={styles.heroCompany}>{user.company_name}</div>
          <div style={styles.heroSub}>
            Here's what's happening with your orders today —{' '}
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', month: 'long', day: 'numeric'
            })}
          </div>
          <div style={styles.heroBtns}>
            <button
              onClick={() => navigate('/customer/place-order')}
              style={styles.heroBtn}
            >
              🛒 Place New Order
            </button>
            <button
              onClick={() => navigate('/customer/orders')}
              style={styles.heroBtnOutline}
            >
              📦 Track Orders
            </button>
          </div>
        </div>
        <div style={styles.heroRight}>
          <div style={styles.heroIllustration}>
            <div style={styles.heroBox1}>📦</div>
            <div style={styles.heroBox2}>🏭</div>
            <div style={styles.heroBox3}>🚚</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        {kpis.map((k, i) => (
          <div key={k.label} style={{
            ...styles.kpiCard,
            opacity:   mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition:`all 0.5s ease ${i * 0.1}s`,
          }}>
            <div style={{ ...styles.kpiGradient, background: k.bg }} />
            <div style={styles.kpiContent}>
              <div style={styles.kpiTop}>
                <div style={styles.kpiIconWrap}>{k.icon}</div>
                <div style={styles.kpiSub}>{k.sub}</div>
              </div>
              <div style={styles.kpiValue}>{k.value ?? 0}</div>
              <div style={styles.kpiLabel}>{k.label}</div>
              <div style={styles.kpiBar}>
                <div style={{
                  ...styles.kpiBarFill,
                  width: `${Math.min(100, ((k.value || 0) / (data?.summary?.total_orders || 1)) * 100)}%`,
                  background: k.bg,
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div style={styles.midRow}>

        {/* Delivery rate card */}
        <div style={styles.rateCard}>
          <h3 style={styles.cardTitle}>🎯 Delivery Rate</h3>
          <div style={styles.rateCircleWrap}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="58" fill="none" stroke="#f1f5f9" strokeWidth="12" />
              <circle
                cx="70" cy="70" r="58"
                fill="none"
                stroke="url(#grad)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(deliveryRate / 100) * 364} 364`}
                transform="rotate(-90 70 70)"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <text x="70" y="65" textAnchor="middle" fontSize="28" fontWeight="800" fill="#1e293b">
                {deliveryRate}%
              </text>
              <text x="70" y="85" textAnchor="middle" fontSize="11" fill="#94a3b8">
                delivered
              </text>
            </svg>
          </div>
          <div style={styles.rateStats}>
            <div style={styles.rateStat}>
              <span style={styles.rateStatVal}>{data?.summary?.delivered ?? 0}</span>
              <span style={styles.rateStatLabel}>Delivered</span>
            </div>
            <div style={styles.rateStatDivider} />
            <div style={styles.rateStat}>
              <span style={styles.rateStatVal}>{data?.summary?.total_orders ?? 0}</span>
              <span style={styles.rateStatLabel}>Total</span>
            </div>
          </div>
        </div>

        {/* Total boxes card */}
        <div style={styles.totalBoxCard}>
          <div style={styles.totalBoxTop}>
            <h3 style={styles.cardTitle}>📊 Total Boxes Ordered</h3>
            <div style={styles.totalBoxBadge}>All time</div>
          </div>
          <div style={styles.totalBoxValue}>
            {data?.summary?.total_quantity?.toLocaleString() ?? 0}
          </div>
          <div style={styles.totalBoxLabel}>boxes manufactured for you</div>
          <div style={styles.totalBoxBar}>
            {[
              { label: 'Pending',    val: data?.summary?.pending,       color: '#f59e0b' },
              { label: 'Production', val: data?.summary?.in_production, color: '#3b82f6' },
              { label: 'Dispatched', val: data?.summary?.dispatched,    color: '#8b5cf6' },
              { label: 'Delivered',  val: data?.summary?.delivered,     color: '#10b981' },
            ].map(s => (
              <div
                key={s.label}
                style={{
                  ...styles.totalBoxSegment,
                  flex:            s.val || 0,
                  backgroundColor: s.color,
                  display:         (s.val || 0) === 0 ? 'none' : 'block',
                }}
                title={`${s.label}: ${s.val}`}
              />
            ))}
          </div>
          <div style={styles.totalBoxLegend}>
            {[
              { label: 'Pending',    color: '#f59e0b', val: data?.summary?.pending       },
              { label: 'Production', color: '#3b82f6', val: data?.summary?.in_production },
              { label: 'Dispatched', color: '#8b5cf6', val: data?.summary?.dispatched    },
              { label: 'Delivered',  color: '#10b981', val: data?.summary?.delivered     },
            ].map(s => (
              <div key={s.label} style={styles.legendItem}>
                <div style={{ ...styles.legendDot, backgroundColor: s.color }} />
                <span style={styles.legendText}>{s.label}: {s.val ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={styles.quickCard}>
          <h3 style={styles.cardTitle}>⚡ Quick Actions</h3>
          <div style={styles.quickList}>
            {[
              { icon: '🛒', label: 'Place New Order',  sub: 'Order custom boxes',       path: '/customer/place-order', color: '#6366f1' },
              { icon: '📦', label: 'Track Orders',     sub: 'See live status',           path: '/customer/orders',      color: '#3b82f6' },
              { icon: '📈', label: 'Order History',    sub: 'View past orders',          path: '/customer/history',     color: '#8b5cf6' },
              { icon: '👤', label: 'My Profile',       sub: 'Update your details',       path: '/customer/profile',     color: '#10b981' },
            ].map(a => (
              <div
                key={a.label}
                onClick={() => navigate(a.path)}
                style={styles.quickItem}
              >
                <div style={{ ...styles.quickIcon, backgroundColor: a.color + '15', color: a.color }}>
                  {a.icon}
                </div>
                <div style={styles.quickText}>
                  <div style={styles.quickLabel}>{a.label}</div>
                  <div style={styles.quickSub}>{a.sub}</div>
                </div>
                <div style={styles.quickArrow}>→</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div style={styles.recentCard}>
        <div style={styles.recentHeader}>
          <h3 style={styles.cardTitle}>🕐 Recent Orders</h3>
          <button
            onClick={() => navigate('/customer/orders')}
            style={styles.viewAllBtn}
          >
            View all →
          </button>
        </div>

        {!data?.recent_orders?.length ? (
          <div style={styles.emptyOrders}>
            <div style={styles.emptyIcon}>📭</div>
            <div style={styles.emptyTitle}>No orders yet</div>
            <div style={styles.emptySub}>Place your first order to get started</div>
            <button
              onClick={() => navigate('/customer/place-order')}
              style={styles.emptyBtn}
            >
              🛒 Place First Order
            </button>
          </div>
        ) : (
          <div style={styles.ordersList}>
            {data.recent_orders.map((order, i) => {
              const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              return (
                <div key={order.id} style={{
                  ...styles.orderItem,
                  opacity:   mounted ? 1 : 0,
                  transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
                  transition:`all 0.4s ease ${0.3 + i * 0.08}s`,
                }}>
                  <div style={{ ...styles.orderStatusIcon, backgroundColor: sc.bg }}>
                    {sc.icon}
                  </div>
                  <div style={styles.orderInfo}>
                    <div style={styles.orderTitle}>
                      Order #{order.id} — {order.box_type}
                    </div>
                    <div style={styles.orderMeta}>
                      {order.quantity?.toLocaleString()} boxes
                      {order.due_date && ` · Due ${new Date(order.due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`}
                    </div>
                  </div>
                  <div style={styles.orderRight}>
                    <span style={{
                      ...styles.orderBadge,
                      backgroundColor: sc.bg,
                      color:           sc.color,
                    }}>
                      {sc.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.05); }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50%       { transform: translateY(-12px) rotate(5deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) rotate(5deg); }
          50%       { transform: translateY(-18px) rotate(-5deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50%       { transform: translateY(-10px) rotate(8deg); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  page:        { padding: '28px', maxWidth: '1200px', backgroundColor: '#f0f9ff', minHeight: '100vh' },
  loadingPage: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' },
  loadingSpinner: { width: '40px', height: '40px', border: '3px solid #dbeafe', borderTop: '3px solid #1d4ed8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: '#64748b', fontSize: '14px' },

  // Hero
  heroBanner: {
    background:   'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
    borderRadius: '20px',
    padding:      '36px 40px',
    marginBottom: '24px',
    display:      'flex',
    justifyContent:'space-between',
    alignItems:   'center',
    overflow:     'hidden',
    position:     'relative',
    boxShadow:    '0 10px 40px rgba(29,78,216,0.3)',
  },
  heroLeft:     { flex: 1, position: 'relative', zIndex: 1 },
  heroGreeting: { fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '4px' },
  heroCompany:  { fontSize: '16px', color: '#93c5fd', marginBottom: '8px', fontWeight: '500' },
  heroSub:      { fontSize: '13px', color: '#bfdbfe', marginBottom: '24px', lineHeight: '1.5' },
  heroBtns:     { display: 'flex', gap: '12px' },
  heroBtn:      { padding: '10px 22px', backgroundColor: '#fff', color: '#1d4ed8', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
  heroBtnOutline:{ padding: '10px 22px', backgroundColor: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  heroRight:    { flexShrink: 0, position: 'relative', zIndex: 1 },
  heroIllustration: { position: 'relative', width: '140px', height: '100px' },
  heroBox1:     { position: 'absolute', fontSize: '52px', left: '0', top: '0', animation: 'float1 3s ease-in-out infinite' },
  heroBox2:     { position: 'absolute', fontSize: '40px', right: '0', top: '10px', animation: 'float2 3.5s ease-in-out infinite' },
  heroBox3:     { position: 'absolute', fontSize: '36px', left: '30px', bottom: '0', animation: 'float3 4s ease-in-out infinite' },

  // KPI
  kpiGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '20px' },
  kpiCard:    { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'relative', cursor: 'default' },
  kpiGradient:{ height: '4px', width: '100%' },
  kpiContent: { padding: '18px' },
  kpiTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  kpiIconWrap:{ fontSize: '24px' },
  kpiSub:     { fontSize: '10px', color: '#94a3b8', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' },
  kpiValue:   { fontSize: '32px', fontWeight: '800', color: '#1e293b', marginBottom: '2px' },
  kpiLabel:   { fontSize: '13px', color: '#64748b', marginBottom: '10px' },
  kpiBar:     { height: '4px', backgroundColor: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' },
  kpiBarFill: { height: '4px', borderRadius: '2px', transition: 'width 0.8s ease' },

  // Middle row
  midRow:         { display: 'grid', gridTemplateColumns: '200px 1fr 220px', gap: '16px', marginBottom: '20px' },

  // Rate card
  rateCard:       { backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  cardTitle:      { fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: 0 },
  rateCircleWrap: { margin: '4px 0' },
  rateStats:      { display: 'flex', gap: '16px', alignItems: 'center' },
  rateStat:       { textAlign: 'center' },
  rateStatVal:    { display: 'block', fontSize: '18px', fontWeight: '700', color: '#1e293b' },
  rateStatLabel:  { fontSize: '11px', color: '#94a3b8' },
  rateStatDivider:{ width: '1px', height: '28px', backgroundColor: '#e2e8f0' },

  // Total box card
  totalBoxCard:   { backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  totalBoxTop:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  totalBoxBadge:  { fontSize: '11px', backgroundColor: '#f0f9ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' },
  totalBoxValue:  { fontSize: '44px', fontWeight: '800', color: '#1d4ed8', lineHeight: 1 },
  totalBoxLabel:  { fontSize: '13px', color: '#64748b', marginBottom: '16px', marginTop: '4px' },
  totalBoxBar:    { height: '10px', borderRadius: '5px', overflow: 'hidden', display: 'flex', gap: '2px', marginBottom: '12px' },
  totalBoxSegment:{ borderRadius: '5px', minWidth: '4px', transition: 'flex 0.5s ease' },
  totalBoxLegend: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  legendItem:     { display: 'flex', alignItems: 'center', gap: '5px' },
  legendDot:      { width: '8px', height: '8px', borderRadius: '50%' },
  legendText:     { fontSize: '11px', color: '#64748b' },

  // Quick actions
  quickCard:  { backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  quickList:  { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' },
  quickItem:  { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.15s', backgroundColor: '#f8fafc' },
  quickIcon:  { width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 },
  quickText:  { flex: 1 },
  quickLabel: { fontSize: '13px', fontWeight: '600', color: '#1e293b' },
  quickSub:   { fontSize: '11px', color: '#94a3b8' },
  quickArrow: { fontSize: '14px', color: '#94a3b8' },

  // Recent orders
  recentCard:   { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  recentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  viewAllBtn:   { fontSize: '13px', color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' },
  emptyOrders:  { padding: '40px', textAlign: 'center' },
  emptyIcon:    { fontSize: '48px', marginBottom: '12px' },
  emptyTitle:   { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' },
  emptySub:     { fontSize: '13px', color: '#94a3b8', marginBottom: '16px' },
  emptyBtn:     { padding: '10px 24px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  ordersList:   { display: 'flex', flexDirection: 'column', gap: '8px' },
  orderItem:    { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '12px', transition: 'all 0.3s ease' },
  orderStatusIcon:{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 },
  orderInfo:    { flex: 1 },
  orderTitle:   { fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '3px' },
  orderMeta:    { fontSize: '12px', color: '#94a3b8' },
  orderRight:   { flexShrink: 0 },
  orderBadge:   { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
}