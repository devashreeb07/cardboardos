import { Outlet, NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/',            label: '📊 Dashboard'    },
  { path: '/orders',      label: '📦 Orders'        },
  { path: '/production',  label: '🏭 Production'    },
  { path: '/workforce',   label: '👷 Workforce'     },
  { path: '/procurement', label: '🛒 Procurement'   },
  { path: '/logistics',   label: '🚚 Logistics'     },
  { path: '/pricing',     label: '💰 Pricing'       },
  { path: '/waste',       label: '♻️ Waste Tracker' },
  { path: '/esg',         label: '🌿 ESG'           },
  { path: '/forecast',    label: '🤖 AI Forecast'   },
  { path: '/boxoptimizer', label: '📐 Box Optimizer' },
  { path: '/waste-insights', label: '🔍 Waste ML' },
]

export default function Layout() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>📦</div>
          <div>
            <h2 style={styles.logoText}>CardboardOS</h2>
            <p style={styles.logoSub}>Factory Management</p>
          </div>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                ...styles.navLink,
                backgroundColor: isActive ? '#4f46e5' : 'transparent',
                color:           isActive ? '#fff'    : '#94a3b8',
                fontWeight:      isActive ? '500'     : '400',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={styles.userSection}>
          <div style={styles.userAvatar}>
            {user.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div style={styles.userInfo}>
            <p style={styles.userName}>{user.name || 'Admin'}</p>
            <p style={styles.userRole}>{user.role || 'manager'}</p>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
            ⏻
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

const styles = {
  container:   { display: 'flex', minHeight: '100vh' },
  sidebar:     { width: '220px', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' },
  logo:        { padding: '20px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon:    { fontSize: '24px' },
  logoText:    { color: '#fff', fontSize: '16px', fontWeight: '700', margin: 0 },
  logoSub:     { color: '#475569', fontSize: '11px', margin: 0 },
  nav:         { flex: 1, padding: '8px 0', display: 'flex', flexDirection: 'column' },
  navLink:     { display: 'block', padding: '9px 16px', textDecoration: 'none', fontSize: '13px', borderRadius: '0', transition: 'all 0.15s', margin: '1px 0' },
  userSection: { padding: '12px 16px', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '8px' },
  userAvatar:  { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', flexShrink: 0 },
  userInfo:    { flex: 1, minWidth: 0 },
  userName:    { color: '#e2e8f0', fontSize: '12px', fontWeight: '500', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole:    { color: '#475569', fontSize: '11px', margin: 0, textTransform: 'capitalize' },
  logoutBtn:   { background: 'none', border: 'none', color: '#475569', fontSize: '16px', cursor: 'pointer', padding: '4px', flexShrink: 0 },
  main:        { flex: 1, backgroundColor: '#f8fafc', overflowY: 'auto' },
}