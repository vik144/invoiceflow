import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import InvoiceTab from './components/InvoiceTab'
import CashFlowTab from './components/CashFlowTab'
import Settings from './components/Settings'
import ProfitSummary from './components/ProfitSummary'
import EntityManager from './components/EntityManager'

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0a0a0a'
  },
  mainContent: {
    marginLeft: '260px',
    flex: 1,
    background: '#0a0a0a'
  },
  header: {
    padding: '24px 40px',
    borderBottom: '1px solid #1e1e1e',
    background: '#0f0f0f'
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '4px'
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#6b7280'
  },
  content: {
    padding: '32px 40px'
  }
}

const pageInfo = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Overview of your business metrics'
  },
  invoices: {
    title: 'Invoices',
    subtitle: 'Manage your invoices and track payments'
  },
  entities: {
    title: 'Companies & Distributors',
    subtitle: 'Manage your business contacts'
  },
  cashflow: {
    title: 'Cash Flow',
    subtitle: 'Track daily revenue and expenses'
  },
  settings: {
    title: 'Settings',
    subtitle: 'Configure your account and preferences'
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div style={styles.layout}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>{pageInfo[activeTab].title}</h1>
          <p style={styles.pageSubtitle}>{pageInfo[activeTab].subtitle}</p>
        </div>

        <div style={styles.content}>
          {activeTab === 'dashboard' && <ProfitSummary />}
          {activeTab === 'invoices' && <InvoiceTab />}
          {activeTab === 'entities' && <EntityManager />}
          {activeTab === 'cashflow' && <CashFlowTab />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </div>
    </div>
  )
}
