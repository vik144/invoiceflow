import React, { useState, useEffect } from 'react'
import { settingsApi } from '../api'

const styles = {
  container: {
    maxWidth: '800px'
  },
  section: {
    marginBottom: '24px',
    background: '#0f0f0f',
    padding: '28px',
    borderRadius: '12px',
    border: '1px solid #1e1e1e'
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#ffffff'
  },
  description: {
    color: '#9ca3af',
    marginBottom: '24px',
    fontSize: '14px',
    lineHeight: '1.6'
  },
  field: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontWeight: '500',
    fontSize: '13px',
    color: '#9ca3af',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #1e1e1e',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#0a0a0a',
    color: '#e5e7eb',
    outline: 'none',
    transition: 'border 0.2s ease'
  },
  hint: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '8px',
    lineHeight: '1.5'
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
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    transition: 'all 0.2s ease'
  },
  testBtn: {
    padding: '12px 24px',
    background: 'transparent',
    color: '#6366f1',
    border: '1px solid #6366f1',
    borderRadius: '8px',
    cursor: 'pointer',
    marginLeft: '12px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  success: {
    color: '#10b981',
    marginLeft: '12px',
    fontSize: '14px',
    fontWeight: '500'
  }
}

export default function Settings() {
  const [settings, setSettings] = useState({
    email_user: '',
    email_pass: '',
    reminder_email: '',
    dad_email: ''
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const data = await settingsApi.getAll()
      setSettings(prev => ({ ...prev, ...data }))
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      for (const [key, value] of Object.entries(settings)) {
        await settingsApi.save(key, value)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Failed to save settings:', err)
      alert('Failed to save')
    }
  }

  function updateSetting(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) return <div style={{ color: '#6b7280', padding: '20px' }}>Loading settings...</div>

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <div style={styles.title}>Email Notifications</div>
        <p style={styles.description}>
          Configure email settings to receive automated payment reminders. Uses Gmail SMTP for sending notifications.
        </p>

        <div style={styles.field}>
          <label style={styles.label}>Gmail Address</label>
          <input
            style={styles.input}
            type="email"
            value={settings.email_user}
            onChange={e => updateSetting('email_user', e.target.value)}
            placeholder="your-email@gmail.com"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>App Password</label>
          <input
            style={styles.input}
            type="password"
            value={settings.email_pass}
            onChange={e => updateSetting('email_pass', e.target.value)}
            placeholder="xxxx xxxx xxxx xxxx"
          />
          <div style={styles.hint}>
            Generate an App Password at: Google Account → Security → 2-Step Verification → App passwords
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Send Reminders To</label>
          <input
            style={styles.input}
            type="email"
            value={settings.reminder_email}
            onChange={e => updateSetting('reminder_email', e.target.value)}
            placeholder="your-email@gmail.com"
          />
          <div style={styles.hint}>
            Email address where payment reminder notifications will be sent
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.title}>Contact Information</div>
        <p style={styles.description}>
          Configure contact details for invoice sharing and communications.
        </p>
        <div style={styles.field}>
          <label style={styles.label}>Dad's Email</label>
          <input
            style={styles.input}
            type="email"
            value={settings.dad_email}
            onChange={e => updateSetting('dad_email', e.target.value)}
            placeholder="dad@email.com"
          />
          <div style={styles.hint}>
            This email address will be used when sharing invoice summaries
          </div>
        </div>
      </div>

      <div>
        <button style={styles.saveBtn} onClick={handleSave}>
          Save Settings
        </button>
        {saved && <span style={styles.success}>Settings saved successfully!</span>}
      </div>
    </div>
  )
}
