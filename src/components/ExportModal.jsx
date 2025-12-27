import React, { useState } from 'react'
import { invoicesApi } from '../api'

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: '#0f0f0f',
    borderRadius: '12px',
    border: '1px solid #1e1e1e',
    padding: '24px',
    width: '400px',
    maxWidth: '90vw'
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    color: '#9ca3af',
    marginBottom: '6px',
    fontWeight: '500'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    background: '#0a0a0a',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#e5e7eb',
    fontSize: '14px',
    marginBottom: '16px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    background: '#0a0a0a',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#e5e7eb',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  row: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px'
  },
  col: {
    flex: 1
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
    justifyContent: 'flex-end'
  },
  btn: {
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none'
  },
  btnPrimary: {
    background: '#6366f1',
    color: '#ffffff'
  },
  btnSecondary: {
    background: 'transparent',
    color: '#9ca3af',
    border: '1px solid #374151'
  }
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function ExportModal({ onClose }) {
  const now = new Date()
  const [filterType, setFilterType] = useState('monthly')
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  function handleExport() {
    if (filterType === 'monthly') {
      invoicesApi.exportCsv({ filter: 'monthly', month, year })
    } else if (filterType === 'range') {
      if (!startDate || !endDate) {
        alert('Please select both start and end dates')
        return
      }
      invoicesApi.exportCsv({ filter: 'range', startDate, endDate })
    } else {
      invoicesApi.exportCsv({ filter: 'all' })
    }
    onClose()
  }

  function setQuickRange(type) {
    const today = new Date()
    if (type === 'thisMonth') {
      setMonth(String(today.getMonth() + 1))
      setYear(String(today.getFullYear()))
      setFilterType('monthly')
    } else if (type === 'lastMonth') {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      setMonth(String(lastMonth.getMonth() + 1))
      setYear(String(lastMonth.getFullYear()))
      setFilterType('monthly')
    } else if (type === 'last3Months') {
      const end = today.toISOString().split('T')[0]
      const start = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
      setStartDate(start.toISOString().split('T')[0])
      setEndDate(end)
      setFilterType('range')
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.title}>Export Invoices to CSV</div>

        <label style={styles.label}>Filter Type</label>
        <select
          style={styles.select}
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="all">All Invoices</option>
          <option value="monthly">By Month</option>
          <option value="range">Custom Date Range</option>
        </select>

        {filterType === 'monthly' && (
          <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                style={{ ...styles.btn, ...styles.btnSecondary, padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setQuickRange('thisMonth')}
              >
                This Month
              </button>
              <button
                style={{ ...styles.btn, ...styles.btnSecondary, padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setQuickRange('lastMonth')}
              >
                Last Month
              </button>
            </div>
            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Month</label>
                <select
                  style={styles.select}
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div style={styles.col}>
                <label style={styles.label}>Year</label>
                <select
                  style={styles.select}
                  value={year}
                  onChange={e => setYear(e.target.value)}
                >
                  {[2024, 2025, 2026].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {filterType === 'range' && (
          <>
            <button
              style={{ ...styles.btn, ...styles.btnSecondary, padding: '6px 12px', fontSize: '12px', marginBottom: '16px' }}
              onClick={() => setQuickRange('last3Months')}
            >
              Last 3 Months
            </button>
            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Start Date</label>
                <input
                  type="date"
                  style={styles.input}
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div style={styles.col}>
                <label style={styles.label}>End Date</label>
                <input
                  type="date"
                  style={styles.input}
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        <div style={styles.actions}>
          <button
            style={{ ...styles.btn, ...styles.btnSecondary }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            style={{ ...styles.btn, ...styles.btnPrimary }}
            onClick={handleExport}
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  )
}
