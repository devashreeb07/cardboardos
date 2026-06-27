import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.code}>404</div>
        <h1 style={styles.title}>Page not found</h1>
        <p style={styles.sub}>The page you're looking for doesn't exist or has been moved.</p>
        <button onClick={() => navigate('/')} style={styles.btn}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )
}

const styles = {
  page:  { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' },
  card:  { textAlign: 'center', padding: '48px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', maxWidth: '400px' },
  code:  { fontSize: '72px', fontWeight: '700', color: '#e2e8f0', marginBottom: '8px' },
  title: { fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' },
  sub:   { fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: '1.6' },
  btn:   { padding: '10px 24px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
}