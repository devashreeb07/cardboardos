import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts'
import api from '../api/axios'

export default function Dashboard() {
  const [data, setData]     = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    try {
      const [orderSum, prodSum, weeklyRes, wasteSum, esgSum, procSum] = await Promise.all([
        api.get('/orders/summary'),
        api.get('/production/summary'),
        api.get('/production/weekly'),
        api.get('/waste/summary'),
        api.get('/esg/summary'),
        api.get('/procurement/summary'),
      ])
      setData({
        orders:    orderSum.data,
        production: prodSum.data,
        weekly:    weeklyRes.data.reverse(),
        waste:     wasteSum.data,
        esg:       esgSum.data,
        procurement: procSum.data,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>

  const kpis = [
    { label: 'Total Orders',      value: data.orders?.total,                          color: '#4f46e5', icon: '📦', sub: `${data.orders?.pending} pending` },
    { label: 'Boxes Produced',    value: data.production?.total_produced?.toLocaleString(), color: '#10b981', icon: '🏭', sub: `${data.production?.runs_today} runs today` },
    { label: 'Total Scrap (kg)',  value: data.waste?.total_scrap_kg,                  color: '#f59e0b', icon: '♻️', sub: `avg ${data.waste?.avg_scrap_per_run} kg/run` },
    { label: 'Avg Energy / Shift',value: `${data.esg?.avg_energy_kwh ?? 0} kWh`,     color: '#3b82f6', icon: '⚡', sub: `${data.esg?.total_logs ?? 0} ESG logs` },
    { label: 'Suppliers',         value: data.procurement?.total_suppliers,           color: '#8b5cf6', icon: '🏭', sub: `${data.procurement?.avg_reliability}% avg reliability` },
    { label: 'Delivered',         value: data.orders?.delivered,                      color: '#10b981', icon: '✅', sub: `${data.orders?.dispatched} dispatched` },
    { label: 'In Production',     value: data.orders?.in_production,                  color: '#3b82f6', icon: '⚙️', sub: `${data.production?.produced_today?.toLocaleString()} today` },
    { label: 'Recycled Material', value: `${data.esg?.avg_recycled_percent ?? 0}%`,  color: '#10b981', icon: '🌿', sub: 'avg across shifts' },
  ]

  return (
    <div style={styles.page}>
      {/* Welcome header */}
      <div style={styles.welcome}>
        <div>
          <h1 style={styles.title}>
            Good {getTimeOfDay()}, {user.name?.split(' ')[0] || 'Manager'} 👋
          </h1>
          <p style={styles.subtitle}>
            Here's what's happening at your factory today —{' '}
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={styles.kpiGrid}>
        {kpis.map((k) => (
          <div key={k.label} style={styles.kpiCard}>
            <div style={styles.kpiTop}>
              <span style={styles.kpiIcon}>{k.icon}</span>
              <span style={{ ...styles.kpiBadge, backgroundColor: k.color + '15', color: k.color }}>
                live
              </span>
            </div>
            <div style={{ ...styles.kpiValue, color: k.color }}>{k.value ?? 0}</div>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📈 Weekly Production</h3>
          <p style={styles.chartSub}>Boxes produced per day this week</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }}
                tickFormatter={d => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={v => [v.toLocaleString(), 'Boxes']}
                labelFormatter={d => new Date(d).toLocaleDateString('en-IN')}
              />
              <Bar dataKey="quantity_produced" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>♻️ Scrap Trend</h3>
          <p style={styles.chartSub}>Daily scrap generated (kg)</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }}
                tickFormatter={d => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={v => [`${v} kg`, 'Scrap']}
                labelFormatter={d => new Date(d).toLocaleDateString('en-IN')}
              />
              <Line type="monotone" dataKey="scrap_kg" stroke="#f59e0b"
                strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Module status grid */}
      <div style={styles.moduleGrid}>
        <h3 style={{ ...styles.chartTitle, marginBottom: '16px' }}>Platform Modules</h3>
        <div style={styles.moduleRow}>
          {[
            { name: 'Orders',      status: 'active', count: `${data.orders?.total} orders`,          path: '/orders'      },
            { name: 'Production',  status: 'active', count: `${data.production?.runs_today} runs today`, path: '/production'  },
            { name: 'Procurement', status: 'active', count: `${data.procurement?.total_suppliers} suppliers`, path: '/procurement' },
            { name: 'Logistics',   status: 'active', count: `${data.orders?.dispatched} dispatched`, path: '/logistics'   },
            { name: 'Pricing',     status: 'active', count: 'Quote generator',                       path: '/pricing'     },
            { name: 'Workforce',   status: 'active', count: 'Shift scheduler',                       path: '/workforce'   },
            { name: 'Waste',       status: 'active', count: `${data.waste?.total_scrap_kg} kg tracked`, path: '/waste'    },
            { name: 'ESG',         status: 'active', count: `${data.esg?.total_logs ?? 0} logs`,     path: '/esg'         },
            { name: 'AI Forecast', status: 'active', count: 'Prophet ML model',                      path: '/forecast'    },
          ].map(m => (
            <a key={m.name} href={m.path} style={styles.moduleCard}>
              <div style={styles.moduleStatus} />
              <div style={styles.moduleName}>{m.name}</div>
              <div style={styles.moduleCount}>{m.count}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

const styles = {
  page: { padding: '32px', maxWidth: '1200px', animation: 'fadeIn 0.2s ease' },
  loading:     { padding: '32px', color: '#64748b' },
  welcome:     { marginBottom: '28px' },
  title:       { fontSize: '24px', fontWeight: '700', color: '#1e293b' },
  subtitle:    { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  kpiGrid:     { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' },
  kpiCard:     { backgroundColor: '#fff', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  kpiTop:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  kpiIcon:     { fontSize: '20px' },
  kpiBadge:    { fontSize: '10px', padding: '2px 7px', borderRadius: '20px', fontWeight: '500' },
  kpiValue:    { fontSize: '28px', fontWeight: '700', marginBottom: '2px' },
  kpiLabel:    { fontSize: '13px', color: '#64748b', marginBottom: '2px' },
  kpiSub:      { fontSize: '11px', color: '#94a3b8' },
  chartsRow:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  chartCard:   { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  chartTitle:  { fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' },
  chartSub:    { fontSize: '12px', color: '#94a3b8', marginBottom: '14px' },
  moduleGrid:  { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  moduleRow:   { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' },
  moduleCard:  { display: 'block', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', textDecoration: 'none', border: '1px solid #e2e8f0', transition: 'border-color 0.15s' },
  moduleStatus:{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', marginBottom: '8px' },
  moduleName:  { fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' },
  moduleCount: { fontSize: '11px', color: '#64748b' },
}