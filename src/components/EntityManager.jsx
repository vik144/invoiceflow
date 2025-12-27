import React, { useState, useEffect } from 'react'
import { entitiesApi } from '../api'
import EntityModal from './EntityModal'

const styles = {
  container: {
    padding: '32px',
    maxWidth: '1200px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#ffffff'
  },
  btn: {
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    border: 'none'
  },
  btnPrimary: {
    background: '#6366f1',
    color: '#ffffff'
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '1px solid #1e1e1e',
    paddingBottom: '0'
  },
  tab: {
    padding: '12px 20px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  tabActive: {
    color: '#6366f1',
    borderBottomColor: '#6366f1'
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
    borderBottom: '1px solid #1e1e1e',
    transition: 'background 0.2s ease'
  },
  td: {
    padding: '20px',
    fontSize: '14px',
    color: '#e5e7eb'
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
  badgeCompany: {
    background: 'rgba(99, 102, 241, 0.1)',
    color: '#6366f1',
    border: '1px solid rgba(99, 102, 241, 0.2)'
  },
  badgeDistributor: {
    background: 'rgba(139, 92, 246, 0.1)',
    color: '#8b5cf6',
    border: '1px solid rgba(139, 92, 246, 0.2)'
  },
  badgeBoth: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.2)'
  },
  actions: {
    display: 'flex',
    gap: '8px'
  },
  btnSecondary: {
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    background: 'transparent',
    color: '#9ca3af',
    border: '1px solid #374151',
    transition: 'all 0.2s ease'
  },
  btnDanger: {
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    background: 'transparent',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    transition: 'all 0.2s ease'
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280',
    fontSize: '14px'
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
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
  }
}

export default function EntityManager() {
  const [entities, setEntities] = useState([])
  const [filteredEntities, setFilteredEntities] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingEntity, setEditingEntity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    loadEntities()
  }, [])

  useEffect(() => {
    filterEntities()
  }, [activeTab, entities])

  async function loadEntities() {
    setLoading(true)
    try {
      const data = await entitiesApi.getAll()
      setEntities(data)
    } catch (error) {
      showToast('Failed to load entities')
    } finally {
      setLoading(false)
    }
  }

  function filterEntities() {
    if (activeTab === 'all') {
      setFilteredEntities(entities)
    } else if (activeTab === 'companies') {
      setFilteredEntities(entities.filter(e => e.type === 'company' || e.type === 'both'))
    } else if (activeTab === 'distributors') {
      setFilteredEntities(entities.filter(e => e.type === 'distributor' || e.type === 'both'))
    }
  }

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  function handleAdd() {
    setEditingEntity(null)
    setShowModal(true)
  }

  function handleEdit(entity) {
    setEditingEntity(entity)
    setShowModal(true)
  }

  async function handleSave(data) {
    try {
      if (editingEntity) {
        await entitiesApi.update(editingEntity.id, data)
        showToast('Entity updated successfully')
      } else {
        await entitiesApi.create(data)
        showToast('Entity added successfully')
      }
      setShowModal(false)
      setEditingEntity(null)
      loadEntities()
    } catch (error) {
      showToast(error.message || 'Failed to save entity')
    }
  }

  async function handleDelete(entity) {
    if (!confirm(`Are you sure you want to delete "${entity.name}"?`)) return

    try {
      const result = await entitiesApi.delete(entity.id)
      if (result.deactivated) {
        showToast('Entity deactivated (has existing invoices)')
      } else {
        showToast('Entity deleted successfully')
      }
      loadEntities()
    } catch (error) {
      showToast('Failed to delete entity')
    }
  }

  function getBadgeStyle(type) {
    if (type === 'company') return styles.badgeCompany
    if (type === 'distributor') return styles.badgeDistributor
    return styles.badgeBoth
  }

  function getTypeLabel(type) {
    if (type === 'both') return 'Company & Distributor'
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Companies & Distributors</div>
        <button
          style={{...styles.btn, ...styles.btnPrimary}}
          onClick={handleAdd}
        >
          + Add Entity
        </button>
      </div>

      <div style={styles.tabs}>
        <button
          style={{...styles.tab, ...(activeTab === 'all' ? styles.tabActive : {})}}
          onClick={() => setActiveTab('all')}
        >
          All ({entities.length})
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'companies' ? styles.tabActive : {})}}
          onClick={() => setActiveTab('companies')}
        >
          Companies ({entities.filter(e => e.type === 'company' || e.type === 'both').length})
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'distributors' ? styles.tabActive : {})}}
          onClick={() => setActiveTab('distributors')}
        >
          Distributors ({entities.filter(e => e.type === 'distributor' || e.type === 'both').length})
        </button>
      </div>

      {filteredEntities.length === 0 ? (
        <div style={styles.tableContainer}>
          <div style={styles.empty}>
            No entities yet. Click "Add Entity" to get started.
          </div>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntities.map(entity => (
                <tr key={entity.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: '500' }}>{entity.name}</div>
                  </td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, ...getBadgeStyle(entity.type)}}>
                      {getTypeLabel(entity.type)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        style={styles.btnSecondary}
                        onClick={() => handleEdit(entity)}
                      >
                        Edit
                      </button>
                      <button
                        style={styles.btnDanger}
                        onClick={() => handleDelete(entity)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <EntityModal
          entity={editingEntity}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false)
            setEditingEntity(null)
          }}
        />
      )}

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  )
}
