import { motion } from 'motion/react';
import styles from './StepItem.module.css';

const statusIcon = {
  thinking:  '◌',
  executing: '⟳',
  done:      '✓',
  error:     '✕',
};

export default function StepItem({ step, isLast }) {
  const { tool, title, desc, status } = step;
  const icon = statusIcon[status] ?? '◌';

  return (
    <div className={`${styles.item} ${status === 'thinking' ? styles.active : ''}`}>
      <div className={styles.timeline}>
        {/* Status icon with per-status animation */}
        {status === 'done' ? (
          <motion.div
            className={`${styles.icon} ${styles[status]}`}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {icon}
          </motion.div>
        ) : status === 'error' ? (
          <motion.div
            className={`${styles.icon} ${styles[status]}`}
            animate={{ x: [-4, 4, -4, 4, 0] }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            {icon}
          </motion.div>
        ) : (
          <div className={`${styles.icon} ${styles[status]}`}>{icon}</div>
        )}
        {!isLast && <div className={styles.line} />}
      </div>
      <div className={styles.body}>
        <div className={styles.tool}>{tool}()</div>
        <div className={styles.title}>
          {title}
          {status === 'thinking' && <span className={styles.cursor} />}
        </div>
        <div className={styles.desc}>{desc}</div>
      </div>
    </div>
  );
}
