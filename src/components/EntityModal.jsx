import React, { useState, useEffect } from 'react'

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    padding: '32px',
    width: '90%',
    maxWidth: '500px'
  },
  header: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '24px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
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
  radioGroup: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  radioOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  radio: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  radioLabel: {
    fontSize: '14px',
    color: '#e5e7eb',
    cursor: 'pointer'
  },
  buttons: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
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
    color: '#ffffff',
    flex: 1
  },
  btnSecondary: {
    background: 'transparent',
    color: '#9ca3af',
    border: '1px solid #374151',
    flex: 1
  }
}

export default function EntityModal({ entity, onSave, onClose }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('company')
  const [error, setError] = useState('')

  useEffect(() => {
    if (entity) {
      setName(entity.name || '')
      setType(entity.type || 'company')
    }
  }, [entity])

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    onSave({ name: name.trim(), type })
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          {entity ? 'Edit Entity' : 'Add New Entity'}
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Name *</label>
            <input
              type="text"
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter company or distributor name"
              autoFocus
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Type *</label>
            <div style={styles.radioGroup}>
              <label style={styles.radioOption}>
                <input
                  type="radio"
                  style={styles.radio}
                  value="company"
                  checked={type === 'company'}
                  onChange={(e) => setType(e.target.value)}
                />
                <span style={styles.radioLabel}>Company</span>
              </label>
              <label style={styles.radioOption}>
                <input
                  type="radio"
                  style={styles.radio}
                  value="distributor"
                  checked={type === 'distributor'}
                  onChange={(e) => setType(e.target.value)}
                />
                <span style={styles.radioLabel}>Distributor</span>
              </label>
              <label style={styles.radioOption}>
                <input
                  type="radio"
                  style={styles.radio}
                  value="both"
                  checked={type === 'both'}
                  onChange={(e) => setType(e.target.value)}
                />
                <span style={styles.radioLabel}>Both</span>
              </label>
            </div>
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <div style={styles.buttons}>
            <button
              type="button"
              style={{...styles.btn, ...styles.btnSecondary}}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{...styles.btn, ...styles.btnPrimary}}
            >
              {entity ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
