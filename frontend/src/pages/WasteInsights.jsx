import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function WasteInsights() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => { fetchInsights() }, [])

  async function fetchInsights() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/ai/waste-clustering')
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.loadingIcon}>🔍</div>
      <div style={styles.loadingText}>Running KMeans clustering...</div>
      <div style={styles.loadingSub}>Analysing {' '}production runs for waste patterns</div>
    </div>
  )

  if (error) return (
    <div style={{ padding: '32px' }}>
      <div style={styles.errorBox}>{error}</div>
    </div>
  )

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Waste ML Insights</h1>
          <p style={styles.subtitle}>
            KMeans clustering on {data?.total_runs} production runs
            — overall avg {data?.overall_avg_scrap} kg/run
          </p>
        </div>
        <button onClick={fetchInsights} style={styles.refreshBtn}>
          🔄 Re-run Analysis
        </button>
      </div>

      {/* Cluster summary cards */}
      <div style={styles.clusterRow}>
        {data?.level_stats?.map(level => (
          <div key={level.level} style={{
            ...styles.clusterCard,
            borderTop: `4px solid ${level.color}`
          }}>
            <div style={{ ...styles.clusterBadge, backgroundColor: level.color + '20', color: level.color }}>
              {level.level} Waste
            </div>
            <div style={{ ...styles.clusterCount, color: level.color }}>
              {level.count}
            </div>
            <div style={styles.clusterLabel}>production runs</div>
            <div style={styles.clusterStats}>
              <div style={styles.clusterStat}>
                <span style={styles.clusterStatLabel}>Avg scrap</span>
                <span style={styles.clusterStatValue}>{level.avg_scrap_kg} kg</span>
              </div>
              <div style={styles.clusterStat}>
                <span style={styles.clusterStatLabel}>Scrap rate</span>
                <span style={styles.clusterStatValue}>{level.avg_scrap_rate}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      {data?.insights?.length > 0 && (
        <div style={styles.insightsCard}>
          <h3 style={styles.sectionTitle}>🤖 AI-Generated Insights</h3>
          <div style={styles.insightsList}>
            {data.insights.map((insight, i) => (
              <div key={i} style={{
                ...styles.insightItem,
                borderLeft: `4px solid ${
                  insight.type === 'warning' ? '#f59e0b' :
                  insight.type === 'success' ? '#10b981' : '#3b82f6'
                }`,
                backgroundColor:
                  insight.type === 'warning' ? '#fffbeb' :
                  insight.type === 'success' ? '#f0fdf4' : '#eff6ff'
              }}>
                <div style={styles.insightHeader}>
                  <span style={styles.insightIcon}>{insight.icon}</span>
                  <span style={styles.insightTitle}>{insight.title}</span>
                </div>
                <p style={styles.insightMessage}>{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Machine + Shift combo table */}
      <div style={styles.tableCard}>
        <h3 style={{ ...styles.sectionTitle, marginBottom: '16px' }}>
          🏭 Machine × Shift Waste Analysis
        </h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Machine</th>
              <th style={styles.th}>Shift</th>
              <th style={styles.th}>Avg Scrap (kg)</th>
              <th style={styles.th}>Total Scrap (kg)</th>
              <th style={styles.th}>Runs</th>
              <th style={styles.th}>vs Average</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.combo_analysis?.map((row, i) => (
              <tr key={i} style={{
                ...styles.tr,
                backgroundColor:
                  row.status === 'high'   ? '#fef2f2' :
                  row.status === 'low'    ? '#f0fdf4' :
                  i % 2 === 0 ? '#fff' : '#f8fafc'
              }}>
                <td style={{ ...styles.td, fontWeight: '500' }}>{row.machine}</td>
                <td style={styles.td}>{row.shift}</td>
                <td style={{ ...styles.td, fontWeight: '600' }}>{row.avg_scrap}</td>
                <td style={styles.td}>{row.total_scrap}</td>
                <td style={styles.td}>{row.run_count}</td>
                <td style={{
                  ...styles.td,
                  color:      row.pct_vs_avg > 0 ? '#ef4444' : '#10b981',
                  fontWeight: '600'
                }}>
                  {row.pct_vs_avg > 0 ? '+' : ''}{row.pct_vs_avg}%
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor:
                      row.status === 'high'   ? '#fef2f2' :
                      row.status === 'low'    ? '#d1fae5' : '#f1f5f9',
                    color:
                      row.status === 'high'   ? '#ef4444' :
                      row.status === 'low'    ? '#10b981' : '#64748b',
                  }}>
                    {row.status === 'high'   ? '⚠️ High' :
                     row.status === 'low'    ? '✅ Best' : '— Normal'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Operator analysis */}
      <div style={styles.tableCard}>
        <h3 style={{ ...styles.sectionTitle, marginBottom: '16px' }}>
          👷 Operator Waste Performance
        </h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Operator</th>
              <th style={styles.th}>Avg Scrap (kg)</th>
              <th style={styles.th}>Total Scrap (kg)</th>
              <th style={styles.th}>Runs</th>
              <th style={styles.th}>vs Average</th>
              <th style={styles.th}>Performance bar</th>
            </tr>
          </thead>
          <tbody>
            {data?.operator_analysis?.map((row, i) => (
              <tr key={i} style={{
                ...styles.tr,
                backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc'
              }}>
                <td style={{ ...styles.td, fontWeight: '500' }}>{row.operator}</td>
                <td style={{ ...styles.td, fontWeight: '600' }}>{row.avg_scrap}</td>
                <td style={styles.td}>{row.total_scrap}</td>
                <td style={styles.td}>{row.run_count}</td>
                <td style={{
                  ...styles.td,
                  color:      row.pct_vs_avg > 0 ? '#ef4444' : '#10b981',
                  fontWeight: '600'
                }}>
                  {row.pct_vs_avg > 0 ? '+' : ''}{row.pct_vs_avg}%
                </td>
                <td style={styles.td}>
                  <div style={styles.perfBarBg}>
                    <div style={{
                      ...styles.perfBarFill,
                      width: `${Math.min(100, (row.avg_scrap / (data.overall_avg_scrap * 2)) * 100)}%`,
                      backgroundColor: row.pct_vs_avg > 15 ? '#ef4444' :
                                       row.pct_vs_avg < -15 ? '#10b981' : '#f59e0b'
                    }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* How it works */}
      <div style={styles.infoCard}>
        <h3 style={styles.sectionTitle}>How KMeans clustering works here</h3>
        <div style={styles.infoGrid}>
          {[
            { icon: '📊', title: 'Feature extraction',  desc: 'Each production run is described by 3 numbers: scrap_kg, scrap_rate (%), and quantity_produced' },
            { icon: '⚖️', title: 'Normalization',       desc: 'Features are normalized using StandardScaler so that quantity (800–2500) doesn\'t dominate scrap_kg (5–50)' },
            { icon: '🎯', title: 'KMeans clustering',   desc: 'Runs are grouped into 3 clusters by minimizing within-cluster variance. Clusters are then labelled Low/Medium/High by average scrap' },
            { icon: '💡', title: 'Insight generation',  desc: 'Machine+shift combinations more than 15% above average are flagged as problem areas, below 15% are flagged as benchmarks' },
          ].map(item => (
            <div key={item.title} style={styles.infoItem}>
              <span style={styles.infoIcon}>{item.icon}</span>
              <div>
                <div style={styles.infoTitle}>{item.title}</div>
                <div style={styles.infoDesc}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '32px', maxWidth: '1200px', animation: 'fadeIn 0.2s ease' },
  loadingPage:      { padding: '80px 32px', textAlign: 'center' },
  loadingIcon:      { fontSize: '48px', marginBottom: '16px' },
  loadingText:      { fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' },
  loadingSub:       { fontSize: '14px', color: '#64748b' },
  errorBox:         { backgroundColor: '#fef2f2', color: '#dc2626', padding: '16px', borderRadius: '8px', fontSize: '14px' },
  header:           { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  title:            { fontSize: '26px', fontWeight: '700', color: '#1e293b' },
  subtitle:         { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  refreshBtn:       { padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  clusterRow:       { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '20px' },
  clusterCard:      { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  clusterBadge:     { display: 'inline-block', fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', marginBottom: '12px' },
  clusterCount:     { fontSize: '40px', fontWeight: '700', marginBottom: '2px' },
  clusterLabel:     { fontSize: '13px', color: '#64748b', marginBottom: '12px' },
  clusterStats:     { display: 'flex', gap: '16px' },
  clusterStat:      { display: 'flex', flexDirection: 'column', gap: '2px' },
  clusterStatLabel: { fontSize: '11px', color: '#94a3b8' },
  clusterStatValue: { fontSize: '14px', fontWeight: '600', color: '#1e293b' },
  insightsCard:     { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  sectionTitle:     { fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '14px' },
  insightsList:     { display: 'flex', flexDirection: 'column', gap: '12px' },
  insightItem:      { padding: '14px 16px', borderRadius: '8px' },
  insightHeader:    { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  insightIcon:      { fontSize: '16px' },
  insightTitle:     { fontSize: '14px', fontWeight: '600', color: '#1e293b' },
  insightMessage:   { fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: 0 },
  tableCard:        { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table:            { width: '100%', borderCollapse: 'collapse' },
  thead:            { backgroundColor: '#f8fafc' },
  th:               { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
  tr:               { borderBottom: '1px solid #f1f5f9' },
  td:               { padding: '11px 14px', fontSize: '14px', color: '#1e293b' },
  statusBadge:      { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  perfBarBg:        { height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', width: '120px' },
  perfBarFill:      { height: '6px', borderRadius: '3px', transition: 'width 0.4s' },
  infoCard:         { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  infoGrid:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '14px' },
  infoItem:         { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  infoIcon:         { fontSize: '22px', flexShrink: 0 },
  infoTitle:        { fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' },
  infoDesc:         { fontSize: '12px', color: '#64748b', lineHeight: '1.5' },
}