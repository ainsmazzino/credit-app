// format.js — shared helpers for showing money and dates.

// ₹1,20,500  — uses the Indian grouping style (lakhs / crores).
export function formatMoney(n) {
  const value = Number(n) || 0;
  return (
    '\u20B9' +
    value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  );
}

// "11 Jun 2026, 02:30 PM" — always shown in Indian Standard Time.
export function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
