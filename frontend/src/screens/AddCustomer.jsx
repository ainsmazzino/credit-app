import { useState } from 'react';
import { api } from '../api.js';

export default function AddCustomer({ onDone }) {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setError('');
    if (!fullName.trim() || !mobile.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    setSaving(true);
    try {
      await api.addCustomer(fullName.trim(), mobile.trim());
      onDone(); // go back to the customer list
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">New customer</p>
          <h2 className="page-title">Add a customer</h2>
        </div>
      </header>

      <div className="form-card">
        <label className="field-label">Full name</label>
        <input
          className="field"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Ramesh Kumar"
        />

        <label className="field-label">Mobile number</label>
        <input
          className="field"
          type="tel"
          inputMode="numeric"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="e.g. 9876543210"
        />
        <p className="hint">This mobile number becomes the customer's login.</p>

        {error && <div className="alert">{error}</div>}

        <button className="btn-primary full" onClick={save} disabled={saving}>
          {saving ? 'Saving\u2026' : 'Save customer'}
        </button>
      </div>
    </div>
  );
}
