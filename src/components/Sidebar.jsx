import React from 'react'

const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    background: '#0f0f0f',
    borderRight: '1px solid #1e1e1e',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 100
  },
  header: {
    padding: '24px 20px',
    borderBottom: '1px solid #1e1e1e'
  },
  logo: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '11px',
    color: '#666',
    marginTop: '4px',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '0.5px'
  },
  nav: {
    padding: '20px 12px',
    flex: 1
  },
  navItem: {
    padding: '12px 16px',
    marginBottom: '4px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#888',
    transition: 'all 0.2s ease',
    fontFamily: "'JetBrains Mono', monospace"
  },
  navItemActive: {
    padding: '12px 16px',
    marginBottom: '4px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    background: '#6366f1',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    transition: 'all 0.2s ease',
    fontFamily: "'JetBrains Mono', monospace"
  },
  icon: {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px'
  }
}

export default function Sidebar({ activeTab, onTabChange }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'invoices', label: 'Invoices', icon: '📄' },
    { id: 'entities', label: 'Companies', icon: '🏢' },
    { id: 'cashflow', label: 'Cash Flow', icon: '💰' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ]

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <div style={styles.logo}>InvoiceFlow</div>
        <div style={styles.subtitle}>Business Management</div>
      </div>

      <div style={styles.nav}>
        {menuItems.map(item => (
          <div
            key={item.id}
            style={activeTab === item.id ? styles.navItemActive : styles.navItem}
            onClick={() => onTabChange(item.id)}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
