import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { formatMoney, formatDateTime } from '../format.js';
import { BackIcon, ArrowUp, ArrowDown } from './Icons.jsx';

export default function CustomerDetail({ id, onBack }) {
  const [customer, setCustomer] = useState(null);
  const [txns, setTxns] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [error, setError] = useState('');

  // 'credit' = Add Purchase, 'payment' = Record Payment, null = closed
  const [modalType, setModalType] = useState(null);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  async function load() {
    setError('');
    try {
      const [c, t] = await Promise.all([api.getCustomer(id), api.customerTransactions(id)]);
      setCustomer(c);
      setTxns(t);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  function openModal(type) {
    setModalType(type);
    setAmount('');
    setModalError('');
  }

  async function saveTxn() {
    setModalError('');
    const value = Number(amount);
    if (!value || value <= 0) {
      setModalError('Enter an amount greater than 0.');
      return;
    }
    setSaving(true);
    try {
      await api.addTransaction(id, modalType, value);
      setModalType(null);
      await load(); // refresh the due and the log
    } catch (e) {
      setModalError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (error) return <div className="page"><div className="alert">{error}</div></div>;
  if (!customer) return <div className="page"><div className="muted-note">Loading\u2026</div></div>;

  return (
    <div className="page">
      <header className="detail-head">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <BackIcon />
        </button>
        <div className="detail-id">
          <div className="avatar lg">{customer.full_name.charAt(0).toUpperCase()}</div>
          <div>
            <div className="detail-name">{customer.full_name}</div>
            <div className="detail-mobile">{customer.mobile}</div>
          </div>
        </div>
      </header>

      <div className={`due-box ${customer.due > 0 ? 'owed' : 'clear'}`}>
        <span className="due-box-label">Current due</span>
        <span className="due-box-value">{formatMoney(customer.due)}</span>
      </div>

      <div className="action-row">
        <button className="action credit" onClick={() => openModal('credit')}>
          <ArrowUp size={18} />
          Add Purchase
        </button>
        <button className="action payment" onClick={() => openModal('payment')}>
          <ArrowDown size={18} />
          Record Payment
        </button>
      </div>

      <button className="ghost-btn" onClick={() => setShowLog((v) => !v)}>
        {showLog ? 'Hide transactions' : 'Show transactions'}
      </button>

      {showLog && (
        <div className="log">
          {txns.length === 0 ? (
            <div className="muted-note">No transactions yet.</div>
          ) : (
            txns.map((t) => <TxnRow key={t.id} t={t} />)
          )}
        </div>
      )}

      {modalType && (
        <div className="modal-backdrop" onClick={() => !saving && setModalType(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {modalType === 'credit' ? 'Add Purchase' : 'Record Payment'}
            </h3>
            <p className="modal-sub">
              {modalType === 'credit'
                ? 'Amount of credit you are giving.'
                : 'Amount the customer is paying back.'}
            </p>
            <div className="amount-field">
              <span>&#x20B9;</span>
              <input
                type="number"
                inputMode="decimal"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            {modalError && <div className="alert">{modalError}</div>}
            <div className="modal-actions">
              <button className="btn-light" onClick={() => setModalType(null)} disabled={saving}>
                Cancel
              </button>
              <button
                className={modalType === 'credit' ? 'btn-credit' : 'btn-payment'}
                onClick={saveTxn}
                disabled={saving}
              >
                {saving ? 'Saving\u2026' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TxnRow({ t }) {
  const isCredit = t.type === 'credit';
  return (
    <div className="txn">
      <div className={`txn-icon ${isCredit ? 'credit' : 'payment'}`}>
        {isCredit ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
      </div>
      <div className="txn-info">
        <div className="txn-type">{isCredit ? 'Purchase (credit given)' : 'Payment received'}</div>
        <div className="txn-date">{formatDateTime(t.created_at)}</div>
      </div>
      <div className={`txn-amount ${isCredit ? 'up' : 'down'}`}>
        {isCredit ? '+' : '\u2212'}
        {formatMoney(t.amount)}
      </div>
    </div>
  );
}
