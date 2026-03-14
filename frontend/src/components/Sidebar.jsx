import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, LayoutDashboard, Target, User as UserIcon, Info, LogOut, CheckSquare } from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const patientLinks = [
    { to: '/home', icon: <Home size={20} />, label: 'Home' },
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/goals', icon: <Target size={20} />, label: 'Goal Tracker' },
    { to: '/profile', icon: <UserIcon size={20} />, label: 'Profile' },
    { to: '/health-info', icon: <Info size={20} />, label: 'Health Info' },
  ];

  const providerLinks = [
    { to: '/home', icon: <Home size={20} />, label: 'Home' },
    { to: '/provider', icon: <CheckSquare size={20} />, label: 'Patient Compliance' },
    { to: '/profile', icon: <UserIcon size={20} />, label: 'Profile' },
    { to: '/health-info', icon: <Info size={20} />, label: 'Health Info' },
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
        <span className={styles.navIcon}><LogOut size={20} /></span>
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
