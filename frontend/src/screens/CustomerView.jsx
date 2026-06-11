import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { formatMoney, formatDateTime } from '../format.js';
import { ArrowUp, ArrowDown, LogoutIcon } from './Icons.jsx';

export default function CustomerView({ customer, onLogout }) {
  const [profile, setProfile] = useState(customer || null);
  const [txns, setTxns] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setError('');
      try {
        const [me, t] = await Promise.all([api.myProfile(), api.myTransactions()]);
        setProfile(me);
        setTxns(t);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  return (
    <div className="customer-shell">
      <header className="cust-header">
        <div className="cust-header-top">
          <div>
            <div className="cust-hi">{profile ? profile.full_name : '\u2026'}</div>
            <div className="cust-num">{profile ? profile.mobile : ''}</div>
          </div>
          <button className="icon-btn light" onClick={onLogout} aria-label="Log out">
            <LogoutIcon />
          </button>
        </div>

        <div className="cust-due">
          <span className="cust-due-label">Your current due</span>
          <span className="cust-due-value">
            {profile ? formatMoney(profile.due) : '\u2026'}
          </span>
        </div>
      </header>

      <div className="page no-tabbar">
        <p className="eyebrow">History</p>
        <h2 className="page-title small">Your transactions</h2>

        {error && <div className="alert">{error}</div>}

        {txns === null ? (
          <div className="muted-note">Loading\u2026</div>
        ) : txns.length === 0 ? (
          <div className="empty">
            <p className="empty-title">No transactions yet</p>
            <p className="empty-text">Your purchases and payments will appear here.</p>
          </div>
        ) : (
          <div className="log">
            {txns.map((t) => {
              const isCredit = t.type === 'credit';
              return (
                <div key={t.id} className="txn">
                  <div className={`txn-icon ${isCredit ? 'credit' : 'payment'}`}>
                    {isCredit ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  </div>
                  <div className="txn-info">
                    <div className="txn-type">{isCredit ? 'Credit taken' : 'Payment made'}</div>
                    <div className="txn-date">{formatDateTime(t.created_at)}</div>
                  </div>
                  <div className={`txn-amount ${isCredit ? 'up' : 'down'}`}>
                    {isCredit ? '+' : '\u2212'}
                    {formatMoney(t.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
