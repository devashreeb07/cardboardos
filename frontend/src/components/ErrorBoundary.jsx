import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.page}>
          <div style={styles.card}>
            <div style={styles.icon}>⚠️</div>
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.message}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={styles.btn}
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const styles = {
  page:    { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' },
  card:    { backgroundColor: '#fff', borderRadius: '12px', padding: '48px', textAlign: 'center', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  icon:    { fontSize: '48px', marginBottom: '16px' },
  title:   { fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' },
  message: { fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: '1.6' },
  btn:     { padding: '10px 24px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
}