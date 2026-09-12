import { Outlet, NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/customer/dashboard',   label: '📊 Dashboard'     },
  { path: '/customer/orders',      label: '📦 My Orders'     },
  { path: '/customer/place-order', label: '🛒 Place Order'   },
  { path: '/customer/history',     label: '📈 Order History' },
  { path: '/customer/profile',     label: '👤 My Profile'    },
]

export default function CustomerLayout() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('customer_token')
    localStorage.removeItem('customer_user')
    navigate('/customer/login')
  }

  const user = JSON.parse(localStorage.getItem('customer_user') || '{}')

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>📦</span>
          <div>
            <h2 style={styles.logoText}>CardboardOS</h2>
            <p style={styles.logoSub}>Customer Portal</p>
          </div>
        </div>

        <nav style={styles.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                ...styles.navLink,
                backgroundColor: isActive ? '#1d4ed8' : 'transparent',
                color:           isActive ? '#fff'    : '#93c5fd',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={styles.userSection}>
          <div style={styles.userAvatar}>
            {user.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div style={styles.userInfo}>
            <p style={styles.userName}>{user.name || 'Customer'}</p>
            <p style={styles.userCompany}>{user.company_name || ''}</p>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">⏻</button>
        </div>
      </aside>

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

const styles = {
  container:   { display: 'flex', minHeight: '100vh' },
  sidebar:     { width: '220px', backgroundColor: '#1e3a8a', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' },
  logo:        { padding: '20px 16px', borderBottom: '1px solid #1d4ed8', display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon:    { fontSize: '24px' },
  logoText:    { color: '#fff', fontSize: '16px', fontWeight: '700', margin: 0 },
  logoSub:     { color: '#93c5fd', fontSize: '11px', margin: 0 },
  nav:         { flex: 1, padding: '8px 0', display: 'flex', flexDirection: 'column' },
  navLink:     { display: 'block', padding: '9px 16px', textDecoration: 'none', fontSize: '13px', transition: 'all 0.15s', margin: '1px 0' },
  userSection: { padding: '12px 16px', borderTop: '1px solid #1d4ed8', display: 'flex', alignItems: 'center', gap: '8px' },
  userAvatar:  { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1d4ed8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', flexShrink: 0 },
  userInfo:    { flex: 1, minWidth: 0 },
  userName:    { color: '#e2e8f0', fontSize: '12px', fontWeight: '500', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userCompany: { color: '#93c5fd', fontSize: '11px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  logoutBtn:   { background: 'none', border: 'none', color: '#93c5fd', fontSize: '16px', cursor: 'pointer', padding: '4px', flexShrink: 0 },
  main:        { flex: 1, backgroundColor: '#f0f9ff', overflowY: 'auto' },
}