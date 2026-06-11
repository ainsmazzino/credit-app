# Credit Book (Khata) — Mobile Web App

A mobile-first credit ledger for tracking customer dues in Indian Rupees (₹).
One **admin** manages customers and records credit/payments. Each **customer**
logs in with just their mobile number to view their own running balance.

- **Backend:** Node.js + Express + PostgreSQL → deploy on **Render**
- **Database:** **Neon** (free Postgres that never expires)
- **Frontend:** React + Vite → deploy on **Vercel**

---

## Folder structure

```
credit-app/
├── backend/            ← deploy this folder to Render
│   ├── server.js       ← all API routes
│   ├── db.js           ← database connection + table creation
│   ├── package.json
│   ├── .env.example    ← copy to .env for local testing
│   └── .gitignore
└── frontend/           ← deploy this folder to Vercel
    ├── src/            ← React app
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── .env.example    ← copy to .env for local testing
    └── .gitignore
```

Both folders live in **one** GitHub repository. On Render you set the
**Root Directory** to `backend`; on Vercel you set it to `frontend`.

---

## How login works

- **Admin:** one hardcoded account. Username/password come from environment
  variables `ADMIN_USERNAME` / `ADMIN_PASSWORD`. Defaults are `admin` / `admin123`.
- **Customer:** no password and no signup. The admin adds a customer with a name
  and mobile number; that mobile number is the customer's login.

---

## Environment variables

### Backend (set on Render)

| Variable         | Example                                   | Notes                                  |
|------------------|-------------------------------------------|----------------------------------------|
| `DATABASE_URL`   | `postgresql://user:pass@host/db?sslmode=require` | The **pooled** connection string from Neon |
| `JWT_SECRET`     | `any-long-random-string`                  | Used to sign login tokens              |
| `ADMIN_USERNAME` | `admin`                                   | Your admin login                       |
| `ADMIN_PASSWORD` | `admin123`                                | Your admin password                    |

### Frontend (set on Vercel)

| Variable        | Example                                | Notes                                |
|-----------------|----------------------------------------|--------------------------------------|
| `VITE_API_URL`  | `https://your-backend.onrender.com`    | Your live Render backend URL, no trailing slash |

---

## Run locally (optional)

**Backend**
```bash
cd backend
npm install
cp .env.example .env          # then fill in DATABASE_URL etc.
npm start                     # runs on http://localhost:10000
```

**Frontend** (in a second terminal)
```bash
cd frontend
npm install
cp .env.example .env          # leave VITE_API_URL as localhost for local testing
npm run dev                   # runs on http://localhost:5173
```

---

## Deploy (summary)

1. Push this whole folder to one GitHub repo.
2. Create a Neon project → copy the **pooled** connection string.
3. Render → New **Web Service** → Root Directory `backend`, Build `npm install`,
   Start `npm start`, add the four backend env vars above.
4. Vercel → New Project → Root Directory `frontend`, add `VITE_API_URL` pointing
   at your Render URL.
5. Open the Vercel URL on your phone. Log in as `admin` / `admin123`.

The database tables are created automatically the first time the backend starts.
CORS is already open, so the Vercel frontend can talk to the Render backend with
no extra setup.

> **Note:** Render's free web service sleeps after ~15 minutes of inactivity, so
> the very first request after idle takes ~1 minute to wake up. This is normal.

---

## API overview

| Method | Path                                | Who    | Purpose                          |
|--------|-------------------------------------|--------|----------------------------------|
| POST   | `/api/admin/login`                  | public | Admin login (username + password)|
| POST   | `/api/customer/login`               | public | Customer login (mobile only)     |
| GET    | `/api/dashboard`                    | admin  | 4 dashboard cards                |
| GET    | `/api/customers?search=`            | admin  | List/search customers with dues  |
| POST   | `/api/customers`                    | admin  | Add a customer                   |
| GET    | `/api/customers/:id`                | admin  | One customer + current due       |
| GET    | `/api/customers/:id/transactions`   | admin  | One customer's transactions      |
| POST   | `/api/customers/:id/transactions`   | admin  | Add credit or payment            |
| GET    | `/api/transactions`                 | admin  | All transactions (logs page)     |
| GET    | `/api/admin/profile`                | admin  | Admin username + password        |
| GET    | `/api/customer/me`                  | customer | Logged-in customer + due       |
| GET    | `/api/customer/transactions`        | customer | Logged-in customer's log       |

All money is stored as `NUMERIC(12,2)`. Dates are stored as `TIMESTAMPTZ` and
"today" is calculated in IST (`Asia/Kolkata`).
