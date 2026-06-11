import { useState, useEffect } from 'react';
import Login from './screens/Login.jsx';
import AdminApp from './screens/AdminApp.jsx';
import CustomerView from './screens/CustomerView.jsx';

export default function App() {
  // null = logged out. Otherwise { token, role, customer }.
  const [auth, setAuth] = useState(null);
  const [ready, setReady] = useState(false);

  // On first load, restore the session from the browser if there is one.
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const customer = localStorage.getItem('customer');
    if (token && role) {
      setAuth({ token, role, customer: customer ? JSON.parse(customer) : null });
    }
    setReady(true);
  }, []);

  function handleLogin({ token, role, customer }) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    if (customer) localStorage.setItem('customer', JSON.stringify(customer));
    setAuth({ token, role, customer });
  }

  function handleLogout() {
    localStorage.clear();
    setAuth(null);
  }

  if (!ready) return null; // avoids a flash of the login screen on reload

  if (!auth) return <Login onLogin={handleLogin} />;
  if (auth.role === 'admin') return <AdminApp onLogout={handleLogout} />;
  return <CustomerView customer={auth.customer} onLogout={handleLogout} />;
}
