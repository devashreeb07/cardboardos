import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import customerApi from '../../api/customerAxios'

export default function CustomerLogin() {
  const navigate = useNavigate()
  const [tab, setTab]         = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [mounted, setMounted] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [regForm, setRegForm]     = useState({
    name: '', email: '', password: '', company_name: '', phone: '', address: ''
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await customerApi.post('/customer/login', loginForm)
      localStorage.setItem('customer_token', res.data.access_token)
      localStorage.setItem('customer_user',  JSON.stringify(res.data.user))
      navigate('/customer/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await customerApi.post('/customer/register', regForm)
      setTab('login')
      setLoginForm({ email: regForm.email, password: regForm.password })
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* Animated background */}
      <div style={styles.bgOverlay} />
      <div style={styles.bgPattern} />

      {/* Floating boxes animation */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          ...styles.floatingBox,
          left:             `${[8, 85, 15, 75, 45, 90][i]}%`,
          top:              `${[10, 20, 60, 70, 85, 45][i]}%`,
          animationDelay:   `${i * 0.8}s`,
          animationDuration:`${4 + i}s`,
          opacity:          0.06 + i * 0.02,
          fontSize:         `${32 + i * 10}px`,
        }}>
          📦
        </div>
      ))}

      <div style={{
        ...styles.container,
        opacity:   mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition:'all 0.6s ease',
      }}>

        {/* Left panel — branding */}
        <div style={styles.leftPanel}>
          <div style={styles.brandSection}>
            <div style={styles.brandLogo}>📦</div>
            <h1 style={styles.brandName}>CardboardOS</h1>
            <p style={styles.brandTagline}>Customer Portal</p>
          </div>

          <div style={styles.features}>
            {[
              { icon: '🚀', title: 'Real-time Tracking',  desc: 'Track your orders live from production to delivery' },
              { icon: '📦', title: 'Easy Ordering',        desc: 'Place custom box orders in just 3 simple steps'   },
              { icon: '📊', title: 'Order Analytics',      desc: 'View your complete order history and insights'    },
              { icon: '💬', title: '24/7 Support',         desc: 'Get help whenever you need it from our team'      },
            ].map((f, i) => (
              <div key={i} style={{
                ...styles.featureItem,
                animationDelay: `${0.2 + i * 0.15}s`,
              }}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <div>
                  <div style={styles.featureTitle}>{f.title}</div>
                  <div style={styles.featureDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.stats}>
            {[
              { value: '500+', label: 'Happy Clients'   },
              { value: '10K+', label: 'Orders Delivered' },
              { value: '99%',  label: 'On-time Rate'    },
            ].map(s => (
              <div key={s.label} style={styles.statItem}>
                <div style={styles.statValue}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div style={styles.rightPanel}>
          <div style={styles.formCard}>

            {/* Tabs */}
            <div style={styles.tabs}>
              {['login', 'register'].map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError('') }}
                  style={{
                    ...styles.tab,
                    backgroundColor: tab === t ? '#1d4ed8' : 'transparent',
                    color:           tab === t ? '#fff'    : '#94a3b8',
                    borderBottom:    tab === t ? '2px solid #1d4ed8' : '2px solid transparent',
                  }}
                >
                  {t === 'login' ? '🔑 Sign In' : '✨ Create Account'}
                </button>
              ))}
            </div>

            <div style={styles.formTitle}>
              {tab === 'login' ? 'Welcome back!' : 'Join CardboardOS'}
            </div>
            <div style={styles.formSubtitle}>
              {tab === 'login'
                ? 'Sign in to track your orders and manage your account'
                : 'Create your account to start ordering in minutes'}
            </div>

            {error && (
              <div style={styles.error}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Login Form */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Email Address</label>
                  <div style={styles.inputWrap}>
                    <span style={styles.inputIcon}>✉️</span>
                    <input
                      style={styles.input}
                      type="email"
                      placeholder="you@company.com"
                      value={loginForm.email}
                      onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Password</label>
                  <div style={styles.inputWrap}>
                    <span style={styles.inputIcon}>🔒</span>
                    <input
                      style={styles.input}
                      type="password"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.8 : 1,
                }}>
                  {loading ? '⏳ Signing in...' : 'Sign In →'}
                </button>

                <div style={styles.switchText}>
                  Don't have an account?{' '}
                  <span
                    onClick={() => { setTab('register'); setError('') }}
                    style={styles.switchLink}
                  >
                    Create one free
                  </span>
                </div>
              </form>
            )}

            {/* Register Form */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} style={styles.form}>
                <div style={styles.formGrid}>
                  <div style={styles.field}>
                    <label style={styles.label}>Full Name *</label>
                    <div style={styles.inputWrap}>
                      <span style={styles.inputIcon}>👤</span>
                      <input style={styles.input} placeholder="Your full name"
                        value={regForm.name}
                        onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                        required />
                    </div>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Company Name *</label>
                    <div style={styles.inputWrap}>
                      <span style={styles.inputIcon}>🏢</span>
                      <input style={styles.input} placeholder="Your company"
                        value={regForm.company_name}
                        onChange={e => setRegForm({ ...regForm, company_name: e.target.value })}
                        required />
                    </div>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Email *</label>
                    <div style={styles.inputWrap}>
                      <span style={styles.inputIcon}>✉️</span>
                      <input style={styles.input} type="email" placeholder="you@company.com"
                        value={regForm.email}
                        onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                        required />
                    </div>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Phone</label>
                    <div style={styles.inputWrap}>
                      <span style={styles.inputIcon}>📱</span>
                      <input style={styles.input} placeholder="+91 98765 43210"
                        value={regForm.phone}
                        onChange={e => setRegForm({ ...regForm, phone: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                    <label style={styles.label}>Address</label>
                    <div style={styles.inputWrap}>
                      <span style={styles.inputIcon}>📍</span>
                      <input style={styles.input} placeholder="City, State"
                        value={regForm.address}
                        onChange={e => setRegForm({ ...regForm, address: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                    <label style={styles.label}>Password *</label>
                    <div style={styles.inputWrap}>
                      <span style={styles.inputIcon}>🔒</span>
                      <input style={styles.input} type="password" placeholder="Min 6 characters"
                        value={regForm.password}
                        onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                        required />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.8 : 1,
                }}>
                  {loading ? '⏳ Creating account...' : '✨ Create Free Account'}
                </button>

                <div style={styles.switchText}>
                  Already have an account?{' '}
                  <span
                    onClick={() => { setTab('login'); setError('') }}
                    style={styles.switchLink}
                  >
                    Sign in
                  </span>
                </div>
              </form>
            )}

            {/* Security footer */}
            <div style={styles.footer}>
              <span style={styles.footerText}>
                🔒 Secure portal · Your data is protected
              </span>
            </div>

            {/* Company contact details */}
            <div style={styles.contactBox}>
              <div style={styles.contactTitle}>📞 Need Help? Contact Us</div>
              <div style={styles.contactGrid}>
                {[
                  { icon: '🏭', label: 'Company',       value: 'CardboardOS Industries'  },
                  { icon: '📧', label: 'Email',          value: 'support@cardboardos.com' },
                  { icon: '📱', label: 'Phone',          value: '+91 98765 43210'         },
                  { icon: '📍', label: 'Location',       value: 'Mumbai, Maharashtra'     },
                  { icon: '🕐', label: 'Working Hours',  value: 'Mon–Sat, 9AM – 6PM'     },
                  { icon: '🌐', label: 'Website',        value: 'www.cardboardos.com'     },
                ].map(item => (
                  <div key={item.label} style={styles.contactItem}>
                    <span style={styles.contactIcon}>{item.icon}</span>
                    <div>
                      <div style={styles.contactLabel}>{item.label}</div>
                      <div style={styles.contactValue}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  page: {
    position:       'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background:     'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    overflow:       'auto',
    zIndex:         9999,
    fontFamily:     '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding:        '20px',
  },
  bgOverlay: {
    position:   'absolute',
    inset:      0,
    background: 'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.15) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  bgPattern: {
    position:        'absolute',
    inset:           0,
    backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
    backgroundSize:  '32px 32px',
    pointerEvents:   'none',
  },
  floatingBox: {
    position:      'absolute',
    animation:     'float linear infinite',
    pointerEvents: 'none',
    userSelect:    'none',
  },
  container: {
    display:      'flex',
    width:        '100%',
    maxWidth:     '1000px',
    borderRadius: '24px',
    overflow:     'hidden',
    boxShadow:    '0 25px 80px rgba(0,0,0,0.5)',
    position:     'relative',
    zIndex:       1,
  },

  // Left panel
  leftPanel: {
    flex:           1,
    background:     'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
    backdropFilter: 'blur(20px)',
    padding:        '48px 40px',
    display:        'flex',
    flexDirection:  'column',
    gap:            '32px',
    borderRight:    '1px solid rgba(255,255,255,0.1)',
  },
  brandSection: { display: 'flex', flexDirection: 'column', gap: '8px' },
  brandLogo:    { fontSize: '48px', marginBottom: '8px' },
  brandName:    { fontSize: '32px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.5px' },
  brandTagline: { fontSize: '16px', color: '#93c5fd', margin: 0 },
  features:     { display: 'flex', flexDirection: 'column', gap: '16px' },
  featureItem:  { display: 'flex', gap: '14px', alignItems: 'flex-start', animation: 'fadeSlideIn 0.5s ease forwards', opacity: 0 },
  featureIcon:  { fontSize: '24px', flexShrink: 0, marginTop: '2px' },
  featureTitle: { fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '2px' },
  featureDesc:  { fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' },
  stats:        { display: 'flex', gap: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  statItem:     { textAlign: 'center' },
  statValue:    { fontSize: '22px', fontWeight: '800', color: '#60a5fa' },
  statLabel:    { fontSize: '11px', color: '#94a3b8', marginTop: '2px' },

  // Right panel
  rightPanel: {
    width:           '440px',
    backgroundColor: '#fff',
    flexShrink:      0,
    overflowY:       'auto',
  },
  formCard: {
    padding:       '36px',
    display:       'flex',
    flexDirection: 'column',
    gap:           '0',
  },
  tabs: {
    display:      'flex',
    marginBottom: '20px',
    borderBottom: '1px solid #f1f5f9',
  },
  tab: {
    flex:        1,
    padding:     '12px 8px',
    border:      'none',
    background:  'transparent',
    fontSize:    '14px',
    fontWeight:  '500',
    cursor:      'pointer',
    transition:  'all 0.2s',
  },
  formTitle:    { fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' },
  formSubtitle: { fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: '1.5' },
  error: {
    backgroundColor: '#fef2f2',
    color:           '#dc2626',
    padding:         '10px 14px',
    borderRadius:    '8px',
    fontSize:        '13px',
    marginBottom:    '16px',
    display:         'flex',
    alignItems:      'center',
    gap:             '8px',
    border:          '1px solid #fecaca',
  },
  form:       { display: 'flex', flexDirection: 'column', gap: '14px' },
  formGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field:      { display: 'flex', flexDirection: 'column', gap: '5px' },
  label:      { fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' },
  inputWrap:  { position: 'relative' },
  inputIcon:  { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', pointerEvents: 'none' },
  input: {
    width:           '100%',
    padding:         '10px 12px 10px 36px',
    border:          '1px solid #e2e8f0',
    borderRadius:    '8px',
    fontSize:        '14px',
    boxSizing:       'border-box',
    transition:      'border-color 0.2s',
    outline:         'none',
    backgroundColor: '#f8fafc',
  },
  submitBtn: {
    padding:         '13px',
    background:      'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    color:           '#fff',
    border:          'none',
    borderRadius:    '10px',
    fontSize:        '15px',
    fontWeight:      '600',
    cursor:          'pointer',
    marginTop:       '4px',
    boxShadow:       '0 4px 15px rgba(29,78,216,0.4)',
    transition:      'all 0.2s',
    width:           '100%',
  },
  switchText: { textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '4px' },
  switchLink: { color: '#1d4ed8', fontWeight: '600', cursor: 'pointer' },
  footer:     { textAlign: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' },
  footerText: { fontSize: '11px', color: '#cbd5e1' },

  // Contact box
  contactBox: {
    marginTop:       '16px',
    padding:         '16px',
    backgroundColor: '#f8fafc',
    borderRadius:    '12px',
    border:          '1px solid #e2e8f0',
  },
  contactTitle: {
    fontSize:     '13px',
    fontWeight:   '700',
    color:        '#1e293b',
    marginBottom: '12px',
    paddingBottom:'8px',
    borderBottom: '1px solid #e2e8f0',
  },
  contactGrid: {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 '10px',
  },
  contactItem: {
    display:    'flex',
    gap:        '8px',
    alignItems: 'flex-start',
  },
  contactIcon: {
    fontSize:   '15px',
    flexShrink: 0,
    marginTop:  '1px',
  },
  contactLabel: {
    fontSize:      '10px',
    color:         '#94a3b8',
    fontWeight:    '500',
    marginBottom:  '1px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  contactValue: {
    fontSize:   '12px',
    color:      '#374151',
    fontWeight: '500',
  },
}