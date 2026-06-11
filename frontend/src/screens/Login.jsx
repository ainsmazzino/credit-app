import { useState } from 'react';
import { api } from '../api.js';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('admin'); // 'admin' | 'customer'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError('');
    setLoading(true);
    try {
      const result =
        mode === 'admin'
          ? await api.adminLogin(username.trim(), password)
          : await api.customerLogin(mobile.trim());
      onLogin(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') submit();
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-mark">&#x20B9;</div>
          <h1>V.V Stores</h1>
          <p>Credit Manager</p>
        </div>

        <div className="seg">
          <button
            className={mode === 'admin' ? 'seg-btn on' : 'seg-btn'}
            onClick={() => {
              setMode('admin');
              setError('');
            }}
          >
            Admin
          </button>
          <button
            className={mode === 'customer' ? 'seg-btn on' : 'seg-btn'}
            onClick={() => {
              setMode('customer');
              setError('');
            }}
          >
            Customer
          </button>
        </div>

        {mode === 'admin' ? (
          <>
            <label className="field-label">Username</label>
            <input
              className="field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="admin"
              autoCapitalize="none"
            />
            <label className="field-label">Password</label>
            <input
              className="field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Enter password"
            />
          </>
        ) : (
          <>
            <label className="field-label">Mobile number</label>
            <input
              className="field"
              type="tel"
              inputMode="numeric"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Enter your mobile number"
            />
            <p className="hint">No password needed — just your mobile number.</p>
          </>
        )}

        {error && <div className="alert">{error}</div>}

        <button className="btn-primary full" onClick={submit} disabled={loading}>
          {loading ? 'Please wait\u2026' : 'Log in'}
        </button>
      </div>
    </div>
  );
}
