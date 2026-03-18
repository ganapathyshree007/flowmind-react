import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider } from './context/AuthContext';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: .28, ease: [.25,.46,.45,.94] } },
  exit:    { opacity: 0, y: -6, transition: { duration: .18, ease: 'easeIn' } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: '100vh' }}
      >
        <Routes location={location}>
          <Route path="/login"      element={<Login />} />
          <Route path="/signup"     element={<Signup />} />
          <Route path="/"           element={
            localStorage.getItem('flowmind_token') 
              ? <Navigate to="/dashboard" replace /> 
              : <Navigate to="/login" replace />
          } />
          <Route path="/dashboard"  element={
            localStorage.getItem('flowmind_token')
              ? <Dashboard />
              : <Navigate to="/login" replace />
          } />
          <Route path="/templates"  element={
            localStorage.getItem('flowmind_token')
              ? <Templates />
              : <Navigate to="/login" replace />
          } />
          <Route path="/analytics"  element={
            localStorage.getItem('flowmind_token')
              ? <Analytics />
              : <Navigate to="/login" replace />
          } />
          <Route path="/history"    element={
            localStorage.getItem('flowmind_token')
              ? <History />
              : <Navigate to="/login" replace />
          } />
          <Route path="*"           element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="app-shell">
          <AnimatedRoutes />
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}
