import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user',  JSON.stringify(res.data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>📦</span>
          <h1 style={styles.logoText}>CardboardOS</h1>
        </div>
        <p style={styles.subtitle}>Factory Management Platform</p>
        <p style={styles.signIn}>Sign in to your account</p>

        {/* Error */}
        {error && (
          <div style={styles.error}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@cardboardos.com"
              required
              style={styles.input}
              autoComplete="email"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrap}>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                style={{ ...styles.input, paddingRight: '44px' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor:  loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div style={styles.hint}>
          <p style={styles.hintText}>Demo credentials</p>
          <p style={styles.hintCred}>admin@cardboardos.com / test1234</p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page:         { minHeight: '100vh', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card:         { backgroundColor: '#fff', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  logo:         { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' },
  logoIcon:     { fontSize: '28px' },
  logoText:     { fontSize: '24px', fontWeight: '700', color: '#1e293b' },
  subtitle:     { textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginBottom: '4px' },
  signIn:       { textAlign: 'center', fontSize: '15px', color: '#64748b', marginBottom: '24px', marginTop: '8px' },
  error:        { backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fecaca' },
  form:         { display: 'flex', flexDirection: 'column', gap: '16px' },
  field:        { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:        { fontSize: '13px', fontWeight: '500', color: '#374151' },
  input:        { padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '100%' },
  passwordWrap: { position: 'relative' },
  eyeBtn:       { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '0' },
  submitBtn:    { padding: '12px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', marginTop: '4px' },
  hint:         { marginTop: '24px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' },
  hintText:     { fontSize: '11px', color: '#94a3b8', marginBottom: '4px' },
  hintCred:     { fontSize: '12px', color: '#475569', fontWeight: '500', fontFamily: 'monospace' },
}