import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header
      className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}
      style={scrolled ? {
        background: 'rgba(10,10,15,0.95)',
        backdropFilter: 'blur(20px)',
      } : {}}
    >
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
          {NAV.map(n => {
            const isActive = location.pathname === n.to;
            return (
              <NavLink
                key={n.to}
                to={n.to}
                className={`${styles.link} ${isActive ? styles.active : ''}`}
                style={{ position: 'relative' }}
              >
                {n.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 8,
                      right: 8,
                      height: '2px',
                      background: '#7C3AED',
                      borderRadius: '2px',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
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
      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.drawer}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to}
                className={({ isActive }) =>
                  `${styles.drawerLink} ${isActive ? styles.drawerActive : ''}`}
              >
                <span className={styles.drawerIcon}>{n.icon}</span>
                {n.label}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
