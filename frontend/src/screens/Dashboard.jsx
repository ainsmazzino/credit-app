import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { formatMoney } from '../format.js';
import { UsersIcon, WalletIcon, ArrowUp, ArrowDown } from './Icons.jsx';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      setData(await api.dashboard());
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2 className="page-title">Today at a glance</h2>
        </div>
      </header>

      {error && <div className="alert">{error}</div>}

      {!data ? (
        <div className="cards">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : (
        <div className="cards">
          <StatCard
            tone="blue"
            icon={<UsersIcon size={20} />}
            label="Total customers"
            value={data.totalCustomers}
          />
          <StatCard
            tone="wine"
            icon={<WalletIcon size={20} />}
            label="Total outstanding"
            value={formatMoney(data.totalOutstanding)}
          />
          <StatCard
            tone="amber"
            icon={<ArrowUp size={20} />}
            label="Today's credit given"
            value={formatMoney(data.todayCredit)}
          />
          <StatCard
            tone="green"
            icon={<ArrowDown size={20} />}
            label="Today's collection"
            value={formatMoney(data.todayCollection)}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({ tone, icon, label, value }) {
  return (
    <div className={`stat ${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
