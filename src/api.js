const API = '/api';

export const invoicesApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.company_id) params.set('company_id', filters.company_id);
    if (filters.status) params.set('status', filters.status);
    const query = params.toString();
    return fetch(`${API}/invoices${query ? `?${query}` : ''}`).then(r => r.json());
  },
  get: (id) => fetch(`${API}/invoices/${id}`).then(r => r.json()),
  create: (data) => fetch(`${API}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  markPaid: (id, is_paid) => fetch(`${API}/invoices/${id}/paid`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_paid })
  }).then(r => r.json()),
  delete: (id) => fetch(`${API}/invoices/${id}`, { method: 'DELETE' }).then(r => r.json()),
  getMonthlySummary: (month, year) =>
    fetch(`${API}/invoices/summary/monthly?month=${month}&year=${year}`).then(r => r.json()),
  exportCsv: ({ filter, month, year, startDate, endDate }) => {
    const params = new URLSearchParams({ filter });
    if (filter === 'monthly') {
      params.set('month', month);
      params.set('year', year);
    } else if (filter === 'range') {
      params.set('startDate', startDate);
      params.set('endDate', endDate);
    }
    window.open(`${API}/invoices/export/csv?${params.toString()}`);
  }
};

export const cashflowApi = {
  getAll: () => fetch(`${API}/cashflow`).then(r => r.json()),
  getByDate: (date) => fetch(`${API}/cashflow/date/${date}`).then(r => r.json()),
  save: (data) => fetch(`${API}/cashflow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  delete: (date) => fetch(`${API}/cashflow/${date}`, { method: 'DELETE' }).then(r => r.json()),
  getMonthlySummary: (month, year) =>
    fetch(`${API}/cashflow/summary/monthly?month=${month}&year=${year}`).then(r => r.json())
};

export const settingsApi = {
  getAll: () => fetch(`${API}/settings`).then(r => r.json()),
  save: (key, value) => fetch(`${API}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value })
  }).then(r => r.json())
};

export const entitiesApi = {
  getAll: (type) => {
    const query = type ? `?type=${type}` : '';
    return fetch(`${API}/entities${query}`).then(r => r.json());
  },
  getCompanies: () => fetch(`${API}/entities/companies`).then(r => r.json()),
  getDistributors: () => fetch(`${API}/entities/distributors`).then(r => r.json()),
  get: (id) => fetch(`${API}/entities/${id}`).then(r => r.json()),
  create: (data) => fetch(`${API}/entities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  update: (id, data) => fetch(`${API}/entities/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  delete: (id) => fetch(`${API}/entities/${id}`, { method: 'DELETE' }).then(r => r.json())
};
