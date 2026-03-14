import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const patientLinks = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/goals', icon: '🎯', label: 'Goal Tracker' },
    { to: '/profile', icon: '👤', label: 'Profile' },
    { to: '/health-info', icon: 'ℹ️', label: 'Health Info' },
  ];

  const providerLinks = [
    { to: '/provider', icon: '📋', label: 'Dashboard' },
    { to: '/health-info', icon: 'ℹ️', label: 'Health Info' },
  ];

  const links = user?.role === 'provider' ? providerLinks : patientLinks;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>🏥</div>
        <span className={styles.logoText}>HealthPortal</span>
      </div>

      <nav className={styles.nav}>
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            <span className={styles.navIcon}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.userInfo}>
        <div className={styles.userName}>
          {user?.firstName} {user?.lastName}
        </div>
        <div className={styles.userRole}>{user?.role}</div>
      </div>

      <button className={styles.logoutBtn} onClick={handleLogout}>
        <span className={styles.navIcon}>🚪</span>
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
