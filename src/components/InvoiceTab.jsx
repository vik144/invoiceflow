import React, { useState, useEffect } from 'react'
import { invoicesApi, entitiesApi } from '../api'
import InvoiceForm from './InvoiceForm'
import InvoiceList from './InvoiceList'
import ExportModal from './ExportModal'

export default function InvoiceTab() {
  const [invoices, setInvoices] = useState([])
  const [companies, setCompanies] = useState([])
  const [distributors, setDistributors] = useState([])
  const [filters, setFilters] = useState({ company_id: '', status: '' })
  const [showForm, setShowForm] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntities()
    loadInvoices()
  }, [])

  useEffect(() => {
    loadInvoices()
  }, [filters])

  async function loadEntities() {
    try {
      const [companiesData, distributorsData] = await Promise.all([
        entitiesApi.getCompanies(),
        entitiesApi.getDistributors()
      ])
      setCompanies(companiesData)
      setDistributors(distributorsData)
    } catch (err) {
      console.error('Failed to load entities:', err)
    }
  }

  async function loadInvoices() {
    try {
      const data = await invoicesApi.getAll(filters)
      setInvoices(data)
    } catch (err) {
      console.error('Failed to load invoices:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddEntity(data) {
    try {
      await entitiesApi.create(data)
      await loadEntities()
    } catch (err) {
      console.error('Failed to add entity:', err)
      throw err
    }
  }

  async function handleSave(data) {
    await invoicesApi.create(data)
    setShowForm(false)
    loadInvoices()
  }

  async function handleMarkPaid(id, isPaid) {
    await invoicesApi.markPaid(id, isPaid)
    loadInvoices()
  }

  async function handleDelete(id) {
    if (confirm('Delete this invoice?')) {
      await invoicesApi.delete(id)
      loadInvoices()
    }
  }

  function handleFilterChange(newFilters) {
    setFilters(newFilters)
  }

  function handleClearFilters() {
    setFilters({ company_id: '', status: '' })
  }

  if (loading) return <div style={{ color: '#6b7280', padding: '20px' }}>Loading invoices...</div>

  return (
    <div>
      {!showForm ? (
        <>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: '12px 24px',
                background: '#6366f1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}
            >
              + New Invoice
            </button>
            <button
              onClick={() => setShowExport(true)}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: '#9ca3af',
                border: '1px solid #374151',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              Export CSV
            </button>
          </div>
          {showExport && <ExportModal onClose={() => setShowExport(false)} />}
          <InvoiceList
            invoices={invoices}
            companies={companies}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onMarkPaid={handleMarkPaid}
            onDelete={handleDelete}
          />
        </>
      ) : (
        <InvoiceForm
          companies={companies}
          distributors={distributors}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          onAddEntity={handleAddEntity}
        />
      )}
    </div>
  )
}
