import { useState } from 'react';
import Dashboard from './Dashboard.jsx';
import CustomerList from './CustomerList.jsx';
import CustomerDetail from './CustomerDetail.jsx';
import AddCustomer from './AddCustomer.jsx';
import Logs from './Logs.jsx';
import AdminProfile from './AdminProfile.jsx';
import { HomeIcon, UsersIcon, ListIcon, UserIcon } from './Icons.jsx';

export default function AdminApp({ onLogout }) {
  const [tab, setTab] = useState('home');
  const [selectedId, setSelectedId] = useState(null);

  function openCustomer(id) {
    setSelectedId(id);
    setTab('detail');
  }

  let screen;
  if (tab === 'home') screen = <Dashboard />;
  else if (tab === 'customers') screen = <CustomerList onOpen={openCustomer} />;
  else if (tab === 'detail')
    screen = <CustomerDetail id={selectedId} onBack={() => setTab('customers')} />;
  else if (tab === 'add') screen = <AddCustomer onDone={() => setTab('customers')} />;
  else if (tab === 'logs') screen = <Logs />;
  else if (tab === 'profile') screen = <AdminProfile onLogout={onLogout} />;

  const customersActive = tab === 'customers' || tab === 'detail';

  return (
    <div className="shell">
      <div className="screen">{screen}</div>

      <nav className="tabbar">
        <button className={`tab ${tab === 'home' ? 'active' : ''}`} onClick={() => setTab('home')}>
          <HomeIcon />
          <span>Home</span>
        </button>

        <button
          className={`tab ${customersActive ? 'active' : ''}`}
          onClick={() => setTab('customers')}
        >
          <UsersIcon />
          <span>Customers</span>
        </button>

        <button className="fab" onClick={() => setTab('add')} aria-label="Add customer">
          <span>+</span>
        </button>

        <button className={`tab ${tab === 'logs' ? 'active' : ''}`} onClick={() => setTab('logs')}>
          <ListIcon />
          <span>Logs</span>
        </button>

        <button
          className={`tab ${tab === 'profile' ? 'active' : ''}`}
          onClick={() => setTab('profile')}
        >
          <UserIcon />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}
