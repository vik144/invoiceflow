import React, { useState, useEffect } from 'react'
import { invoicesApi, cashflowApi } from '../api'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  selectContainer: {
    display: 'flex',
    gap: '10px'
  },
  select: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #1e1e1e',
    fontSize: '14px',
    background: '#0f0f0f',
    color: '#e5e7eb',
    cursor: 'pointer',
    outline: 'none',
    fontWeight: '500'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px'
  },
  statCard: {
    padding: '24px',
    background: '#0f0f0f',
    borderRadius: '12px',
    border: '1px solid #1e1e1e',
    transition: 'all 0.2s ease'
  },
  statCardHover: {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
  },
  statLabel: {
    fontSize: '13px',
    color: '#9ca3af',
    marginBottom: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: "'JetBrains Mono', monospace"
  },
  statChange: {
    fontSize: '13px',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  positive: {
    color: '#10b981'
  },
  negative: {
    color: '#ef4444'
  },
  salesCard: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    border: 'none'
  },
  purchasesCard: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    border: 'none'
  },
  profitCard: {
    background: '#0f0f0f',
    border: '2px solid #10b981'
  }
}

export default function ProfitSummary() {
  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [sales, setSales] = useState(0)
  const [purchases, setPurchases] = useState(0)

  useEffect(() => {
    loadData()
  }, [month, year])

  async function loadData() {
    try {
      const [salesData, purchasesData] = await Promise.all([
        cashflowApi.getMonthlySummary(month, year),
        invoicesApi.getMonthlySummary(month, year)
      ])
      setSales(salesData.total_sales || 0)
      setPurchases(purchasesData.total_purchases || 0)
    } catch (err) {
      console.error('Failed to load summary:', err)
    }
  }

  const profit = sales - purchases
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.selectContainer}>
          <select style={styles.select} value={month} onChange={e => setMonth(e.target.value)}>
            {months.map((m, i) => (
              <option key={i} value={String(i + 1)}>{m}</option>
            ))}
          </select>
          <select style={styles.select} value={year} onChange={e => setYear(e.target.value)}>
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, ...styles.salesCard}}>
          <div style={{...styles.statLabel, color: 'rgba(255, 255, 255, 0.8)'}}>Total Sales</div>
          <div style={styles.statValue}>₹{sales.toLocaleString()}</div>
        </div>

        <div style={{...styles.statCard, ...styles.purchasesCard}}>
          <div style={{...styles.statLabel, color: 'rgba(255, 255, 255, 0.8)'}}>Total Purchases</div>
          <div style={styles.statValue}>₹{purchases.toLocaleString()}</div>
        </div>

        <div style={{...styles.statCard, ...styles.profitCard}}>
          <div style={styles.statLabel}>Net Profit</div>
          <div style={{...styles.statValue, color: profit >= 0 ? '#10b981' : '#ef4444'}}>
            {profit >= 0 ? '+' : ''}₹{profit.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}
