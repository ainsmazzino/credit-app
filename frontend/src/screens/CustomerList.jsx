import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { formatMoney } from '../format.js';
import { SearchIcon, ChevronRight } from './Icons.jsx';

export default function CustomerList({ onOpen }) {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState(null);
  const [error, setError] = useState('');

  async function load(term) {
    setError('');
    try {
      setCustomers(await api.listCustomers(term));
    } catch (e) {
      setError(e.message);
    }
  }

  // Load on mount, and re-search 300ms after the user stops typing.
  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Customers</p>
          <h2 className="page-title">All customers</h2>
        </div>
      </header>

      <div className="searchbar">
        <SearchIcon />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or mobile"
          autoCapitalize="none"
        />
      </div>

      {error && <div className="alert">{error}</div>}

      {customers === null ? (
        <div className="muted-note">Loading\u2026</div>
      ) : customers.length === 0 ? (
        <div className="empty">
          <p className="empty-title">No customers yet</p>
          <p className="empty-text">Tap the + button below to add your first customer.</p>
        </div>
      ) : (
        <div className="list">
          {customers.map((c) => (
            <button key={c.id} className="cust-row" onClick={() => onOpen(c.id)}>
              <div className="avatar">{c.full_name.charAt(0).toUpperCase()}</div>
              <div className="cust-info">
                <div className="cust-name">{c.full_name}</div>
                <div className="cust-mobile">{c.mobile}</div>
              </div>
              <div className="cust-right">
                <div className={c.due > 0 ? 'due owed' : 'due clear'}>{formatMoney(c.due)}</div>
                <ChevronRight />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
