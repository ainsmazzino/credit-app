// api.js — every call to the backend goes through here.
// VITE_API_URL is the address of your Render backend. During local
// development it falls back to your computer.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

export const api = {
  // auth
  adminLogin: (username, password) =>
    request('/api/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  customerLogin: (mobile) =>
    request('/api/customer/login', { method: 'POST', body: JSON.stringify({ mobile }) }),

  // admin
  dashboard: () => request('/api/dashboard'),
  listCustomers: (search = '') => request(`/api/customers?search=${encodeURIComponent(search)}`),
  addCustomer: (full_name, mobile) =>
    request('/api/customers', { method: 'POST', body: JSON.stringify({ full_name, mobile }) }),
  getCustomer: (id) => request(`/api/customers/${id}`),
  customerTransactions: (id) => request(`/api/customers/${id}/transactions`),
  addTransaction: (id, type, amount) =>
    request(`/api/customers/${id}/transactions`, {
      method: 'POST',
      body: JSON.stringify({ type, amount }),
    }),
  allTransactions: () => request('/api/transactions'),
  adminProfile: () => request('/api/admin/profile'),

  // customer (view only)
  myProfile: () => request('/api/customer/me'),
  myTransactions: () => request('/api/customer/transactions'),
};
