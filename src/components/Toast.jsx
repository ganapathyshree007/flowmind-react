import { useEffect } from 'react';
import styles from './Toast.module.css';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div className={styles.toast}>
      {message}
    </div>
  );
}
