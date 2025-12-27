import React, { useState } from 'react'
import EntityModal from './EntityModal'

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    background: '#0f0f0f',
    padding: '32px',
    borderRadius: '12px',
    border: '1px solid #1e1e1e'
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '4px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#9ca3af',
    marginBottom: '20px'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid #1e1e1e'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px'
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
    outline: 'none',
    transition: 'border 0.2s ease'
  },
  select: {
    padding: '12px 14px',
    border: '1px solid #1e1e1e',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#0a0a0a',
    color: '#e5e7eb',
    outline: 'none',
    cursor: 'pointer',
    transition: 'border 0.2s ease'
  },
  fieldWithButton: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end'
  },
  selectContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  addEntityBtn: {
    padding: '12px 16px',
    background: 'transparent',
    color: '#6366f1',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap'
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px'
  },
  checkboxInput: {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  checkboxLabel: {
    fontSize: '13px',
    color: '#9ca3af',
    cursor: 'pointer'
  },
  tableContainer: {
    background: '#0a0a0a',
    borderRadius: '8px',
    border: '1px solid #1e1e1e',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    background: '#0f0f0f',
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #1e1e1e'
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #1e1e1e'
  },
  itemInput: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #1e1e1e',
    borderRadius: '6px',
    fontSize: '13px',
    background: '#0f0f0f',
    color: '#e5e7eb',
    outline: 'none'
  },
  addBtn: {
    padding: '10px 18px',
    background: 'transparent',
    color: '#6366f1',
    border: '1px solid #6366f1',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    marginTop: '12px'
  },
  removeBtn: {
    padding: '6px 10px',
    background: 'transparent',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s ease'
  },
  summary: {
    background: '#0a0a0a',
    padding: '24px',
    borderRadius: '8px',
    border: '1px solid #1e1e1e'
  },
  buttons: {
    display: 'flex',
    gap: '12px',
    paddingTop: '12px'
  },
  saveBtn: {
    padding: '12px 28px',
    background: '#6366f1',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
  },
  cancelBtn: {
    padding: '12px 28px',
    background: 'transparent',
    color: '#9ca3af',
    border: '1px solid #374151',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  }
}

export default function InvoiceForm({ companies, distributors, onSave, onCancel, onAddEntity }) {
  const today = new Date().toISOString().split('T')[0]
  const [invoice, setInvoice] = useState({
    invoice_number: '',
    company_id: '',
    distributor_id: '',
    date: today
  })
  const [items, setItems] = useState([
    { item_name: '', quantity: 0, price: 0, free_qty: 0 }
  ])
  const [sameAsCompany, setSameAsCompany] = useState(false)
  const [showEntityModal, setShowEntityModal] = useState(null)
  const [includeItems, setIncludeItems] = useState(false)

  function updateInvoice(field, value) {
    setInvoice(prev => ({ ...prev, [field]: value }))
    // If company changes and "same as company" is checked, update distributor
    if (field === 'company_id' && sameAsCompany) {
      setInvoice(prev => ({ ...prev, distributor_id: value }))
    }
  }

  function handleSameAsCompanyChange(checked) {
    setSameAsCompany(checked)
    if (checked && invoice.company_id) {
      setInvoice(prev => ({ ...prev, distributor_id: invoice.company_id }))
    }
  }

  function handleAddEntity(type) {
    setShowEntityModal(type)
  }

  async function handleSaveEntity(data) {
    await onAddEntity(data)
    setShowEntityModal(null)
  }

  function updateItem(index, field, value) {
    setItems(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  function addItem() {
    setItems(prev => [...prev, { item_name: '', quantity: 0, price: 0, free_qty: 0 }])
  }

  function removeItem(index) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const validItems = includeItems ? items.filter(i => i.item_name && i.quantity > 0) : []
    onSave({ ...invoice, items: validItems })
  }

  const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const totalFree = items.reduce((sum, item) => sum + (item.free_qty || 0), 0)

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <div>
        <h2 style={styles.title}>Create New Invoice</h2>
        <p style={styles.subtitle}>Fill in the invoice details and items below</p>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Invoice Details</div>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Invoice Number</label>
            <input
              style={styles.input}
              value={invoice.invoice_number}
              onChange={e => updateInvoice('invoice_number', e.target.value)}
              placeholder="INV-001"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Date</label>
            <input
              style={styles.input}
              type="date"
              value={invoice.date}
              onChange={e => updateInvoice('date', e.target.value)}
              required
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.fieldWithButton}>
            <div style={styles.selectContainer}>
              <label style={styles.label}>Company</label>
              <select
                style={styles.select}
                value={invoice.company_id}
                onChange={e => updateInvoice('company_id', e.target.value)}
                required
              >
                <option value="">Select company...</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              style={styles.addEntityBtn}
              onClick={() => handleAddEntity('company')}
            >
              + Add
            </button>
          </div>
          <div style={styles.fieldWithButton}>
            <div style={styles.selectContainer}>
              <label style={styles.label}>Distributor</label>
              <select
                style={styles.select}
                value={sameAsCompany ? invoice.company_id : invoice.distributor_id}
                onChange={e => updateInvoice('distributor_id', e.target.value)}
                disabled={sameAsCompany}
                required
              >
                <option value="">Select distributor...</option>
                {distributors.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <div style={styles.checkbox}>
                <input
                  type="checkbox"
                  id="same-as-company"
                  style={styles.checkboxInput}
                  checked={sameAsCompany}
                  onChange={e => handleSameAsCompanyChange(e.target.checked)}
                />
                <label htmlFor="same-as-company" style={styles.checkboxLabel}>
                  Same as Company
                </label>
              </div>
            </div>
            <button
              type="button"
              style={styles.addEntityBtn}
              onClick={() => handleAddEntity('distributor')}
              disabled={sameAsCompany}
            >
              + Add
            </button>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={styles.checkbox}>
            <input
              type="checkbox"
              id="include-items"
              style={styles.checkboxInput}
              checked={includeItems}
              onChange={(e) => setIncludeItems(e.target.checked)}
            />
            <label htmlFor="include-items" style={{ fontSize: '14px', fontWeight: '600', color: '#e5e7eb', cursor: 'pointer' }}>
              Include Line Items
            </label>
          </div>
        </div>

        {includeItems && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={styles.sectionTitle}>Line Items</div>
              <button type="button" style={styles.addBtn} onClick={addItem}>+ Add Item</button>
            </div>
        <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Item Name</th>
              <th style={styles.th}>Qty</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Free</th>
              <th style={styles.th}>Subtotal</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td style={styles.td}>
                  <input
                    style={styles.itemInput}
                    value={item.item_name}
                    onChange={e => updateItem(i, 'item_name', e.target.value)}
                    placeholder="Item name"
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={{...styles.itemInput, width: '70px'}}
                    type="number"
                    value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={{...styles.itemInput, width: '80px'}}
                    type="number"
                    value={item.price}
                    onChange={e => updateItem(i, 'price', parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={{...styles.itemInput, width: '60px'}}
                    type="number"
                    value={item.free_qty}
                    onChange={e => updateItem(i, 'free_qty', parseInt(e.target.value) || 0)}
                  />
                </td>
                <td style={{...styles.td, color: '#e0e0e0', fontWeight: '600'}}>
                  ₹{(item.quantity * item.price).toLocaleString()}
                </td>
                <td style={styles.td}>
                  {items.length > 1 && (
                    <button type="button" style={styles.removeBtn} onClick={() => removeItem(i)}>×</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <div style={styles.summary}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: '#9ca3af', fontSize: '14px', fontWeight: '500' }}>Invoice Total</span>
            <span style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', fontFamily: "'JetBrains Mono', monospace" }}>
              ₹{total.toLocaleString()}
            </span>
          </div>
          {totalFree > 0 && (
            <div style={{ fontSize: '13px', color: '#10b981', marginBottom: '8px' }}>
              Free items included: {totalFree}
            </div>
          )}
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Payment reminder will be sent on {new Date(new Date(invoice.date).getTime() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </div>
        </div>
        </>
        )}
      </div>

      <div style={styles.buttons}>
        <button type="submit" style={styles.saveBtn}>Save Invoice</button>
        <button type="button" style={styles.cancelBtn} onClick={onCancel}>Cancel</button>
      </div>

      {showEntityModal && (
        <EntityModal
          entity={null}
          onSave={handleSaveEntity}
          onClose={() => setShowEntityModal(null)}
        />
      )}
    </form>
  )
}
