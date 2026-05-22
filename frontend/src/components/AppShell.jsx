import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AppShell({ title, subtitle, actions, children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems =
    user?.role === 'RENTER'
      ? [
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/cases/new', label: 'Start a Case' }
        ]
      : [{ to: '/dashboard', label: 'Assigned Cases' }];

  return (
    <div className="app-shell">
      <div className="shell-backdrop" />
      <header className="shell-header">
        <div className="brand-lockup">
          <div className="brand-mark">RD</div>
          <div>
            <p className="eyebrow">CSCI370 Renter Dispute Assistant</p>
            <h1>Working case workspace</h1>
          </div>
        </div>

        <div className="top-actions">
          <nav className="top-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  `nav-chip${isActive ? ' is-active' : ''}`
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            className="button button-secondary"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            type="button"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="shell-content">
        <section className="page-hero card">
          <div>
            <p className="eyebrow">{user?.role === 'RENTER' ? 'Renter portal' : 'Landlord portal'}</p>
            <h2>{title}</h2>
            {subtitle ? <p className="hero-copy">{subtitle}</p> : null}
          </div>

          <div className="hero-side">
            <div className="profile-card">
              <span className="profile-role">{user?.role}</span>
              <strong>{user?.fullName}</strong>
              <span>{user?.email}</span>
            </div>
            {actions}
          </div>
        </section>

        {children}
      </main>
    </div>
  );
}

export default AppShell;
