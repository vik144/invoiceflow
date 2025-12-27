import React, { useState, useEffect } from 'react'

const styles = {
  container: {
    background: '#0f0f0f',
    borderRadius: '12px',
    border: '1px solid #1e1e1e'
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
    borderBottom: '1px solid #1e1e1e',
    transition: 'background 0.2s ease'
  },
  trHover: {
    background: '#0a0a0a'
  },
  td: {
    padding: '20px',
    fontSize: '14px',
    color: '#e5e7eb'
  },
  invoiceNum: {
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: "'JetBrains Mono', monospace"
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'inline-block'
  },
  badgePaid: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.2)'
  },
  badgeUnpaid: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)'
  },
  amount: {
    fontWeight: '600',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '15px'
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  btn: {
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    border: '1px solid transparent'
  },
  btnPrimary: {
    background: '#6366f1',
    color: '#ffffff',
    border: 'none'
  },
  btnSecondary: {
    background: 'transparent',
    color: '#9ca3af',
    border: '1px solid #374151'
  },
  btnDanger: {
    background: 'transparent',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)'
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280',
    fontSize: '14px'
  },
  itemsPreview: {
    fontSize: '13px',
    color: '#9ca3af',
    marginTop: '4px'
  },
  shareContainer: {
    position: 'relative',
    display: 'inline-block'
  },
  shareDropdown: {
    position: 'absolute',
    bottom: '100%',
    left: '0',
    marginBottom: '4px',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '4px 0',
    minWidth: '140px',
    zIndex: 1000,
    boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.4)'
  },
  shareOption: {
    padding: '10px 14px',
    fontSize: '13px',
    color: '#e5e7eb',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background 0.15s ease'
  },
  shareOptionHover: {
    background: '#2a2a2a'
  },
  btnCopy: {
    background: 'transparent',
    color: '#6366f1',
    border: '1px solid rgba(99, 102, 241, 0.3)'
  },
  toast: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: '#1a1a1a',
    color: '#e5e7eb',
    padding: '12px 20px',
    borderRadius: '8px',
    border: '1px solid #333',
    fontSize: '14px',
    zIndex: 2000,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
    animation: 'fadeIn 0.2s ease'
  },
  filterBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    alignItems: 'center'
  },
  filterSelect: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #1e1e1e',
    fontSize: '14px',
    background: '#0f0f0f',
    color: '#e5e7eb',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '180px'
  },
  clearFiltersBtn: {
    padding: '10px 16px',
    background: 'transparent',
    color: '#9ca3af',
    border: '1px solid #374151',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  }
}

function formatInvoiceForSharing(invoice) {
  const itemsList = invoice.items.map(i =>
    `${i.item_name}: ${i.quantity} x ₹${i.price} = ₹${i.quantity * i.price}${i.free_qty ? ` (+${i.free_qty} free)` : ''}`
  ).join('\n')

  const totalFree = invoice.items.reduce((sum, i) => sum + (i.free_qty || 0), 0)

  return `Invoice #${invoice.invoice_number}
━━━━━━━━━━━━━━━━━━━━
Company: ${invoice.company}
Distributor: ${invoice.distributor}
Date: ${invoice.date}

Items:
${itemsList}

Total: ₹${invoice.total_amount}
Free items: ${totalFree}
━━━━━━━━━━━━━━━━━━━━`
}

function formatQuickCopy(invoice) {
  const status = invoice.is_paid ? '✓ Paid' : '○ Unpaid'

  return `Invoice #${invoice.invoice_number}
Amount: ₹${invoice.total_amount?.toLocaleString()}
Date: ${invoice.date}
Status: ${status}`
}

export default function InvoiceList({ invoices, companies, filters, onFilterChange, onClearFilters, onMarkPaid, onDelete }) {
  const [openShareMenu, setOpenShareMenu] = useState(null)
  const [toast, setToast] = useState(null)

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (openShareMenu && !e.target.closest('.share-container')) {
        setOpenShareMenu(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openShareMenu])

  function handleQuickCopy(invoice) {
    const text = formatQuickCopy(invoice)
    navigator.clipboard.writeText(text).then(() => {
      showToast('Invoice details copied!')
    })
  }

  function handleShareEmail(invoice) {
    const text = formatInvoiceForSharing(invoice)
    const subject = encodeURIComponent(`Invoice #${invoice.invoice_number} - ₹${invoice.total_amount}`)
    const body = encodeURIComponent(text)
    window.open(`mailto:?subject=${subject}&body=${body}`)
    setOpenShareMenu(null)
  }

  function handleShareWhatsApp(invoice) {
    const text = formatInvoiceForSharing(invoice)
    const encoded = encodeURIComponent(text)
    window.open(`https://wa.me/?text=${encoded}`)
    setOpenShareMenu(null)
  }

  function handleCopyFull(invoice) {
    const text = formatInvoiceForSharing(invoice)
    navigator.clipboard.writeText(text).then(() => {
      showToast('Full invoice copied!')
    })
    setOpenShareMenu(null)
  }

  function toggleShareMenu(invoiceId) {
    setOpenShareMenu(openShareMenu === invoiceId ? null : invoiceId)
  }

  if (invoices.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>No invoices yet. Create your first invoice to get started.</div>
      </div>
    )
  }

  const hasActiveFilters = filters.company_id || filters.status

  return (
    <>
      <div style={styles.filterBar}>
        <select
          style={styles.filterSelect}
          value={filters.company_id}
          onChange={(e) => onFilterChange({ ...filters, company_id: e.target.value })}
        >
          <option value="">All Companies</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          style={styles.filterSelect}
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </select>

        {hasActiveFilters && (
          <button style={styles.clearFiltersBtn} onClick={onClearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      <div style={styles.container}>
        <table style={styles.table}>
        <thead style={styles.thead}>
          <tr>
            <th style={styles.th}>Invoice</th>
            <th style={styles.th}>Company</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Items</th>
            <th style={styles.th}>Amount</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(invoice => {
            const totalFree = invoice.items?.reduce((sum, i) => sum + (i.free_qty || 0), 0) || 0
            const itemsSummary = invoice.items?.slice(0, 2).map(i => i.item_name).join(', ') || ''
            const moreItems = invoice.items?.length > 2 ? ` +${invoice.items.length - 2}` : ''

            return (
              <tr key={invoice.id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.invoiceNum}>#{invoice.invoice_number}</div>
                  {!invoice.is_paid && invoice.reminder_date && (
                    <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px' }}>
                      Due: {invoice.reminder_date}
                    </div>
                  )}
                </td>
                <td style={styles.td}>
                  <div>{invoice.company}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                    {invoice.distributor}
                  </div>
                </td>
                <td style={styles.td}>{invoice.date}</td>
                <td style={styles.td}>
                  <div style={styles.itemsPreview}>
                    {itemsSummary}{moreItems}
                  </div>
                  {totalFree > 0 && (
                    <div style={{ fontSize: '11px', color: '#10b981', marginTop: '2px' }}>
                      +{totalFree} free items
                    </div>
                  )}
                </td>
                <td style={styles.td}>
                  <div style={styles.amount}>₹{invoice.total_amount?.toLocaleString()}</div>
                </td>
                <td style={styles.td}>
                  <span style={{...styles.badge, ...(invoice.is_paid ? styles.badgePaid : styles.badgeUnpaid)}}>
                    {invoice.is_paid ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    {invoice.is_paid ? (
                      <button
                        style={{...styles.btn, ...styles.btnSecondary}}
                        onClick={() => onMarkPaid(invoice.id, false)}
                      >
                        Mark Unpaid
                      </button>
                    ) : (
                      <button
                        style={{...styles.btn, ...styles.btnPrimary}}
                        onClick={() => onMarkPaid(invoice.id, true)}
                      >
                        Mark Paid
                      </button>
                    )}
                    <button
                      style={{...styles.btn, ...styles.btnCopy}}
                      onClick={() => handleQuickCopy(invoice)}
                      title="Copy invoice number, amount & discount"
                    >
                      Copy
                    </button>
                    <div className="share-container" style={styles.shareContainer}>
                      <button
                        style={{...styles.btn, ...styles.btnSecondary}}
                        onClick={() => toggleShareMenu(invoice.id)}
                      >
                        Share ▾
                      </button>
                      {openShareMenu === invoice.id && (
                        <div style={styles.shareDropdown}>
                          <div
                            style={styles.shareOption}
                            onClick={() => handleShareEmail(invoice)}
                            onMouseEnter={(e) => e.target.style.background = '#2a2a2a'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            ✉️ Email
                          </div>
                          <div
                            style={styles.shareOption}
                            onClick={() => handleShareWhatsApp(invoice)}
                            onMouseEnter={(e) => e.target.style.background = '#2a2a2a'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            💬 WhatsApp
                          </div>
                          <div
                            style={styles.shareOption}
                            onClick={() => handleCopyFull(invoice)}
                            onMouseEnter={(e) => e.target.style.background = '#2a2a2a'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            📋 Copy All
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      style={{...styles.btn, ...styles.btnDanger}}
                      onClick={() => onDelete(invoice.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
    </>
  )
}
