import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { formatMoney, formatDateTime } from '../format.js';
import { ArrowUp, ArrowDown } from './Icons.jsx';

export default function Logs() {
  const [txns, setTxns] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setError('');
      try {
        setTxns(await api.allTransactions());
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Activity</p>
          <h2 className="page-title">All transactions</h2>
        </div>
      </header>

      {error && <div className="alert">{error}</div>}

      {txns === null ? (
        <div className="muted-note">Loading\u2026</div>
      ) : txns.length === 0 ? (
        <div className="empty">
          <p className="empty-title">Nothing here yet</p>
          <p className="empty-text">Credits and payments will show up here as you record them.</p>
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
                  <div className="txn-type">{t.full_name}</div>
                  <div className="txn-date">
                    {isCredit ? 'Credit given' : 'Payment received'} &middot;{' '}
                    {formatDateTime(t.created_at)}
                  </div>
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
  );
}
