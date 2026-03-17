import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

const NAV = [
  { to: '/dashboard',  label: 'Dashboard',  icon: '▣' },
  { to: '/templates',  label: 'Templates',  icon: '◈' },
  { to: '/analytics',  label: 'Analytics',  icon: '◎' },
  { to: '/history',    label: 'History',    icon: '◷' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>

        {/* Brand */}
        <NavLink to="/dashboard" className={styles.brand}>
          <div className={styles.brandMark}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M3 10 L7 6 L11 14 L15 9" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="15" cy="9" r="2" fill="currentColor"/>
            </svg>
          </div>
          <span className={styles.brandName}>FlowMind</span>
          <span className={styles.brandVersion}>v1.0</span>
        </NavLink>

        {/* Nav links — desktop */}
        <nav className={styles.links} aria-label="Main navigation">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* Right */}
        <div className={styles.right}>
          <div className={styles.liveChip}>
            <span className={styles.liveDot} />
            Gemini 2.0 Flash
          </div>
          <button
            className={styles.hamburger}
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className={styles.drawer}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to}
              className={({ isActive }) =>
                `${styles.drawerLink} ${isActive ? styles.drawerActive : ''}`}
            >
              <span className={styles.drawerIcon}>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
