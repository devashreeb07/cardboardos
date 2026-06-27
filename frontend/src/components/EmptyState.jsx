export default function EmptyState({ icon = '📭', title, message, action, onAction }) {
  return (
    <div style={styles.container}>
      <div style={styles.icon}>{icon}</div>
      <h3 style={styles.title}>{title}</h3>
      {message && <p style={styles.message}>{message}</p>}
      {action && (
        <button onClick={onAction} style={styles.btn}>
          {action}
        </button>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    textAlign: 'center',
  },
  icon:    { fontSize: '48px', marginBottom: '16px' },
  title:   { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' },
  message: { fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', maxWidth: '300px', marginBottom: '20px' },
  btn:     { padding: '9px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
}