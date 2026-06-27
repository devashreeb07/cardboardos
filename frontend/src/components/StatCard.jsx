export default function StatCard({ icon, value, label, sub, color = '#4f46e5' }) {
  return (
    <div style={styles.card}>
      <div style={styles.top}>
        <span style={styles.icon}>{icon}</span>
        <span style={{
          ...styles.badge,
          backgroundColor: color + '15',
          color: color
        }}>
          live
        </span>
      </div>
      <div style={{ ...styles.value, color }}>{value ?? 0}</div>
      <div style={styles.label}>{label}</div>
      {sub && <div style={styles.sub}>{sub}</div>}
    </div>
  )
}

const styles = {
  card:  { backgroundColor: '#fff', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  top:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  icon:  { fontSize: '20px' },
  badge: { fontSize: '10px', padding: '2px 7px', borderRadius: '20px', fontWeight: '500' },
  value: { fontSize: '28px', fontWeight: '700', marginBottom: '2px' },
  label: { fontSize: '13px', color: '#64748b', marginBottom: '2px' },
  sub:   { fontSize: '11px', color: '#94a3b8' },
}