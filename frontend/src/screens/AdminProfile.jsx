import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { UserIcon, LogoutIcon } from './Icons.jsx';

export default function AdminProfile({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setError('');
      try {
        setProfile(await api.adminProfile());
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Account</p>
          <h2 className="page-title">Profile</h2>
        </div>
      </header>

      {error && <div className="alert">{error}</div>}

      <div className="profile-card">
        <div className="profile-avatar">
          <UserIcon size={30} />
        </div>
        <div className="profile-role">Administrator</div>

        <div className="profile-row">
          <span className="profile-key">Username</span>
          <span className="profile-val">{profile ? profile.username : '\u2026'}</span>
        </div>

        <div className="profile-row">
          <span className="profile-key">Password</span>
          <span className="profile-val">
            {profile ? (showPassword ? profile.password : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022') : '\u2026'}
            {profile && (
              <button className="link-btn" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            )}
          </span>
        </div>
      </div>

      <button className="btn-logout" onClick={onLogout}>
        <LogoutIcon />
        Log out
      </button>
    </div>
  );
}
