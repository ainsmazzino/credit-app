// server.js — the whole API lives here.
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { pool, initDb } from './db.js';

dotenv.config();

const app = express();
app.use(cors());            // lets the Vercel frontend talk to this backend
app.use(express.json());    // lets us read JSON request bodies

// ---- Settings (read from environment variables, with safe fallbacks) ----
const JWT_SECRET     = process.env.JWT_SECRET     || 'change-this-to-a-long-random-string';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// ============================================================
//  Login checks (middleware) — they run before protected routes
// ============================================================

// Allows the request through only if a valid ADMIN token is present.
function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Please log in again.' });
  }
}

// Allows the request through only if a valid CUSTOMER token is present.
function requireCustomer(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'customer') return res.status(403).json({ error: 'Customers only.' });
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Please log in again.' });
  }
}

// ============================================================
//  Public routes
// ============================================================

// Health check — visiting the backend URL in a browser shows this.
app.get('/', (req, res) => res.json({ status: 'Credit Book backend is running.' }));

// Admin login — checks the hardcoded username + password.
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '30d' });
    return res.json({ token, role: 'admin' });
  }
  return res.status(401).json({ error: 'Wrong username or password.' });
});

// Customer login — only a mobile number, no password.
app.post('/api/customer/login', async (req, res) => {
  const mobile = (req.body.mobile || '').trim();
  if (!mobile) return res.status(400).json({ error: 'Enter your mobile number.' });

  const result = await pool.query('SELECT * FROM customers WHERE mobile = $1', [mobile]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'No account found for this mobile number.' });
  }

  const c = result.rows[0];
  const token = jwt.sign({ role: 'customer', customerId: c.id }, JWT_SECRET, { expiresIn: '30d' });
  return res.json({
    token,
    role: 'customer',
    customer: { id: c.id, full_name: c.full_name, mobile: c.mobile },
  });
});

// ============================================================
//  Admin routes (all need a valid admin login)
// ============================================================

// Shows the admin's own username + password on the Profile page.
app.get('/api/admin/profile', requireAdmin, (req, res) => {
  res.json({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
});

// The 4 dashboard cards.
app.get('/api/dashboard', requireAdmin, async (req, res) => {
  const customers = await pool.query('SELECT COUNT(*) FROM customers');

  // Total outstanding = all credit given minus all payments received.
  const outstanding = await pool.query(`
    SELECT COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0) AS total
    FROM transactions
  `);

  // "Today" means today's date in Indian Standard Time.
  const todayCredit = await pool.query(`
    SELECT COALESCE(SUM(amount), 0) AS total FROM transactions
    WHERE type = 'credit'
      AND (created_at AT TIME ZONE 'Asia/Kolkata')::date = (now() AT TIME ZONE 'Asia/Kolkata')::date
  `);

  const todayCollection = await pool.query(`
    SELECT COALESCE(SUM(amount), 0) AS total FROM transactions
    WHERE type = 'payment'
      AND (created_at AT TIME ZONE 'Asia/Kolkata')::date = (now() AT TIME ZONE 'Asia/Kolkata')::date
  `);

  res.json({
    totalCustomers: Number(customers.rows[0].count),
    totalOutstanding: Number(outstanding.rows[0].total),
    todayCredit: Number(todayCredit.rows[0].total),
    todayCollection: Number(todayCollection.rows[0].total),
  });
});

// Customer list with search + each customer's current due.
app.get('/api/customers', requireAdmin, async (req, res) => {
  const search = (req.query.search || '').trim();
  const like = `%${search}%`;
  const result = await pool.query(
    `
    SELECT
      c.id, c.full_name, c.mobile,
      COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount
                        WHEN t.type = 'payment' THEN -t.amount
                        ELSE 0 END), 0) AS due
    FROM customers c
    LEFT JOIN transactions t ON t.customer_id = c.id
    WHERE c.full_name ILIKE $1 OR c.mobile ILIKE $1
    GROUP BY c.id
    ORDER BY c.full_name ASC
    `,
    [like]
  );
  res.json(result.rows.map((r) => ({ ...r, due: Number(r.due) })));
});

// Add a new customer.
app.post('/api/customers', requireAdmin, async (req, res) => {
  const full_name = (req.body.full_name || '').trim();
  const mobile = (req.body.mobile || '').trim();
  if (!full_name || !mobile) {
    return res.status(400).json({ error: 'Name and mobile number are both required.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO customers (full_name, mobile) VALUES ($1, $2) RETURNING *',
      [full_name, mobile]
    );
    res.json(result.rows[0]);
  } catch (e) {
    if (e.code === '23505') {
      return res.status(409).json({ error: 'A customer with this mobile number already exists.' });
    }
    res.status(500).json({ error: 'Could not add customer.' });
  }
});

// One customer's profile + current due.
app.get('/api/customers/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const c = await pool.query('SELECT id, full_name, mobile FROM customers WHERE id = $1', [id]);
  if (c.rows.length === 0) return res.status(404).json({ error: 'Customer not found.' });

  const due = await pool.query(
    `SELECT COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0) AS due
     FROM transactions WHERE customer_id = $1`,
    [id]
  );
  res.json({ ...c.rows[0], due: Number(due.rows[0].due) });
});

// One customer's transaction history.
app.get('/api/customers/:id/transactions', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    'SELECT id, type, amount, created_at FROM transactions WHERE customer_id = $1 ORDER BY created_at DESC',
    [id]
  );
  res.json(result.rows.map((r) => ({ ...r, amount: Number(r.amount) })));
});

// Add a transaction: type is 'credit' (Add Purchase) or 'payment' (Record Payment).
// The date/time is set automatically by the database.
app.post('/api/customers/:id/transactions', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  const amount = Number(req.body.amount);

  if (!['credit', 'payment'].includes(type)) {
    return res.status(400).json({ error: 'Invalid transaction type.' });
  }
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Enter an amount greater than 0.' });
  }

  const exists = await pool.query('SELECT id FROM customers WHERE id = $1', [id]);
  if (exists.rows.length === 0) return res.status(404).json({ error: 'Customer not found.' });

  const result = await pool.query(
    'INSERT INTO transactions (customer_id, type, amount) VALUES ($1, $2, $3) RETURNING id, type, amount, created_at',
    [id, type, amount]
  );
  const row = result.rows[0];
  res.json({ ...row, amount: Number(row.amount) });
});

// Every transaction in the system (the Logs page).
app.get('/api/transactions', requireAdmin, async (req, res) => {
  const result = await pool.query(`
    SELECT t.id, t.type, t.amount, t.created_at, c.full_name, c.mobile
    FROM transactions t
    JOIN customers c ON c.id = t.customer_id
    ORDER BY t.created_at DESC
  `);
  res.json(result.rows.map((r) => ({ ...r, amount: Number(r.amount) })));
});

// ============================================================
//  Customer routes (view-only, need a valid customer login)
// ============================================================

// The logged-in customer's own profile + current due.
app.get('/api/customer/me', requireCustomer, async (req, res) => {
  const id = req.user.customerId;
  const c = await pool.query('SELECT id, full_name, mobile FROM customers WHERE id = $1', [id]);
  if (c.rows.length === 0) return res.status(404).json({ error: 'Customer not found.' });

  const due = await pool.query(
    `SELECT COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0) AS due
     FROM transactions WHERE customer_id = $1`,
    [id]
  );
  res.json({ ...c.rows[0], due: Number(due.rows[0].due) });
});

// The logged-in customer's own transaction history.
app.get('/api/customer/transactions', requireCustomer, async (req, res) => {
  const id = req.user.customerId;
  const result = await pool.query(
    'SELECT id, type, amount, created_at FROM transactions WHERE customer_id = $1 ORDER BY created_at DESC',
    [id]
  );
  res.json(result.rows.map((r) => ({ ...r, amount: Number(r.amount) })));
});

// ============================================================
//  Start the server (after the tables are ready)
// ============================================================
const PORT = process.env.PORT || 10000;
initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
