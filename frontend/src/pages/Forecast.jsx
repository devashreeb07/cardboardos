import { useState, useEffect } from 'react'
import {
  ComposedChart, Line, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend
} from 'recharts'
import api from '../api/axios'

export default function Forecast() {
  const [demand, setDemand]   = useState(null)
  const [price, setPrice]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => { fetchForecasts() }, [])

  async function fetchForecasts() {
    setLoading(true)
    setError('')
    try {
      const [demandRes, priceRes] = await Promise.all([
        api.get('/ai/demand-forecast'),
        api.get('/ai/price-forecast'),
      ])
      setDemand(demandRes.data)
      setPrice(priceRes.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load forecasts')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.loadingSpinner}>⚡</div>
      <div style={styles.loadingText}>Training AI models...</div>
      <div style={styles.loadingSub}>Prophet is fitting your data. This takes 15–30 seconds.</div>
    </div>
  )

  if (error) return (
    <div style={{ padding: '32px' }}>
      <div style={styles.errorBox}>{error}</div>
    </div>
  )

  // Merge historical + forecast for demand chart
  const demandChartData = [
    ...(demand?.historical || []).map(d => ({
      date:      d.date,
      actual:    d.actual,
      predicted: d.predicted,
      type:      'historical'
    })),
    ...(demand?.forecast || []).map(d => ({
      date:      d.date,
      forecast:  d.predicted,
      upper:     d.upper,
      lower:     d.lower,
      type:      'forecast'
    }))
  ]

  // Merge for price chart
  const priceChartData = [
    ...(price?.historical || []).map(d => ({
      date:   d.date,
      actual: d.actual,
      fitted: d.predicted,
      type:   'historical'
    })),
    ...(price?.forecast || []).map(d => ({
      date:     d.date,
      forecast: d.predicted,
      upper:    d.upper,
      lower:    d.lower,
      type:     'forecast'
    }))
  ]

  const splitDate = demand?.historical?.slice(-1)[0]?.date

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>AI Forecasting</h1>
          <p style={styles.subtitle}>
            Demand and price predictions powered by Meta Prophet
          </p>
        </div>
        <button onClick={fetchForecasts} style={styles.refreshBtn}>
          🔄 Retrain Models
        </button>
      </div>

      {/* Demand Forecast Summary Cards */}
      {demand?.summary && (
        <div style={styles.summaryRow}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>📦</div>
            <div style={styles.summaryValue}>
              {demand.summary.avg_predicted_daily?.toLocaleString()}
            </div>
            <div style={styles.summaryLabel}>Avg predicted daily demand (boxes)</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>📈</div>
            <div style={styles.summaryValue}>
              {demand.summary.peak_value?.toLocaleString()}
            </div>
            <div style={styles.summaryLabel}>
              Peak demand on {demand.summary.peak_day
                ? new Date(demand.summary.peak_day).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                : '—'}
            </div>
          </div>
          <div style={{
            ...styles.summaryCard,
            borderLeft: `4px solid ${price?.trend === 'rising' ? '#ef4444' : '#10b981'}`
          }}>
            <div style={styles.summaryIcon}>
              {price?.trend === 'rising' ? '📈' : '📉'}
            </div>
            <div style={{
              ...styles.summaryValue,
              color: price?.trend === 'rising' ? '#ef4444' : '#10b981'
            }}>
              {price?.change_pct > 0 ? '+' : ''}{price?.change_pct}%
            </div>
            <div style={styles.summaryLabel}>Kraft Paper price trend (14 days)</div>
          </div>
          <div style={{
            ...styles.summaryCard,
            backgroundColor: price?.trend === 'rising' ? '#fef2f2' : '#f0fdf4'
          }}>
            <div style={styles.summaryIcon}>💡</div>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: price?.trend === 'rising' ? '#ef4444' : '#10b981',
              marginBottom: '4px'
            }}>
              {price?.recommendation}
            </div>
            <div style={styles.summaryLabel}>
              Current: ₹{price?.current_price?.toLocaleString()}/ton
            </div>
          </div>
        </div>
      )}

      {/* Demand Forecast Chart */}
      <div style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <div>
            <h3 style={styles.chartTitle}>📦 30-Day Demand Forecast</h3>
            <p style={styles.chartSub}>
              Historical order quantities vs Prophet predictions
            </p>
          </div>
          <div style={styles.legendRow}>
            <span style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: '#4f46e5' }} />
              Actual
            </span>
            <span style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: '#94a3b8' }} />
              Fitted
            </span>
            <span style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: '#f59e0b' }} />
              Forecast
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={demandChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={d => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              interval={6}
            />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              labelFormatter={d => new Date(d).toLocaleDateString('en-IN')}
              formatter={(val, name) => [val?.toLocaleString(), name]}
            />
            {splitDate && (
              <ReferenceLine
                x={splitDate}
                stroke="#cbd5e1"
                strokeDasharray="4 4"
                label={{ value: 'Today', fontSize: 11, fill: '#94a3b8' }}
              />
            )}
            <Bar dataKey="actual" fill="#4f46e5" opacity={0.7} radius={[2, 2, 0, 0]} />
            <Line type="monotone" dataKey="predicted" stroke="#94a3b8"
              strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            <Line type="monotone" dataKey="forecast" stroke="#f59e0b"
              strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Price Forecast Chart */}
      <div style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <div>
            <h3 style={styles.chartTitle}>💰 14-Day Kraft Paper Price Forecast</h3>
            <p style={styles.chartSub}>
              Historical prices vs Prophet predictions (₹/ton)
            </p>
          </div>
          <div style={{
            ...styles.trendBadge,
            backgroundColor: price?.trend === 'rising' ? '#fef2f2' : '#f0fdf4',
            color: price?.trend === 'rising' ? '#ef4444' : '#10b981',
          }}>
            {price?.trend === 'rising' ? '↑ Rising' : '↓ Falling'}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={priceChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={d => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              interval={5}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              labelFormatter={d => new Date(d).toLocaleDateString('en-IN')}
              formatter={(val, name) => [`₹${val?.toLocaleString()}`, name]}
            />
            <Line type="monotone" dataKey="actual" stroke="#4f46e5"
              strokeWidth={2} dot={false} name="Actual price" />
            <Line type="monotone" dataKey="fitted" stroke="#94a3b8"
              strokeWidth={1} dot={false} strokeDasharray="4 2" name="Model fit" />
            <Line type="monotone" dataKey="forecast" stroke="#10b981"
              strokeWidth={2.5} dot={{ fill: '#10b981', r: 3 }} name="Forecast" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast table — next 14 days */}
      {price?.forecast && (
        <div style={styles.tableCard}>
          <h3 style={{ ...styles.chartTitle, marginBottom: '16px' }}>
            📅 Price Forecast — Next 14 Days
          </h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Predicted Price (₹/ton)</th>
                <th style={styles.th}>Lower Bound</th>
                <th style={styles.th}>Upper Bound</th>
                <th style={styles.th}>vs Current</th>
              </tr>
            </thead>
            <tbody>
              {price.forecast.map((row, i) => {
                const diff = row.predicted - price.current_price
                const isUp = diff > 0
                return (
                  <tr key={row.date} style={{
                    ...styles.tr,
                    backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc'
                  }}>
                    <td style={styles.td}>
                      {new Date(row.date).toLocaleDateString('en-IN', {
                        weekday: 'short', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td style={{ ...styles.td, fontWeight: '600' }}>
                      ₹{row.predicted?.toLocaleString()}
                    </td>
                    <td style={{ ...styles.td, color: '#64748b' }}>
                      ₹{row.lower?.toLocaleString()}
                    </td>
                    <td style={{ ...styles.td, color: '#64748b' }}>
                      ₹{row.upper?.toLocaleString()}
                    </td>
                    <td style={{
                      ...styles.td,
                      color: isUp ? '#ef4444' : '#10b981',
                      fontWeight: '500'
                    }}>
                      {isUp ? '↑' : '↓'} ₹{Math.abs(diff).toFixed(0)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { padding: '32px', maxWidth: '1200px', animation: 'fadeIn 0.2s ease' },
  loadingPage:   { padding: '80px 32px', textAlign: 'center' },
  loadingSpinner:{ fontSize: '48px', marginBottom: '16px' },
  loadingText:   { fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' },
  loadingSub:    { fontSize: '14px', color: '#64748b' },
  errorBox:      { backgroundColor: '#fef2f2', color: '#dc2626', padding: '16px', borderRadius: '8px', fontSize: '14px' },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  title:         { fontSize: '26px', fontWeight: '700', color: '#1e293b' },
  subtitle:      { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  refreshBtn:    { padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  summaryRow:    { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' },
  summaryCard:   { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #4f46e5' },
  summaryIcon:   { fontSize: '22px', marginBottom: '8px' },
  summaryValue:  { fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' },
  summaryLabel:  { fontSize: '12px', color: '#64748b', lineHeight: '1.4' },
  chartCard:     { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  chartHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  chartTitle:    { fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' },
  chartSub:      { fontSize: '12px', color: '#94a3b8' },
  legendRow:     { display: 'flex', gap: '16px' },
  legendItem:    { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' },
  legendDot:     { width: '8px', height: '8px', borderRadius: '50%' },
  trendBadge:    { padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' },
  tableCard:     { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table:         { width: '100%', borderCollapse: 'collapse' },
  thead:         { backgroundColor: '#f8fafc' },
  th:            { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
  tr:            { borderBottom: '1px solid #f1f5f9' },
  td:            { padding: '11px 14px', fontSize: '14px', color: '#1e293b' },
}