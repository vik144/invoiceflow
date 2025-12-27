import React, { useState, useEffect } from 'react'
import { cashflowApi } from '../api'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  form: {
    background: '#0f0f0f',
    padding: '28px',
    borderRadius: '12px',
    border: '1px solid #1e1e1e'
  },
  formTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '20px'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
    alignItems: 'end'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: '500',
    fontSize: '13px',
    color: '#9ca3af'
  },
  input: {
    padding: '12px 14px',
    border: '1px solid #1e1e1e',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#0a0a0a',
    color: '#e5e7eb',
    outline: 'none'
  },
  saveBtn: {
    padding: '12px 24px',
    background: '#6366f1',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    transition: 'all 0.2s ease'
  },
  total: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #1e1e1e'
  },
  tableContainer: {
    background: '#0f0f0f',
    borderRadius: '12px',
    border: '1px solid #1e1e1e',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  thead: {
    background: '#0a0a0a',
    borderBottom: '1px solid #1e1e1e'
  },
  th: {
    padding: '16px 20px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tr: {
    borderBottom: '1px solid #1e1e1e'
  },
  td: {
    padding: '20px',
    fontSize: '14px',
    color: '#e5e7eb'
  },
  date: {
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: "'JetBrains Mono', monospace"
  },
  amount: {
    fontWeight: '600',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '15px'
  },
  cash: {
    color: '#10b981'
  },
  upi: {
    color: '#6366f1'
  },
  deleteBtn: {
    padding: '8px 14px',
    background: 'transparent',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '60px 20px',
    fontSize: '14px'
  }
}

export default function CashFlowTab() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [cashAmount, setCashAmount] = useState('')
  const [upiAmount, setUpiAmount] = useState('')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntries()
  }, [])

  useEffect(() => {
    loadCurrentDate()
  }, [date])

  async function loadEntries() {
    try {
      const data = await cashflowApi.getAll()
      setEntries(data)
    } catch (err) {
      console.error('Failed to load entries:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadCurrentDate() {
    try {
      const data = await cashflowApi.getByDate(date)
      setCashAmount(data.cash_amount || '')
      setUpiAmount(data.upi_amount || '')
    } catch (err) {
      console.error('Failed to load date:', err)
    }
  }

  async function handleSave() {
    try {
      await cashflowApi.save({
        date,
        cash_amount: parseFloat(cashAmount) || 0,
        upi_amount: parseFloat(upiAmount) || 0
      })
      loadEntries()
      alert('Saved!')
    } catch (err) {
      console.error('Failed to save:', err)
      alert('Failed to save')
    }
  }

  async function handleDelete(entryDate) {
    if (confirm('Delete this entry?')) {
      await cashflowApi.delete(entryDate)
      loadEntries()
      if (entryDate === date) {
        setCashAmount('')
        setUpiAmount('')
      }
    }
  }

  const dailyTotal = (parseFloat(cashAmount) || 0) + (parseFloat(upiAmount) || 0)

  if (loading) return <div style={{ color: '#6b7280', padding: '20px' }}>Loading cash flow data...</div>

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <h3 style={styles.formTitle}>Add Daily Entry</h3>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Date</label>
            <input
              style={styles.input}
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Cash Amount</label>
            <input
              style={styles.input}
              type="number"
              value={cashAmount}
              onChange={e => setCashAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>UPI Amount</label>
            <input
              style={styles.input}
              type="number"
              value={upiAmount}
              onChange={e => setUpiAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          <button style={styles.saveBtn} onClick={handleSave}>Save Entry</button>
        </div>
        <div style={styles.total}>
          Daily Total: ₹{dailyTotal.toLocaleString()}
        </div>
      </div>

      <div style={styles.tableContainer}>
        {entries.length === 0 ? (
          <div style={styles.empty}>No cash flow entries yet. Add your first entry above.</div>
        ) : (
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Cash</th>
                <th style={styles.th}>UPI</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => {
                const total = (entry.cash_amount || 0) + (entry.upi_amount || 0)
                return (
                  <tr key={entry.date} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.date}>{entry.date}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={{...styles.amount, ...styles.cash}}>₹{entry.cash_amount?.toLocaleString()}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={{...styles.amount, ...styles.upi}}>₹{entry.upi_amount?.toLocaleString()}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.amount}>₹{total.toLocaleString()}</div>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(entry.date)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
